/**
 * Pure color conversion utilities for the ColorPicker.
 * Internal state is always HSVA. All conversions go through HSVA.
 */

export interface ColorHSVA {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
  a: number; // 0-1
}

export type ColorFormat = 'hex' | 'hex8' | 'rgb' | 'rgba' | 'hsl' | 'hsla';

// --- Conversions ---

export function hsvToRgb(
  h: number,
  s: number,
  v: number
): { r: number; g: number; b: number } {
  const s1 = s / 100;
  const v1 = v / 100;
  const c = v1 * s1;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v1 - c;

  let r1 = 0,
    g1 = 0,
    b1 = 0;

  if (h < 60) {
    r1 = c;
    g1 = x;
  } else if (h < 120) {
    r1 = x;
    g1 = c;
  } else if (h < 180) {
    g1 = c;
    b1 = x;
  } else if (h < 240) {
    g1 = x;
    b1 = c;
  } else if (h < 300) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

export function rgbToHsv(
  r: number,
  g: number,
  b: number
): { h: number; s: number; v: number } {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;

  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;

  if (d !== 0) {
    if (max === r1) {
      h = ((g1 - b1) / d) % 6;
    } else if (max === g1) {
      h = (b1 - r1) / d + 2;
    } else {
      h = (r1 - g1) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

export function hsvToHsl(
  h: number,
  s: number,
  v: number
): { h: number; s: number; l: number } {
  const s1 = s / 100;
  const v1 = v / 100;

  const l = v1 * (1 - s1 / 2);
  let sl = 0;
  if (l > 0 && l < 1) {
    sl = (v1 - l) / Math.min(l, 1 - l);
  }

  return {
    h: Math.round(h),
    s: Math.round(sl * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHsv(
  h: number,
  s: number,
  l: number
): { h: number; s: number; v: number } {
  const s1 = s / 100;
  const l1 = l / 100;

  const v = l1 + s1 * Math.min(l1, 1 - l1);
  const sv = v === 0 ? 0 : 2 * (1 - l1 / v);

  return {
    h: Math.round(h),
    s: Math.round(sv * 100),
    v: Math.round(v * 100),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(
  hex: string
): { r: number; g: number; b: number; a?: number } | null {
  const clean = hex.replace('#', '');

  // Validate hex characters
  if (!/^[0-9a-fA-F]+$/.test(clean)) {
    return null;
  }

  if (clean.length === 3) {
    const c0 = clean.charAt(0);
    const c1 = clean.charAt(1);
    const c2 = clean.charAt(2);
    const r = parseInt(c0 + c0, 16);
    const g = parseInt(c1 + c1, 16);
    const b = parseInt(c2 + c2, 16);
    return { r, g, b };
  }

  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return { r, g, b };
  }

  if (clean.length === 8) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const a = parseInt(clean.substring(6, 8), 16) / 255;
    return { r, g, b, a };
  }

  return null;
}

// --- Parsing ---

export function parseColor(color: string): ColorHSVA {
  const trimmed = color.trim().toLowerCase();

  // Named colors lookup (common ones)
  const named = NAMED_COLORS[trimmed];
  if (named) {
    return parseColor(named);
  }

  // HEX
  if (trimmed.startsWith('#')) {
    const rgb = hexToRgb(trimmed);
    if (rgb) {
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      return { ...hsv, a: rgb.a ?? 1 };
    }
  }

  // rgb() / rgba()
  const rgbMatch = trimmed.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/
  );
  if (rgbMatch) {
    const rStr = rgbMatch[1] ?? '0';
    const gStr = rgbMatch[2] ?? '0';
    const bStr = rgbMatch[3] ?? '0';
    const r = parseInt(rStr, 10);
    const g = parseInt(gStr, 10);
    const b = parseInt(bStr, 10);
    const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
    const hsv = rgbToHsv(r, g, b);
    return { ...hsv, a };
  }

  // hsl() / hsla()
  const hslMatch = trimmed.match(
    /hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+)\s*)?\)/
  );
  if (hslMatch) {
    const hStr = hslMatch[1] ?? '0';
    const sStr = hslMatch[2] ?? '0';
    const lStr = hslMatch[3] ?? '0';
    const h = parseInt(hStr, 10);
    const s = parseInt(sStr, 10);
    const l = parseInt(lStr, 10);
    const a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;
    const hsv = hslToHsv(h, s, l);
    return { ...hsv, a };
  }

  // Fallback: blue
  return { h: 210, s: 100, v: 80, a: 1 };
}

// --- Formatting ---

export function formatColor(hsva: ColorHSVA, format: ColorFormat): string {
  const { r, g, b } = hsvToRgb(hsva.h, hsva.s, hsva.v);

  switch (format) {
    case 'hex':
      return rgbToHex(r, g, b);
    case 'hex8': {
      const alphaHex = Math.round(hsva.a * 255)
        .toString(16)
        .padStart(2, '0');
      return `${rgbToHex(r, g, b)}${alphaHex}`;
    }
    case 'rgb':
      return `rgb(${r}, ${g}, ${b})`;
    case 'rgba':
      return `rgba(${r}, ${g}, ${b}, ${Number(hsva.a.toFixed(2))})`;
    case 'hsl': {
      const hsl = hsvToHsl(hsva.h, hsva.s, hsva.v);
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    case 'hsla': {
      const hsl = hsvToHsl(hsva.h, hsva.s, hsva.v);
      return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${Number(hsva.a.toFixed(2))})`;
    }
  }
}

// --- Validation ---

export function isValidHex(hex: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hex);
}

export function getContrastColor(hex: string): 'black' | 'white' {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'white';
  // Perceived luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? 'black' : 'white';
}

// --- Named colors (subset) ---

const NAMED_COLORS: Record<string, string> = {
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  white: '#ffffff',
  black: '#000000',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  orange: '#ffa500',
  purple: '#800080',
  pink: '#ffc0cb',
  gray: '#808080',
  grey: '#808080',
  transparent: 'rgba(0, 0, 0, 0)',
};
