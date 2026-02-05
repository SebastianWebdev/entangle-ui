import React from 'react';
import type { Theme } from '@/theme';

/**
 * Converts camelCase to kebab-case
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};

/**
 * Set of CSS properties (in kebab-case) that should NOT receive a `px` suffix
 * when their value is a number. Based on the React DOM unitless properties list.
 */
export const UNITLESS_PROPERTIES: ReadonlySet<string> = new Set([
  'animation-iteration-count',
  'border-image-outset',
  'border-image-slice',
  'border-image-width',
  'box-flex',
  'box-flex-group',
  'box-ordinal-group',
  'column-count',
  'columns',
  'flex',
  'flex-grow',
  'flex-positive',
  'flex-shrink',
  'flex-negative',
  'flex-order',
  'grid-area',
  'grid-column',
  'grid-column-end',
  'grid-column-span',
  'grid-column-start',
  'grid-row',
  'grid-row-end',
  'grid-row-span',
  'grid-row-start',
  'font-weight',
  'line-clamp',
  'line-height',
  'opacity',
  'order',
  'orphans',
  'tab-size',
  'widows',
  'z-index',
  'zoom',
  'fill-opacity',
  'flood-opacity',
  'stop-opacity',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
]);

/**
 * Processes CSS properties from a CSS object or function
 * Handles camelCase to kebab-case conversion and theme access.
 * Numeric values are appended with 'px' unless the property is unitless.
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
      // Append 'px' to numeric values, except for 0 and unitless properties
      const formattedValue =
        typeof value === 'number' &&
        value !== 0 &&
        !UNITLESS_PROPERTIES.has(kebabKey)
          ? `${value}px`
          : typeof value === 'number'
            ? `${value}`
            : (value as string);
      return `${kebabKey}: ${formattedValue};`;
    })
    .join('\n');
};
