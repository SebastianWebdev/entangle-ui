// Vanilla Extract theme
export { vars } from './contract.css';
export type { ThemeVars } from './contract.css';
// Theme values are re-exported from the plain `.ts` data modules rather
// than from the `.css.ts` files so the dts roll-up doesn't depend on
// the Vanilla Extract Rollup plugin preserving non-class re-exports —
// it doesn't, and the resulting `dist/types` lose `LightThemeValues`
// and `lightThemeValues` when the chain runs through `lightTheme.css.ts`.
export { darkThemeValues } from './darkThemeValues';
export type { DarkThemeValues } from './darkThemeValues';
export { lightThemeValues } from './lightThemeValues';
export type { LightThemeValues } from './lightThemeValues';
// `lightThemeClass` is the only export that has to come from the
// `.css.ts` file — Vanilla Extract assigns its hashed value at build time.
export { lightThemeClass } from './lightTheme.css';
export { createCustomTheme } from './createCustomTheme';
export type { ThemeValues } from './createCustomTheme';
export { createLightTheme } from './createLightTheme';
export { VanillaThemeProvider } from './VanillaThemeProvider';
export type { VanillaThemeProviderProps } from './VanillaThemeProvider';
export { ThemeProvider } from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';
export { GLOBAL_SCROLLBARS_CLASS } from './globalScrollbars.css';
