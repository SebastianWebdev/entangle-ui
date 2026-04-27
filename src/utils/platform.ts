export type Platform = 'mac' | 'windows' | 'linux';

/**
 * Detect the current platform from navigator. Falls back to 'windows' in SSR.
 */
export function getPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'windows';

  const ua = navigator.userAgent.toLowerCase();

  if (/mac|iphone|ipad|ipod/.test(ua)) return 'mac';
  if (/linux/.test(ua)) return 'linux';

  return 'windows';
}

const MAC_GLYPHS: Record<string, string> = {
  cmd: '⌘',
  meta: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
  enter: '↩',
  return: '↩',
  tab: '⇥',
  esc: '⎋',
  escape: '⎋',
  space: '␣',
  backspace: '⌫',
  delete: '⌦',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  plus: '+',
  minus: '-',
  comma: ',',
  period: '.',
  slash: '/',
};

const COMMON_KEYS: Record<string, string> = {
  ctrl: 'Ctrl',
  alt: 'Alt',
  option: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  return: 'Enter',
  tab: 'Tab',
  esc: 'Esc',
  escape: 'Esc',
  space: 'Space',
  backspace: 'Backspace',
  delete: 'Delete',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  plus: '+',
  minus: '-',
  comma: ',',
  period: '.',
  slash: '/',
};

function normalizeSingleCharacter(key: string): string {
  return key.length === 1 ? key.toUpperCase() : key;
}

/**
 * Map a logical key name to its display representation for the given platform.
 */
export function getKeyGlyph(key: string, platform: Platform): string {
  const normalizedKey = key.trim();
  const lookupKey = normalizedKey.toLowerCase();

  if (platform === 'mac') {
    return MAC_GLYPHS[lookupKey] ?? normalizeSingleCharacter(normalizedKey);
  }

  if (lookupKey === 'cmd') return 'Ctrl';
  if (lookupKey === 'meta') return platform === 'windows' ? 'Win' : 'Super';

  return COMMON_KEYS[lookupKey] ?? normalizeSingleCharacter(normalizedKey);
}

/**
 * Parse a shortcut string into individual keys.
 */
export function parseShortcut(shortcut: string): string[] {
  return shortcut
    .split('+')
    .map(key => key.trim())
    .filter(Boolean);
}
