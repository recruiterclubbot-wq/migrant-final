import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import 'dotenv/config';
import {
  guessMimeType,
  isAllowedExportPath,
  MAX_EXPORT_FILE_BYTES,
} from './src/utils/projectExport.ts';

const PORT = Number(process.env.PORT || 3000);
const PROJECT_ROOT = path.resolve(process.cwd());
const DATA_DIR = path.resolve(process.cwd(), '.data');
const SETTINGS_FILE = path.join(DATA_DIR, 'notification-settings.json');
const LOGS_FILE = path.join(DATA_DIR, 'notification-logs.json');

interface ServerNotificationSettings {
  telegramBotToken: string;
  telegramChatId: string;
  adminNotificationEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
}

interface DeliveryLog {
  id: string;
  createdAt: string;
  leadName: string;
  leadType: string;
  telegramStatus: 'sent' | 'skipped' | 'error';
  emailStatus: 'sent' | 'skipped' | 'error';
  detail: string;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readSettings(): ServerNotificationSettings {
  ensureDataDir();
  const defaults: ServerNotificationSettings = {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  };

  if (!fs.existsSync(SETTINGS_FILE)) {
    return defaults;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    return {
      ...defaults,
      ...raw,
      smtpPort: Number(raw.smtpPort || defaults.smtpPort || 587),
    };
  } catch {
    return defaults;
  }
}

function writeSettings(next: ServerNotificationSettings): void {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(next, null, 2), 'utf8');
}

