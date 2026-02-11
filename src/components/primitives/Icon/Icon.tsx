// src/primitives/Icon/Icon.tsx
import React from 'react';
import type { Prettify, LiteralUnion } from '@/types/utilities';
import type { Size } from '@/types/common';
import { cx } from '@/utils/cx';
import { iconRecipe } from './Icon.css';

export type IconSize = Size;
export type IconColor = LiteralUnion<
  'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'error'
>;

export interface IconBaseProps {
  children: React.ReactNode;
  size?: IconSize;
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

    return (
      <svg
        ref={ref}
        className={cx(
          iconRecipe({
            size,
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
        style={!isStandardColor ? { color } : undefined}
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
