import { lightThemeClass } from './lightTheme.css';

/**
 * Returns the light-theme CSS class. Apply the returned class to any
 * subtree (typically via `VanillaThemeProvider`) to flip its tokens
 * from the dark default to the light preset.
 *
 * The class is generated at build time inside `lightTheme.css.ts` (where
 * Vanilla Extract's file scope is set), so this helper is safe to call
 * from any `.ts`/`.tsx` file — no `.css.ts` wrapper required. Consumers
 * who prefer can also import `lightThemeClass` directly from the package.
 *
 * @example
 * ```tsx
 * import { createLightTheme, VanillaThemeProvider } from 'entangle-ui';
 *
 * const lightThemeClass = createLightTheme();
 *
 * <VanillaThemeProvider className={lightThemeClass}>
 *   <SettingsPanel />
 * </VanillaThemeProvider>
 * ```
 */
export function createLightTheme(): string {
  return lightThemeClass;
}
