// src/theme/createTheme.ts
import { tokens as defaultTokens } from './tokens';
import type { Theme, DeepPartial } from './types';

const mergeDeep = <T extends Record<string, any>>(target: T, source: DeepPartial<T>): T => {
  const result = { ...target };
  
  for (const key in source) {
    const sourceValue = source[key];
    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      result[key] = mergeDeep(result[key] as Record<string, any>, sourceValue as Record<string, any>) as T[Extract<keyof T, string>];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }
  
  return result;
};

export const createTheme = (customTokens?: DeepPartial<Theme>): Theme => {
  return customTokens ? mergeDeep(defaultTokens, customTokens) : defaultTokens;
};