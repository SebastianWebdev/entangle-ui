import { createGlobalTheme } from '@vanilla-extract/css';
import { vars } from './contract.css';
import { darkThemeValues } from './darkThemeValues';

/**
 * Dark theme — applies `darkThemeValues` to the `:root` selector.
 *
 * The values themselves live in `darkThemeValues.ts` (a plain `.ts`
 * module) so build-time tooling can import them without the Vanilla
 * Extract runtime. We re-export both the value and the type here so
 * existing `import ... from './darkTheme.css'` consumers keep working.
 */
export { darkThemeValues } from './darkThemeValues';
export type { DarkThemeValues } from './darkThemeValues';

createGlobalTheme(':root', vars, darkThemeValues);
