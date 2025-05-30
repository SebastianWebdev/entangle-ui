// src/theme/createTheme.ts
import { tokens as defaultTokens } from './tokens';
import type { Theme, DeepPartial } from './types';
import { mergeDeep } from '@/utils/objects';

export const createTheme = (customTokens?: DeepPartial<Theme>): Theme => {
  return customTokens ? mergeDeep(defaultTokens, customTokens) : defaultTokens;
};
