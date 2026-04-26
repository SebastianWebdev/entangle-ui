import type { ThemeValues } from '@/theme';

/**
 * Same shape as `ThemeValues` but with each leaf widened to `string`.
 *
 * `darkThemeValues` is declared `as const`, which makes its leaf types
 * literal (e.g. `'#007acc'`). At runtime the hook reads arbitrary CSS
 * custom-property strings from the DOM — those values are not constrained
 * to the dark-theme literals, so the return type widens to plain strings
 * to stay sound for light, custom, or computed values.
 */
export type ResolvedThemeValues = WidenLeaves<ThemeValues>;

type WidenLeaves<T> = T extends string
  ? string
  : T extends number
    ? number
    : { -readonly [K in keyof T]: WidenLeaves<T[K]> };

/**
 * Detected theme variant.
 *
 * Detection is **root-only**: the hook reports `'light'` only when the
 * `lightThemeClass` produced by `createLightTheme()` is applied to
 * `document.documentElement` — the same element the hook reads CSS
 * variable values from. A light-themed subtree wrapped in
 * `VanillaThemeProvider` does **not** flip this variant, because the
 * resolved values would still come from the root.
 *
 * - `'dark'` — the default; no `lightThemeClass` on `:root`.
 * - `'light'` — `lightThemeClass` is on `:root`.
 * - `'custom'` — reserved. v0.8 does not auto-detect themes produced by
 *   `createCustomTheme(selector, overrides)`; the union member exists so
 *   future releases can add detection without a breaking type change.
 */
export type ThemeVariant = 'dark' | 'light' | 'custom';

export interface UseThemeReturn {
  /** Current root-theme variant. See `ThemeVariant` for detection rules. */
  variant: ThemeVariant;
  /** Resolved theme values — CSS variable values read from `:root`. */
  values: ResolvedThemeValues;
  /**
   * Resolve a single token to its current CSS-var value, e.g. `'#007acc'`.
   *
   * Falls back to the dark-theme default when the underlying CSS variable
   * is unset or when no DOM is available (SSR). Returns an empty string
   * only for paths that don't resolve to a leaf in the theme contract.
   * Repeated calls for the same path are cached for the life of the hook
   * instance.
   */
  getToken: (path: string) => string;
  /**
   * Get the `var(--etui-...)` reference for a token, e.g.
   * `'var(--etui-color-accent-primary)'`. Useful for inline styles that
   * must follow theme changes automatically.
   *
   * SSR-safe — the returned string is constructed from the contract and
   * works identically in browser and server rendering. Returns an empty
   * string only for paths that don't resolve to a leaf in the contract.
   */
  getVar: (path: string) => string;
}
