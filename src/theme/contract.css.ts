import { createGlobalThemeContract } from '@vanilla-extract/css';
import { themeContractData } from './themeContractData';

/**
 * Theme contract with stable CSS custom property names.
 *
 * Every value is the CSS custom property name (without --)
 * that will be used in the output CSS. This means consumers
 * can override any token with plain CSS:
 *
 * ```css
 * .my-brand {
 *   --etui-color-accent-primary: #ff6600;
 * }
 * ```
 *
 * All property names follow the pattern: etui-{category}-{path}
 * These names are part of the PUBLIC API — do not rename without
 * a major version bump.
 *
 * The structural data lives in `themeContractData.ts` so build-time
 * tooling (token export, docs) can import the same shape without
 * pulling in the Vanilla Extract runtime.
 */
export const vars = createGlobalThemeContract(themeContractData);

export type ThemeVars = typeof vars;
