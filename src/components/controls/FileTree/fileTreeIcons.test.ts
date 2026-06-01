import { describe, it, expect } from 'vitest';

import {
  classifyExtension,
  getFileExtension,
  getFileIconKind,
} from './fileTreeIcons';

describe('fileTreeIcons', () => {
  describe('getFileExtension', () => {
    it('extracts a simple extension', () => {
      expect(getFileExtension('Button.tsx')).toBe('tsx');
    });

    it('uses the last segment for multi-dot names', () => {
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('lowercases the extension', () => {
      expect(getFileExtension('PHOTO.PNG')).toBe('png');
    });

    it('returns undefined for names without an extension', () => {
      expect(getFileExtension('README')).toBeUndefined();
    });

    it('treats dotfiles as having no extension', () => {
      expect(getFileExtension('.env')).toBeUndefined();
      expect(getFileExtension('.gitignore')).toBeUndefined();
    });

    it('returns undefined for a trailing dot', () => {
      expect(getFileExtension('weird.')).toBeUndefined();
    });
  });

  describe('classifyExtension', () => {
    it('classifies images', () => {
      for (const ext of ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp']) {
        expect(classifyExtension(ext)).toBe('image');
      }
    });

    it('classifies audio and video as media', () => {
      for (const ext of ['mp3', 'wav', 'mp4', 'mov', 'webm']) {
        expect(classifyExtension(ext)).toBe('media');
      }
    });

    it('classifies code / config / data', () => {
      for (const ext of ['ts', 'tsx', 'js', 'json', 'css', 'py', 'yml']) {
        expect(classifyExtension(ext)).toBe('code');
      }
    });

    it('classifies archives', () => {
      for (const ext of ['zip', 'tar', 'gz', '7z', 'rar']) {
        expect(classifyExtension(ext)).toBe('archive');
      }
    });

    it('classifies text / documents', () => {
      for (const ext of ['txt', 'md', 'pdf', 'csv']) {
        expect(classifyExtension(ext)).toBe('text');
      }
    });

    it('is case-insensitive', () => {
      expect(classifyExtension('PNG')).toBe('image');
      expect(classifyExtension('TS')).toBe('code');
    });

    it('falls back to file for unknown or missing extensions', () => {
      expect(classifyExtension('xyz')).toBe('file');
      expect(classifyExtension(undefined)).toBe('file');
    });
  });

  describe('getFileIconKind', () => {
    it('returns folder / folder-open for folders by expansion', () => {
      const folder = { kind: 'folder' as const, name: 'src' };
      expect(getFileIconKind(folder, false)).toBe('folder');
      expect(getFileIconKind(folder, true)).toBe('folder-open');
    });

    it('classifies files by the extension parsed from the name', () => {
      expect(getFileIconKind({ kind: 'file', name: 'main.rs' })).toBe('code');
      expect(getFileIconKind({ kind: 'file', name: 'hero.png' })).toBe('image');
    });

    it('prefers an explicit ext over the name', () => {
      expect(
        getFileIconKind({ kind: 'file', name: 'data.bin', ext: 'json' })
      ).toBe('code');
    });

    it('falls back to file for unknown extensions', () => {
      expect(getFileIconKind({ kind: 'file', name: 'notes.unknownext' })).toBe(
        'file'
      );
      expect(getFileIconKind({ kind: 'file', name: 'LICENSE' })).toBe('file');
    });
  });
});
