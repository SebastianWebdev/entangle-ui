'use client';

// src/primitives/Icon/Icon.tsx
import React from 'react';

import { cx } from '@/utils/cx';

import { iconRecipe } from './Icon.css';

import type { Size } from '@/types/common';
import type { Prettify, LiteralUnion } from '@/types/utilities';

export type IconSize = LiteralUnion<Size> | number;
export type IconColor = LiteralUnion<
  'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'error'
>;

export interface IconBaseProps {
  children: React.ReactNode;
  /**
   * Icon size. `'sm' | 'md' | 'lg'` map to 12 / 16 / 20 px through the theme
   * recipe. Pass a `number` for a custom pixel size, or a `string` for any
   * CSS length (e.g. `'1.5em'`, `'24px'`).
   * @default "md"
   */
  size?: IconSize;
  /**
   * Icon color. Standard tokens (`'primary' | 'secondary' | 'muted' |
   * 'accent' | 'success' | 'warning' | 'error'`) map to theme variables;
   * any other string is forwarded as an inline `color` value (hex,
   * `currentColor`, `var(--…)`, etc.).
   * @default "primary"
   */
  color?: IconColor;
  className?: string;
  title?: string;
  decorative?: boolean;

  /**
   * Test identifier for automated testing
   */
  testId?: string;

  ref?: React.Ref<SVGSVGElement>;
}

export type IconProps = Prettify<IconBaseProps>;

/**
 * Standard color keys that map to recipe variants
 */
const STANDARD_COLORS = new Set([
  'primary',
  'secondary',
  'muted',
  'accent',
  'success',
  'warning',
  'error',
]);

const STANDARD_SIZES = new Set(['sm', 'md', 'lg']);

export const Icon = /*#__PURE__*/ React.memo<IconProps>(
  ({
    children,
    size = 'md',
    color = 'primary',
    className,
    title,
    decorative = false,
    testId,
    ref,
    ...props
  }) => {
    const isStandardColor = STANDARD_COLORS.has(color);
    const isStandardSize = typeof size === 'string' && STANDARD_SIZES.has(size);

    const resolvedSize =
      isStandardSize || size === undefined
        ? undefined
        : typeof size === 'number'
          ? `${size}px`
          : size;

    const inlineStyle: React.CSSProperties = {};
    if (!isStandardColor) inlineStyle.color = color;
    if (resolvedSize !== undefined) {
      inlineStyle.width = resolvedSize;
      inlineStyle.height = resolvedSize;
    }

    return (
      <svg
        ref={ref}
        className={cx(
          iconRecipe({
            size: isStandardSize ? (size as Size) : undefined,
            color: isStandardColor
              ? (color as
                  | 'primary'
                  | 'secondary'
                  | 'muted'
                  | 'accent'
                  | 'success'
                  | 'warning'
                  | 'error')
              : undefined,
          }),
          className
        )}
        style={Object.keys(inlineStyle).length > 0 ? inlineStyle : undefined}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden={decorative}
        role={decorative ? 'presentation' : 'img'}
        data-testid={testId}
        {...props}
      >
        {title && !decorative && <title>{title}</title>}
        {children}
      </svg>
    );
  }
);

Icon.displayName = 'Icon';
