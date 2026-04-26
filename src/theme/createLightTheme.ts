import { createTheme } from '@vanilla-extract/css';
import { vars } from './contract.css';
import { lightThemeValues } from './lightTheme.css';

/**
 * Generate a light-theme CSS class. Apply the returned class to any
 * subtree (typically via `VanillaThemeProvider`) to flip its tokens
 * from the dark default to the light preset.
 *
 * MUST be called in a `.css.ts` file — `createTheme` is build-time only.
 *
 * @example
 * ```ts
 * // src/light-theme.css.ts
 * import { createLightTheme } from 'entangle-ui';
 * export const lightThemeClass = createLightTheme();
 * ```
 *
 * ```tsx
 * // src/Root.tsx
 * import { VanillaThemeProvider } from 'entangle-ui';
 * import { lightThemeClass } from './light-theme.css';
 *
 * <VanillaThemeProvider className={lightThemeClass}>
 *   <SettingsPanel />
 * </VanillaThemeProvider>
 * ```
 */
export function createLightTheme(): string {
  return createTheme(vars, lightThemeValues);
}
