import { createTheme } from '@vanilla-extract/css';
import { vars } from './contract.css';
import { lightThemeValues } from './lightThemeValues';

/**
 * Pre-generated light-theme class. The class is created at build time in
 * this `.css.ts` module so Vanilla Extract's file scope is always set —
 * importing or calling `createLightTheme()` from a regular `.ts` file
 * is therefore safe. Apply this class to any subtree (typically via
 * `VanillaThemeProvider`) to flip its tokens from the dark default to
 * the light preset.
 *
 * The values themselves live in `lightThemeValues.ts` (a plain `.ts`
 * module) so build-time tooling can import them without the Vanilla
 * Extract runtime. We re-export both the value and the type here so
 * existing `import ... from './lightTheme.css'` consumers keep working.
 */
export { lightThemeValues } from './lightThemeValues';
export type { LightThemeValues } from './lightThemeValues';

export const lightThemeClass = createTheme(vars, lightThemeValues);
