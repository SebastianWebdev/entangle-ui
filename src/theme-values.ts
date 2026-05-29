import { themeContractData } from './theme/themeContractData';

import type { DarkThemeValues } from './theme/darkThemeValues';

export { darkThemeValues } from './theme/darkThemeValues';
export type { DarkThemeValues } from './theme/darkThemeValues';
export { lightThemeValues } from './theme/lightThemeValues';
export type { LightThemeValues } from './theme/lightThemeValues';
export { themeContractData } from './theme/themeContractData';

export type ThemeValues = DarkThemeValues;
export type ThemeContractData = typeof themeContractData;