function readLogs(): DeliveryLog[] {
  ensureDataDir();
  if (!fs.existsSync(LOGS_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function appendLog(entry: DeliveryLog): void {
  ensureDataDir();
  const existing = readLogs();
  const updated = [entry, ...existing].slice(0, 30);
  fs.writeFileSync(LOGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
}

function loadFirebaseConfig(): { projectId: string; firestoreDatabaseId: string } {
  const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  const raw = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  return {
    projectId: String(raw.projectId || ''),
    firestoreDatabaseId: String(
      raw.firestoreDatabaseId || 'ai-studio-remixremixmigran-0b8f91f4-1ab3-4440-a1c5-e44dd8189419'
    ),
  };
}

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

async function verifyAdminRequest(req: express.Request): Promise<{ uid: string; email: string } | null> {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const { projectId, firestoreDatabaseId } = loadFirebaseConfig();
  if (!projectId) return null;

  try {
    const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    const uid = typeof payload.sub === 'string' ? payload.sub : '';
    const email = typeof payload.email === 'string' ? payload.email : '';
    const emailVerified = payload.email_verified === true;
    if (!uid || !emailVerified) return null;

    if (email === 'otzyvtyt@gmail.com' || email === 'recruiterclub.bot@gmail.com') {
      return { uid, email };
    }

    const dbId = encodeURIComponent(firestoreDatabaseId);
    const adminDocUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/admins/${encodeURIComponent(uid)}`;
    const res = await fetch(adminDocUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      return { uid, email };
    }
    return null;
  } catch {
    return null;
  }
}

function formatLeadNotification(body: Record<string, unknown>): {
  subject: string;
  text: string;
} {
  const type = String(body.type || 'consultation');
  const fullName = String(body.fullName || '').trim();
  const phone = String(body.phone || '').trim();
  const email = String(body.email || '').trim();
  const country = String(body.country || '').trim();
  const companyName = String(body.companyName || '').trim();
  const staffCount = String(body.staffCount || '').trim();
  const vacancyTitle = String(body.vacancyTitle || '').trim();
  const comment = String(body.comment || '').trim();

  const typeLabel =
    type === 'b2b_request'
      ? 'B2B-заявка на подбор персонала'
      : type === 'job_application'
        ? 'Отклик соискателя на вакансию'
        : 'Запрос на консультацию';

  const lines = [
    `MIGRANT — ${typeLabel}`,
    `Контакт: ${fullName}`,
    `Телефон: ${phone}`,
  ];
  if (email) lines.push(`Email: ${email}`);
  if (companyName) lines.push(`Компания: ${companyName}`);
  if (staffCount) lines.push(`Количество сотрудников: ${staffCount}`);
  if (country) lines.push(`Страна: ${country}`);
  if (vacancyTitle) lines.push(`Вакансия: ${vacancyTitle}`);
  if (comment) lines.push(`Комментарий: ${comment}`);

  return {
    subject: `[MIGRANT] ${typeLabel}: ${fullName}`,
    text: lines.join('\n'),
  };
}

async function dispatchNotifications(
  settings: ServerNotificationSettings,
  subject: string,
  text: string,
  leadName: string,
  leadType: string
): Promise<DeliveryLog> {
  let telegramStatus: 'sent' | 'skipped' | 'error' = 'skipped';
  let emailStatus: 'sent' | 'skipped' | 'error' = 'skipped';
  const details: string[] = [];

  if (settings.telegramBotToken && settings.telegramChatId) {
    try {
      const tgUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
      const tgRes = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text,
        }),
      });
      if (tgRes.ok) {
        telegramStatus = 'sent';
        details.push('Telegram: отправлено');
      } else {
        telegramStatus = 'error';
        const errText = await tgRes.text();
        details.push(`Telegram ошибка (${tgRes.status}): ${errText.slice(0, 120)}`);
      }
    } catch (err) {
      telegramStatus = 'error';
      details.push(`Telegram сеть: ${err instanceof Error ? err.message : 'ошибка'}`);
    }
  } else {
    details.push('Telegram не настроен');
  }

  if (
    settings.adminNotificationEmail &&
    settings.smtpHost &&
    settings.smtpUser &&
    settings.smtpPass
  ) {
    try {
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort || 587,
        secure: settings.smtpPort === 465,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass,
        },
      });
      await transporter.sendMail({
        from: settings.smtpFrom || settings.smtpUser,
        to: settings.adminNotificationEmail,
        subject,
        text,
      });
      emailStatus = 'sent';
      details.push('Email: отправлено');
    } catch (err) {
      emailStatus = 'error';
      details.push(`Email ошибка: ${err instanceof Error ? err.message : 'ошибка'}`);
    }
  } else {
    details.push('Email SMTP не настроен');
  }

  const logEntry: DeliveryLog = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    leadName,
    leadType,
    telegramStatus,
    emailStatus,
    detail: details.join(' · '),
  };
  appendLog(logEntry);
  return logEntry;
}

function getBaseUrl(req: express.Request): string {
  const configured = (process.env.APP_URL || '').trim();
  if (configured && configured !== 'MY_APP_URL') {
    return configured.replace(/\/+$/, '');
  }
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  return `${proto}://${host}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  // SEO: robots.txt
  app.get('/robots.txt', (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /cabinet',
        'Disallow: /api/',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n')
    );
  });

  // SEO: sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = getBaseUrl(req);
    const routes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/vacancies', priority: '0.9', changefreq: 'daily' },
      { path: '/business', priority: '0.9', changefreq: 'weekly' },
      { path: '/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/contacts', priority: '0.7', changefreq: 'monthly' },
    ];
    const lastmod = new Date().toISOString().slice(0, 10);
    const urls = routes
      .map(
        (r) =>
          `  <url>\n    <loc>${baseUrl}${r.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
      )
      .join('\n');

    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
    );
  });

  // Public lead notification webhook (called when lead/application is created)
  app.post('/api/leads/notify', async (req, res) => {
    const body = req.body || {};
    const fullName = String(body.fullName || '').trim();
    const phone = String(body.phone || '').trim();
    if (fullName.length < 2 || phone.replace(/\D/g, '').length < 7) {
      res.status(400).json({ ok: false, error: 'Некорректные данные заявки' });
      return;
    }

    const settings = readSettings();
    const { subject, text } = formatLeadNotification(body);
    const logEntry = await dispatchNotifications(
      settings,
      subject,
      text,
      fullName,
      String(body.type || 'consultation')
    );

    res.json({
      ok: true,
      telegramStatus: logEntry.telegramStatus,
      emailStatus: logEntry.emailStatus,
    });
  });

  // Protected Admin Settings: Read summary (never returns secret tokens/passwords)
  app.get('/api/admin/settings', async (req, res) => {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      res.status(403).json({ error: 'Доступ разрешён только администраторам' });
      return;
    }

    const settings = readSettings();
    res.json({
      telegramConfigured: Boolean(settings.telegramBotToken && settings.telegramChatId),
      telegramChatId: settings.telegramChatId,
      emailConfigured: Boolean(
        settings.adminNotificationEmail &&
          settings.smtpHost &&
          settings.smtpUser &&
          settings.smtpPass
      ),
      adminNotificationEmail: settings.adminNotificationEmail,
      smtpHost: settings.smtpHost,
      smtpPort: settings.smtpPort,
      smtpUser: settings.smtpUser,
      publicAppUrl: getBaseUrl(req),
      recentLogs: readLogs(),
    });
  });

  // Protected Admin Settings: Update Telegram / SMTP settings
  app.post('/api/admin/settings', async (req, res) => {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      res.status(403).json({ error: 'Доступ разрешён только администраторам' });
      return;
    }

    const current = readSettings();
    const body = req.body || {};

    const updated: ServerNotificationSettings = {
      telegramBotToken:
        typeof body.telegramBotToken === 'string' && body.telegramBotToken.trim()
          ? body.telegramBotToken.trim()
          : current.telegramBotToken,
      telegramChatId:
        typeof body.telegramChatId === 'string'
          ? body.telegramChatId.trim()
          : current.telegramChatId,
      adminNotificationEmail:
        typeof body.adminNotificationEmail === 'string'
          ? body.adminNotificationEmail.trim()
          : current.adminNotificationEmail,
      smtpHost:
        typeof body.smtpHost === 'string' ? body.smtpHost.trim() : current.smtpHost,
      smtpPort: body.smtpPort ? Number(body.smtpPort) : current.smtpPort,
      smtpUser:
        typeof body.smtpUser === 'string' ? body.smtpUser.trim() : current.smtpUser,
      smtpPass:
        typeof body.smtpPass === 'string' && body.smtpPass.trim()
          ? body.smtpPass.trim()
          : current.smtpPass,
      smtpFrom:
        typeof body.smtpFrom === 'string' && body.smtpFrom.trim()
          ? body.smtpFrom.trim()
          : current.smtpFrom,
    };

    writeSettings(updated);
    res.json({ ok: true });
  });

  // Protected Admin Test Notification
  app.post('/api/admin/settings/test', async (req, res) => {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      res.status(403).json({ error: 'Доступ разрешён только администраторам' });
      return;
    }

    const settings = readSettings();
    const logEntry = await dispatchNotifications(
      settings,
      '[MIGRANT] Тестовое уведомление администратора',
      `Тестовая проверка уведомлений MIGRANT.\nАдминистратор: ${admin.email}\nВремя: ${new Date().toISOString()}`,
      `Тест (${admin.email})`,
      'consultation'
    );
    res.json({ ok: true, logEntry });
  });

  // Protected Admin Project Export: List safe project files (excludes secrets, .env, node_modules, .git, dist)
  app.get('/api/admin/project-files', async (req, res) => {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      res.status(403).json({ error: 'Доступ разрешён только администраторам' });
      return;
    }

    const rootReal = fs.realpathSync(PROJECT_ROOT);
    const files: { path: string; size: number; mimeType: string }[] = [];
    let totalBytes = 0;

    const walk = (dirAbs: string, relPrefix: string) => {
      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dirAbs, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (entry.isSymbolicLink()) continue;
        const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
        const fullPath = path.join(dirAbs, entry.name);

        if (entry.isDirectory()) {
          // Skip blocked directories early
          if (!isAllowedExportPath(`${relPath}/placeholder.txt`)) continue;
          walk(fullPath, relPath);
        } else if (entry.isFile()) {
          if (!isAllowedExportPath(relPath)) continue;
          try {
            const realFile = fs.realpathSync(fullPath);
            if (!realFile.startsWith(rootReal + path.sep)) continue;
            const stat = fs.statSync(realFile);
            if (stat.size > MAX_EXPORT_FILE_BYTES) continue;
            files.push({
              path: relPath,
              size: stat.size,
              mimeType: guessMimeType(relPath),
            });
            totalBytes += stat.size;
          } catch {
            // skip unreadable files
          }
        }
      }
    };

    walk(rootReal, '');
    files.sort((a, b) => a.path.localeCompare(b.path));
    res.setHeader('Cache-Control', 'no-store');
    res.json({ count: files.length, totalBytes, files });
  });

  // Protected Admin Project Export: Fetch raw bytes of a single validated project file
  app.get('/api/admin/project-files/content', async (req, res) => {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      res.status(403).json({ error: 'Доступ разрешён только администраторам' });
      return;
    }

    const rawPath = typeof req.query.path === 'string' ? req.query.path : '';
    const relPath = rawPath.replace(/\\/g, '/').trim();
    if (!isAllowedExportPath(relPath)) {
      res.status(400).json({ error: 'Недопустимый путь к файлу' });
      return;
    }

    const rootReal = fs.realpathSync(PROJECT_ROOT);
    const resolved = path.resolve(rootReal, relPath);
    if (!resolved.startsWith(rootReal + path.sep)) {
      res.status(400).json({ error: 'Путь выходит за пределы проекта' });
      return;
    }

    try {
      const realTarget = fs.realpathSync(resolved);
      if (!realTarget.startsWith(rootReal + path.sep)) {
        res.status(403).json({ error: 'Доступ к файлу запрещён' });
        return;
      }
      const stat = fs.statSync(realTarget);
      if (!stat.isFile() || stat.size > MAX_EXPORT_FILE_BYTES) {
        res.status(400).json({ error: 'Файл недоступен для выгрузки' });
        return;
      }

      const content = fs.readFileSync(realTarget);
      res.setHeader('Content-Type', guessMimeType(relPath));
      res.setHeader('Cache-Control', 'no-store');
      res.send(content);
    } catch {
      res.status(404).json({ error: 'Файл не найден' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MIGRANT server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
