'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import type { DividerProps, DividerSpacing } from './Divider.types';
import {
  dividerLabelTextStyle,
  dividerRecipe,
  dividerWithLabelRecipe,
} from './Divider.css';

const SPACING_MAP: Record<number, string> = {
  0: '0',
  1: 'var(--etui-spacing-xs)',
  2: 'var(--etui-spacing-sm)',
  3: 'var(--etui-spacing-md)',
  4: 'var(--etui-spacing-lg)',
  5: 'var(--etui-spacing-xl)',
  6: 'var(--etui-spacing-xxl)',
  7: 'var(--etui-spacing-xxxl)',
};

function resolveSpacing(spacing: DividerSpacing | string | undefined): string {
  if (spacing === undefined) return '0';
  if (typeof spacing === 'number') return SPACING_MAP[spacing] ?? '0';
  return spacing;
}

/**
 * Thin horizontal or vertical rule, optionally with an inline label.
 *
 * @example
 * ```tsx
 * <Stack>
 *   <SectionA />
 *   <Divider spacing={3} />
 *   <SectionB />
 * </Stack>
 *
 * <Divider label="Advanced" />
 * ```
 */
export const Divider = /*#__PURE__*/ React.memo<DividerProps>(
  ({
    orientation = 'horizontal',
    variant = 'solid',
    spacing = 0,
    label,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const spacingValue = resolveSpacing(spacing);
    const marginStyle =
      orientation === 'horizontal'
        ? { marginTop: spacingValue, marginBottom: spacingValue }
        : { marginLeft: spacingValue, marginRight: spacingValue };

    if (label && orientation === 'horizontal') {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="horizontal"
          className={cx(dividerWithLabelRecipe({ variant }), className)}
          style={{ ...marginStyle, ...style }}
          data-testid={testId}
          {...rest}
        >
          <span className={dividerLabelTextStyle}>{label}</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={cx(dividerRecipe({ orientation, variant }), className)}
        style={{ ...marginStyle, ...style }}
        data-testid={testId}
        {...rest}
      />
    );
  }
);

Divider.displayName = 'Divider';
