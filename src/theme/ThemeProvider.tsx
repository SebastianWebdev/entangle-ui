// src/theme/ThemeProvider.tsx
import React from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { tokens } from './tokens';
import type { Theme } from './types';

const mergeDeep = <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
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

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: Partial<Theme>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  theme: customTheme 
}) => {
  const theme = customTheme ? mergeDeep(tokens, customTheme) : tokens;
  
  return (
    <EmotionThemeProvider theme={theme}>
      {children}
    </EmotionThemeProvider>
  );
};