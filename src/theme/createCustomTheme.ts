import { createGlobalTheme } from '@vanilla-extract/css';
import { vars } from './contract.css';
import { darkThemeValues } from './darkTheme.css';
import type { DeepPartial } from '@/types/utilities';
import { mergeDeep } from '@/utils/objects';
import type { DarkThemeValues } from './darkTheme.css';

export type ThemeValues = DarkThemeValues;

/**
 * Creates a custom theme scoped to a CSS selector by deep-merging
 * overrides onto the dark theme defaults.
 *
 * MUST be called in a .css.ts file (build-time only).
 *
 * @param selector - CSS selector to scope the theme to (e.g. '.my-brand', '[data-theme="light"]')
 * @param overrides - Partial theme values to override
 *
 * @example
 * ```typescript
 * // my-theme.css.ts
 * import { createCustomTheme } from 'entangle-ui/theme';
 *
 * createCustomTheme('.my-brand', {
 *   colors: {
 *     accent: { primary: '#ff6600' },
 *   },
 * });
 * ```
 */
export function createCustomTheme(
  selector: string,
  overrides: DeepPartial<ThemeValues>
) {
  const merged = mergeDeep(
    darkThemeValues as unknown as Record<string, unknown>,
    overrides as unknown as DeepPartial<Record<string, unknown>>
  ) as ThemeValues;
  createGlobalTheme(selector, vars, merged);
}
