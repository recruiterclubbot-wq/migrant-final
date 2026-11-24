import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  ExternalLink,
  FileCode2,
  FolderOpen,
  FolderPlus,
  HardDrive,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  collectDirectoryPaths,
  formatBytes,
  isSafeDriveFolderUrl,
  sanitizeDriveFolderName,
} from '../utils/projectExport';
import { AdminConfirmDialog } from './AdminVacancyModal';

interface ProjectFileEntry {
  path: string;
  size: number;
  mimeType: string;
}

interface ExportFailure {
  path: string;
  reason: string;
}

interface AdminDriveExportTabProps {
  onNotify: (message: string) => void;
}

function GoogleSignInLogo() {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="w-5 h-5 shrink-0 block"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

async function createDriveFolder(
  accessToken: string,
  name: string,
  parentId?: string,
  signal?: AbortSignal
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const metadata: Record<string, unknown> = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const res = await fetch(
    'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
      signal,
    }
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    const err = new Error(`Google Drive (${res.status}): ${errBody.slice(0, 140)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  return res.json();
}

async function uploadFileToDrive(
  accessToken: string,
  fileName: string,
  parentId: string,
  mimeType: string,
  contentBytes: ArrayBuffer,
  signal?: AbortSignal
): Promise<void> {
  const boundary = `migrant_drive_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const metadata = JSON.stringify({
    name: fileName,
    parents: [parentId],
  });

  const bodyBlob = new Blob(
    [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
      `--${boundary}\r\nContent-Type: ${mimeType || 'application/octet-stream'}\r\n\r\n`,
      contentBytes,
      `\r\n--${boundary}--`,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: bodyBlob,
      signal,
    }
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    const err = new Error(`Google Drive (${res.status}): ${errBody.slice(0, 140)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
}

export function AdminDriveExportTab({ onNotify }: AdminDriveExportTabProps) {
  const { driveAccessToken, connectGoogleDrive, clearDriveToken, authError } = useAuth();

  const [files, setFiles] = useState<ProjectFileEntry[]>([]);
  const [totalBytes, setTotalBytes] = useState(0);
  const [loadingManifest, setLoadingManifest] = useState(false);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [fileSearch, setFileSearch] = useState('');

  const [folderNameInput, setFolderNameInput] = useState(
    () => `MIGRANT-Project-${new Date().toISOString().slice(0, 10)}`
  );
  const [connectingDrive, setConnectingDrive] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Upload execution state
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalToUpload, setTotalToUpload] = useState(0);
  const [currentItemLabel, setCurrentItemLabel] = useState('');
  const [failures, setFailures] = useState<ExportFailure[]>([]);
  const [createdFolderId, setCreatedFolderId] = useState<string | null>(null);
  const [createdFolderUrl, setCreatedFolderUrl] = useState<string | null>(null);
  const [createdFolderName, setCreatedFolderName] = useState<string | null>(null);
  const [folderMapSnapshot, setFolderMapSnapshot] = useState<Map<string, string>>(new Map());
  const [uploadAborted, setUploadAborted] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const loadManifest = async () => {
    if (!auth.currentUser) return;
    setLoadingManifest(true);
    setManifestError(null);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch('/api/admin/project-files', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Ошибка сервера (${res.status})`);
      }
      const data = await res.json();
      setFiles(Array.isArray(data.files) ? data.files : []);
      setTotalBytes(Number(data.totalBytes || 0));
    } catch (err) {
      setManifestError(err instanceof Error ? err.message : 'Не удалось загрузить список файлов');
    } finally {
      setLoadingManifest(false);
    }
  };

  useEffect(() => {
    loadManifest();
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const directoryPaths = useMemo(
    () => collectDirectoryPaths(files.map((f) => f.path)),
    [files]
  );

  const filteredFiles = useMemo(() => {
    const q = fileSearch.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.path.toLowerCase().includes(q));
  }, [files, fileSearch]);

  const safeFolderName = sanitizeDriveFolderName(folderNameInput);

  const handleConnectDrive = async () => {
    setConnectingDrive(true);
    setExportError(null);
    try {
      const token = await connectGoogleDrive();
      if (token) {
        onNotify('Google Диск успешно подключён');
      }
    } finally {
      setConnectingDrive(false);
    }
  };

  const runFullExport = async () => {
    setConfirmOpen(false);
    if (!auth.currentUser || files.length === 0) return;

    let accessToken = driveAccessToken;
    if (!accessToken) {
      accessToken = await connectGoogleDrive();
      if (!accessToken) return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setUploading(true);
    setUploadAborted(false);
    setExportError(null);
    setFailures([]);
    setUploadedCount(0);
    setTotalToUpload(files.length);
    setCreatedFolderId(null);
    setCreatedFolderUrl(null);
    setCreatedFolderName(safeFolderName);

    try {
      const idToken = await auth.currentUser.getIdToken();

      // 1. Create root folder in My Drive
      setCurrentItemLabel(`Создание папки «${safeFolderName}»...`);
      const rootFolder = await createDriveFolder(
        accessToken,
        safeFolderName,
        undefined,
        controller.signal
      );

      const folderIds = new Map<string, string>();
      folderIds.set('', rootFolder.id);
      setCreatedFolderId(rootFolder.id);
      const fallbackUrl = `https://drive.google.com/drive/folders/${encodeURIComponent(rootFolder.id)}`;
      setCreatedFolderUrl(
        isSafeDriveFolderUrl(rootFolder.webViewLink) ? rootFolder.webViewLink! : fallbackUrl
      );

      // 2. Create all nested project subfolders in parent-first order
      for (const dirPath of directoryPaths) {
        if (controller.signal.aborted) break;
        const slashIdx = dirPath.lastIndexOf('/');
        const parentRel = slashIdx === -1 ? '' : dirPath.slice(0, slashIdx);
        const dirName = slashIdx === -1 ? dirPath : dirPath.slice(slashIdx + 1);
        const parentId = folderIds.get(parentRel) || rootFolder.id;

        setCurrentItemLabel(`Создание подпапки: ${dirPath}`);
        const subFolder = await createDriveFolder(
          accessToken,
          dirName,
          parentId,
          controller.signal
        );
        folderIds.set(dirPath, subFolder.id);
      }

      setFolderMapSnapshot(new Map(folderIds));

      // 3. Upload each file into its exact parent folder
      const localFailures: ExportFailure[] = [];
      let done = 0;

      for (const file of files) {
        if (controller.signal.aborted) {
          setUploadAborted(true);
          break;
        }

        setCurrentItemLabel(file.path);
        try {
          const contentRes = await fetch(
            `/api/admin/project-files/content?path=${encodeURIComponent(file.path)}`,
            {
              headers: { Authorization: `Bearer ${idToken}` },
              signal: controller.signal,
            }
          );
          if (!contentRes.ok) {
            throw new Error(`Чтение файла (${contentRes.status})`);
          }
          const buffer = await contentRes.arrayBuffer();

          const slashIdx = file.path.lastIndexOf('/');
          const parentRel = slashIdx === -1 ? '' : file.path.slice(0, slashIdx);
          const fileName = slashIdx === -1 ? file.path : file.path.slice(slashIdx + 1);
          const parentId = folderIds.get(parentRel) || rootFolder.id;

          await uploadFileToDrive(
            accessToken,
            fileName,
            parentId,
            file.mimeType,
            buffer,
            controller.signal
          );
          done += 1;
          setUploadedCount(done);
        } catch (err) {
          if (controller.signal.aborted) {
            setUploadAborted(true);
            break;
          }
          const status = (err as Error & { status?: number })?.status;
          if (status === 401) {
            clearDriveToken();
            throw new Error('Срок действия токена Google Диска истёк. Подключите Google Диск заново.');
          }
          localFailures.push({
            path: file.path,
            reason: err instanceof Error ? err.message : 'Ошибка загрузки',
          });
          setFailures([...localFailures]);
        }
      }

      if (!controller.signal.aborted) {
        if (localFailures.length === 0) {
          onNotify(`Все ${done} файлов выгружены в папку «${safeFolderName}» на Google Диске`);
        } else {
          onNotify(`Выгружено ${done} из ${files.length} файлов (ошибок: ${localFailures.length})`);
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        const status = (err as Error & { status?: number })?.status;
        if (status === 401) {
          clearDriveToken();
          setExportError('Сессия Google Диска истекла. Нажмите «Подключить Google Диск» и повторите.');
        } else {
          setExportError(err instanceof Error ? err.message : 'Ошибка выгрузки на Google Диск');
        }
      }
    } finally {
      setUploading(false);
      setCurrentItemLabel('');
      abortRef.current = null;
    }
  };

  const handleRetryFailed = async () => {
    if (!auth.currentUser || !createdFolderId || failures.length === 0) return;
    let accessToken = driveAccessToken;
    if (!accessToken) {
      accessToken = await connectGoogleDrive();
      if (!accessToken) return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setUploading(true);
    setExportError(null);

    const retryPaths = new Set(failures.map((f) => f.path));
    const retryFiles = files.filter((f) => retryPaths.has(f.path));
    const remainingFailures: ExportFailure[] = [];

    try {
      const idToken = await auth.currentUser.getIdToken();
      let recovered = 0;

      for (const file of retryFiles) {
        if (controller.signal.aborted) break;
        setCurrentItemLabel(`Повтор: ${file.path}`);
        try {
          const contentRes = await fetch(
            `/api/admin/project-files/content?path=${encodeURIComponent(file.path)}`,
            {
              headers: { Authorization: `Bearer ${idToken}` },
              signal: controller.signal,
            }
          );
          if (!contentRes.ok) throw new Error(`Чтение файла (${contentRes.status})`);
          const buffer = await contentRes.arrayBuffer();

          const slashIdx = file.path.lastIndexOf('/');
          const parentRel = slashIdx === -1 ? '' : file.path.slice(0, slashIdx);
          const fileName = slashIdx === -1 ? file.path : file.path.slice(slashIdx + 1);
          const parentId = folderMapSnapshot.get(parentRel) || createdFolderId;

          await uploadFileToDrive(
            accessToken,
            fileName,
            parentId,
            file.mimeType,
            buffer,
            controller.signal
          );
          recovered += 1;
          setUploadedCount((prev) => prev + 1);
        } catch (err) {
          remainingFailures.push({
            path: file.path,
            reason: err instanceof Error ? err.message : 'Ошибка загрузки',
          });
        }
      }

      setFailures(remainingFailures);
      if (remainingFailures.length === 0 && recovered > 0) {
        onNotify(`Успешно догружены все оставшиеся файлы (${recovered})`);
      }
    } finally {
      setUploading(false);
      setCurrentItemLabel('');
      abortRef.current = null;
    }
  };

  const progressPct =
    totalToUpload > 0 ? Math.min(100, Math.round((uploadedCount / totalToUpload) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Connection & Export Controls */}
      <div className="lg:col-span-7 migrant-card rounded-3xl p-6 space-y-5">
        <div className="flex items-start gap-3.5">
          <div className="migrant-icon-pedestal w-12 h-12 rounded-2xl flex items-center justify-center text-[#1448A0] shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0B224C]">
              Выгрузка всех файлов проекта на Google Диск
            </h2>
            <p className="text-xs sm:text-sm text-[#3B527A] mt-0.5 leading-relaxed">
              Создаёт отдельную папку на вашем Google Диске и копирует туда весь исходный код, стили, конфигурацию и графические ассеты с сохранением полной структуры подпапок.
            </p>
          </div>
        </div>

        {/* Google Drive Auth Status */}
        <div className="p-4 rounded-2xl bg-white/85 border border-[#DCEBFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {driveAccessToken ? (
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
            ) : (
              <CloudUpload className="w-5 h-5 text-[#1448A0] shrink-0" />
            )}
            <div>
              <p className="text-sm font-bold text-[#0B224C]">
                {driveAccessToken ? 'Google Диск подключён' : 'Требуется доступ к Google Диску'}
              </p>
              <p className="text-xs text-[#546B91]">
                {driveAccessToken
                  ? 'Токен хранится только в оперативной памяти браузера до закрытия вкладки.'
                  : 'Нажмите кнопку ниже, чтобы выдать разрешение на создание папки и загрузку файлов.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={connectingDrive || uploading}
            onClick={handleConnectDrive}
            className="bg-white hover:bg-[#F8FAFC] text-[#1F1F1F] border border-[#747775]/45 shadow-2xs rounded-full px-4 py-2 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60 whitespace-nowrap"
          >
            <GoogleSignInLogo />
            <span>
              {connectingDrive
                ? 'Подключение...'
                : driveAccessToken
                  ? 'Обновить доступ'
                  : 'Sign in with Google'}
            </span>
          </button>
        </div>

        {(authError || exportError || manifestError) && (
          <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{exportError || manifestError || authError}</span>
          </div>
        )}

        {/* Folder Name Input */}
        <div className="space-y-2">
          <label
            htmlFor="drive-folder-name"
            className="block text-xs font-semibold text-[#1E355E]"
          >
            Название новой папки на Google Диске
          </label>
          <div className="relative">
            <FolderPlus className="w-4 h-4 text-[#546B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="drive-folder-name"
              type="text"
              maxLength={80}
              disabled={uploading}
              value={folderNameInput}
              onChange={(e) => setFolderNameInput(e.target.value)}
              placeholder="MIGRANT-Project-2026-11-24"
              className="migrant-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium"
            />
          </div>
          <p className="text-[11px] text-[#546B91]">
            Будет создана папка: <span className="font-semibold text-[#0B224C]">{safeFolderName}</span> ({directoryPaths.length} подпапок, {files.length} файлов, {formatBytes(totalBytes)})
          </p>
        </div>

        {/* Security Note */}
        <div className="p-3.5 rounded-2xl bg-[#EFF6FF]/85 border border-[#BFDBFE] text-xs text-[#1E3A8A] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#1448A0]" />
          <p className="leading-relaxed">
            Защита секретов активна: служебные каталоги (<code>node_modules</code>, <code>.git</code>, <code>dist</code>) и файлы с секретами (<code>.env</code>, настройки SMTP/Telegram) автоматически исключены из выгрузки.
          </p>
        </div>

        {/* Primary Export Action */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {!uploading ? (
            <button
              type="button"
              disabled={loadingManifest || files.length === 0 || !driveAccessToken}
              onClick={() => setConfirmOpen(true)}
              className="migrant-btn-primary text-white text-sm font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 cursor-pointer disabled:opacity-55"
            >
              <CloudUpload className="w-4 h-4" />
              <span>Выгрузить проект на Google Диск</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] text-sm font-semibold px-5 py-2.5 rounded-full inline-flex items-center gap-2 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Остановить выгрузку</span>
            </button>
          )}

          <button
            type="button"
            disabled={loadingManifest || uploading}
            onClick={loadManifest}
            className="migrant-btn-secondary text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingManifest ? 'animate-spin' : ''}`} />
            <span>Обновить список</span>
          </button>
        </div>

        {/* Live Progress Panel */}
        {(uploading || uploadedCount > 0 || uploadAborted) && (
          <div className="p-4 rounded-2xl bg-white border border-[#DCEBFF] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#0B224C] inline-flex items-center gap-2">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1448A0]" />
                ) : failures.length === 0 && !uploadAborted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#D97706]" />
                )}
                <span>
                  {uploading
                    ? 'Идёт выгрузка на Google Диск...'
                    : uploadAborted
                      ? 'Выгрузка остановлена пользователем'
                      : failures.length === 0
                        ? `Готово! Папка «${createdFolderName}» создана`
                        : 'Выгрузка завершена с частичными ошибками'}
                </span>
              </span>
              <span className="font-mono tabular-nums text-[#1448A0]">
                {uploadedCount} / {totalToUpload} ({progressPct}%)
              </span>
            </div>

            <div className="h-2.5 rounded-full bg-[#E6F0FF] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#1448A0] transition-all duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {currentItemLabel && (
              <p className="text-[11px] font-mono text-[#546B91] truncate">
                {currentItemLabel}
              </p>
            )}

            {createdFolderUrl && isSafeDriveFolderUrl(createdFolderUrl) && !uploading && (
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <a
                  href={createdFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="migrant-btn-primary text-white text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Открыть папку в Google Диске</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {failures.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryFailed}
                    className="migrant-btn-secondary text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Повторить ошибочные ({failures.length})</span>
                  </button>
                )}
              </div>
            )}

            {failures.length > 0 && (
              <div className="mt-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] max-h-36 overflow-y-auto space-y-1">
                {failures.map((f) => (
                  <p key={f.path} className="text-[11px] text-[#B91C1C] font-mono">
                    {f.path}: {f.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Project Files Manifest Preview */}
      <div className="lg:col-span-5 migrant-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-[#0B224C] inline-flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-[#1448A0]" />
            <span>Состав выгрузки</span>
          </h3>
          <span className="text-xs font-mono tabular-nums text-[#546B91]">
            {files.length} файлов · {formatBytes(totalBytes)}
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#546B91] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={fileSearch}
            onChange={(e) => setFileSearch(e.target.value)}
            placeholder="Фильтр файлов по пути..."
            className="migrant-input w-full pl-9 pr-3.5 py-2 rounded-xl text-xs"
          />
        </div>

        {loadingManifest ? (
          <div className="py-10 text-center text-xs text-[#546B91] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Сканирование файлов проекта...</span>
          </div>
        ) : (
          <div className="bg-white/90 rounded-2xl border border-[#DCEBFF] divide-y divide-[#EEF5FF] max-h-[380px] overflow-y-auto">
            {filteredFiles.length === 0 ? (
              <p className="p-4 text-xs text-center text-[#546B91]">Файлы не найдены</p>
            ) : (
              filteredFiles.map((f) => (
                <div
                  key={f.path}
                  className="px-3.5 py-2 flex items-center justify-between gap-2 text-xs hover:bg-[#F7FAFF]"
                >
                  <span className="font-mono text-[#0B224C] truncate" title={f.path}>
                    {f.path}
                  </span>
                  <span className="font-mono tabular-nums text-[#546B91] shrink-0 text-[11px]">
                    {formatBytes(f.size)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Mandatory Confirmation Dialog before mutating Google Drive */}
      <AdminConfirmDialog
        open={confirmOpen}
        tone="primary"
        title="Подтвердите выгрузку на Google Диск"
        description={`В вашем Google Диске будет создана новая папка «${safeFolderName}» (${directoryPaths.length} подпапок) и загружено ${files.length} файлов проекта общим размером ${formatBytes(totalBytes)}. Продолжить?`}
        confirmLabel="Подтвердить выгрузку"
        busy={uploading}
        onConfirm={runFullExport}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
