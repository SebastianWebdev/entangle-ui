import React from 'react';
import type { Theme } from '@/theme';

/**
 * Converts camelCase to kebab-case
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};

/**
 * Processes CSS properties from a CSS object or function
 * Handles camelCase to kebab-case conversion and theme access
 */
export const processCss = (
  css:
    | React.CSSProperties
    | ((theme: Theme) => React.CSSProperties)
    | undefined,
  theme: Theme
): string => {
  if (!css) return '';

  const cssObj = typeof css === 'function' ? css(theme) : css;

  return Object.entries(cssObj)
    .map(([key, value]) => {
      const kebabKey = camelToKebab(key);
      // Dodaj 'px' do wartości liczbowych (z wyjątkiem 0)
      const formattedValue =
        typeof value === 'number' && value !== 0
          ? `${value}px`
          : (value as string);
      return `${kebabKey}: ${formattedValue};`;
    })
    .join('\n');
};
