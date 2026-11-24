import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  collectDirectoryPaths,
  formatBytes,
  guessMimeType,
  isAllowedExportPath,
  isSafeDriveFolderUrl,
  sanitizeDriveFolderName,
} from './projectExport.ts';

describe('projectExport utilities', () => {
  it('allows normal project source and asset files while blocking secrets and build dirs', () => {
    assert.equal(isAllowedExportPath('src/App.tsx'), true);
    assert.equal(isAllowedExportPath('public/assets/migrant/hero-duo-cutout.png'), true);
    assert.equal(isAllowedExportPath('package.json'), true);
    assert.equal(isAllowedExportPath('.env.example'), true);
    assert.equal(isAllowedExportPath('firestore.rules'), true);

    assert.equal(isAllowedExportPath('.env'), false);
    assert.equal(isAllowedExportPath('.env.local'), false);
    assert.equal(isAllowedExportPath('.env.production'), false);
    assert.equal(isAllowedExportPath('node_modules/react/index.js'), false);
    assert.equal(isAllowedExportPath('.git/config'), false);
    assert.equal(isAllowedExportPath('.data/notification-settings.json'), false);
    assert.equal(isAllowedExportPath('dist/index.html'), false);
    assert.equal(isAllowedExportPath('../etc/passwd'), false);
    assert.equal(isAllowedExportPath('src/../../secret.txt'), false);
    assert.equal(isAllowedExportPath('/etc/passwd'), false);
    assert.equal(isAllowedExportPath('private.pem'), false);
    assert.equal(isAllowedExportPath('google-service-account.json'), false);
  });

  it('collects unique directory paths in parent-before-child topological order', () => {
    const dirs = collectDirectoryPaths([
      'index.html',
      'src/App.tsx',
      'src/components/AdminDashboard.tsx',
      'public/assets/migrant/hero-duo-cutout.png',
      'src/utils/projectExport.ts',
    ]);
    assert.deepEqual(dirs, [
      'public',
      'src',
      'public/assets',
      'src/components',
      'src/utils',
      'public/assets/migrant',
    ]);
  });

  it('sanitizes Drive folder names and formats bytes/MIME types accurately', () => {
    assert.equal(
      sanitizeDriveFolderName('  MIGRANT / Backup : 2026  ', '2026-11-24'),
      'MIGRANT Backup 2026'
    );
    assert.equal(sanitizeDriveFolderName('   ///   ', '2026-11-24'), 'MIGRANT-Project-2026-11-24');
    assert.equal(guessMimeType('public/hero.png'), 'image/png');
    assert.equal(guessMimeType('src/App.tsx'), 'text/typescript');
    assert.equal(formatBytes(512), '512 Б');
    assert.equal(formatBytes(2048), '2.0 КБ');
    assert.equal(isSafeDriveFolderUrl('https://drive.google.com/drive/folders/abc123'), true);
    assert.equal(isSafeDriveFolderUrl('javascript:alert(1)'), false);
  });
});
