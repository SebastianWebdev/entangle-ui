'use client';

// src/theme/ThemeProvider.tsx
import React from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { tokens } from './tokens';
import type { Theme } from './types';
import { mergeDeep } from '@/utils/objects';

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: Partial<Theme>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme: customTheme,
}) => {
  const theme = customTheme ? mergeDeep(tokens, customTheme) : tokens;

  return <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>;
};
