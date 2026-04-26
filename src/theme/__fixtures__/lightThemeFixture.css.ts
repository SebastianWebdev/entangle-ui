import { createLightTheme } from '../createLightTheme';

/**
 * Test-only fixture that exercises `createLightTheme()` inside a
 * `.css.ts` context (the only context where Vanilla Extract's
 * `createTheme` can run). Imported by `lightTheme.test.ts` to assert
 * the helper produces a usable class string.
 */
export const lightThemeFixtureClass = createLightTheme();
