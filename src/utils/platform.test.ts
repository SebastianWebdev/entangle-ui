import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getKeyGlyph,
  getPlatform,
  parseShortcut,
  type Platform,
} from './platform';

function stubNavigator(userAgent: string): void {
  vi.stubGlobal('navigator', { userAgent });
}

describe('platform utilities', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getPlatform', () => {
    it('returns mac for a macOS user agent', () => {
      stubNavigator(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
      );

      expect(getPlatform()).toBe('mac');
    });

    it('returns windows for a Windows user agent', () => {
      stubNavigator(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );

      expect(getPlatform()).toBe('windows');
    });

    it('returns linux for a Linux user agent', () => {
      stubNavigator('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');

      expect(getPlatform()).toBe('linux');
    });

    it('returns windows when navigator is undefined', () => {
      vi.stubGlobal('navigator', undefined);

      expect(getPlatform()).toBe('windows');
    });
  });

  describe('getKeyGlyph', () => {
    it.each([
      ['Cmd', 'mac', '⌘'],
      ['Cmd', 'windows', 'Ctrl'],
      ['Enter', 'mac', '↩'],
      ['S', 'mac', 'S'],
      ['Meta', 'windows', 'Win'],
      ['Meta', 'linux', 'Super'],
      ['Option', 'mac', '⌥'],
      ['Return', 'windows', 'Enter'],
      ['Space', 'mac', '␣'],
      ['Backspace', 'mac', '⌫'],
      ['Delete', 'mac', '⌦'],
      ['Up', 'windows', '↑'],
      ['Comma', 'mac', ','],
    ] satisfies Array<[string, Platform, string]>)(
      'maps %s on %s to %s',
      (key, platform, expected) => {
        expect(getKeyGlyph(key, platform)).toBe(expected);
      }
    );
  });

  describe('parseShortcut', () => {
    it('splits shortcut strings on plus signs', () => {
      expect(parseShortcut('Ctrl+Shift+S')).toEqual(['Ctrl', 'Shift', 'S']);
    });

    it('handles whitespace around separators', () => {
      expect(parseShortcut('Ctrl + S')).toEqual(['Ctrl', 'S']);
    });
  });
});
