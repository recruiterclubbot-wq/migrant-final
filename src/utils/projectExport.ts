const BLOCKED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.data',
  '.playwright-cli',
  '.aistudio',
  '.vite',
  '.cache',
  'coverage',
  'tmp',
  '.next',
]);

const BLOCKED_EXACT_FILES = new Set([
  '.env',
  '.DS_Store',
  'Thumbs.db',
  'notification-settings.json',
  'notification-logs.json',
]);

const BLOCKED_EXTENSIONS = new Set([
  '.pem',
  '.key',
  '.p12',
  '.pfx',
  '.jks',
  '.keystore',
]);

export const MAX_EXPORT_FILE_BYTES = 20 * 1024 * 1024; // 20 MB per file

/**
 * Validates that a normalized POSIX relative path inside the project workspace
 * is safe to include in a Google Drive project export (no traversal, no secrets,
 * no build artifacts or dependencies).
 */
export function isAllowedExportPath(rawPath: string): boolean {
  if (!rawPath || typeof rawPath !== 'string') return false;
  const normalized = rawPath.replace(/\\/g, '/').trim();
  if (!normalized || normalized.startsWith('/') || normalized.endsWith('/')) {
    return false;
  }
  if (normalized.includes('\0')) return false;

  const segments = normalized.split('/');
  for (const seg of segments) {
    if (!seg || seg === '.' || seg === '..') {
      return false;
    }
  }

  for (let i = 0; i < segments.length - 1; i++) {
    if (BLOCKED_DIRS.has(segments[i])) {
      return false;
    }
  }

  const fileName = segments[segments.length - 1];
  const lowerName = fileName.toLowerCase();

  if (BLOCKED_DIRS.has(fileName) || BLOCKED_EXACT_FILES.has(fileName)) {
    return false;
  }

  // Block all .env* files except .env.example
  if (lowerName.startsWith('.env') && lowerName !== '.env.example') {
    return false;
  }

  // Block private keys / service account credentials
  if (
    lowerName.includes('service-account') ||
    lowerName.includes('service_account') ||
    lowerName.includes('credentials') ||
    lowerName.endsWith('.secret')
  ) {
    return false;
  }

  const dotIdx = lowerName.lastIndexOf('.');
  if (dotIdx !== -1) {
    const ext = lowerName.slice(dotIdx);
    if (BLOCKED_EXTENSIONS.has(ext)) {
      return false;
    }
  }

  return true;
}

export function guessMimeType(relPath: string): string {
  const lower = relPath.toLowerCase();
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'text/typescript';
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) {
    return 'application/javascript';
  }
  if (lower.endsWith('.json')) return 'application/json';
  if (lower.endsWith('.css')) return 'text/css';
  if (lower.endsWith('.html')) return 'text/html';
  if (lower.endsWith('.md')) return 'text/markdown';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.ico')) return 'image/x-icon';
  if (lower.endsWith('.xml')) return 'application/xml';
  if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'text/yaml';
  if (lower.endsWith('.rules') || lower.endsWith('.txt') || lower.endsWith('.example')) {
    return 'text/plain';
  }
  return 'application/octet-stream';
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 Б';
  if (bytes < 1024) return `${Math.round(bytes)} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}

export function sanitizeDriveFolderName(raw: string, fallbackDate?: string): string {
  const dateStr = fallbackDate || new Date().toISOString().slice(0, 10);
  const cleaned = raw
    .replace(/[\x00-\x1F\x7F/\\:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return cleaned || `MIGRANT-Project-${dateStr}`;
}

/**
 * Returns unique parent directory paths sorted from shallowest to deepest
 * so Drive folders can be created parent-first.
 */
export function collectDirectoryPaths(filePaths: string[]): string[] {
  const dirSet = new Set<string>();
  for (const filePath of filePaths) {
    const normalized = filePath.replace(/\\/g, '/');
    const parts = normalized.split('/');
    if (parts.length <= 1) continue;
    let acc = '';
    for (let i = 0; i < parts.length - 1; i++) {
      acc = acc ? `${acc}/${parts[i]}` : parts[i];
      dirSet.add(acc);
    }
  }
  return Array.from(dirSet).sort((a, b) => {
    const depthDiff = a.split('/').length - b.split('/').length;
    return depthDiff !== 0 ? depthDiff : a.localeCompare(b);
  });
}

export function isSafeDriveFolderUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === 'drive.google.com';
  } catch {
    return false;
  }
}
