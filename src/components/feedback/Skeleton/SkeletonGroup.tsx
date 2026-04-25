'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';
import { Skeleton } from './Skeleton';
import type { SkeletonGroupProps } from './Skeleton.types';
import { skeletonGroupGapVar, skeletonGroupRecipe } from './Skeleton.css';

const SPACING_SCALE: readonly string[] = [
  '0',
  vars.spacing.xs,
  vars.spacing.sm,
  vars.spacing.md,
  vars.spacing.lg,
  vars.spacing.xl,
  vars.spacing.xxl,
  vars.spacing.xxxl,
];

function resolveSpacing(value: number | string): string {
  if (typeof value === 'string') return value;
  const index = Math.max(0, Math.min(SPACING_SCALE.length - 1, value));
  return SPACING_SCALE[index] ?? vars.spacing.sm;
}

/**
 * Lays out one or more `Skeleton` items consistently — handy for "show
 * five skeleton rows then real data" patterns.
 *
 * Pass `count` to auto-generate that many skeletons (using `itemProps` to
 * configure them), or pass `children` to lay out custom skeleton shapes
 * yourself. `direction` and `spacing` control the flex container.
 *
 * @example
 * ```tsx
 * // Five lines stacked vertically
 * <SkeletonGroup count={5} itemProps={{ shape: 'line' }} />
 *
 * // Custom composition
 * <SkeletonGroup direction="row" spacing={3}>
 *   <Skeleton shape="circle" width={32} />
 *   <Skeleton shape="line" width={120} />
 * </SkeletonGroup>
 * ```
 */
export const SkeletonGroup = /*#__PURE__*/ React.memo<SkeletonGroupProps>(
  ({
    count,
    spacing = 2,
    direction = 'column',
    itemProps,
    children,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const inlineVars = assignInlineVars({
      [skeletonGroupGapVar]: resolveSpacing(spacing),
    });

    const content =
      children ??
      Array.from({ length: count ?? 0 }, (_, i) => (
        <Skeleton key={i} {...itemProps} />
      ));

    return (
      <div
        ref={ref}
        aria-hidden="true"
        aria-busy="true"
        className={cx(skeletonGroupRecipe({ direction }), className)}
        style={{ ...inlineVars, ...style }}
        data-testid={testId}
        {...rest}
      >
        {content}
      </div>
    );
  }
);

SkeletonGroup.displayName = 'SkeletonGroup';
