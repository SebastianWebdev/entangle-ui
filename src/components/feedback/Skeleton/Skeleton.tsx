'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';
import type { SkeletonProps, SkeletonShape } from './Skeleton.types';
import {
  skeletonHeightVar,
  skeletonRadiusVar,
  skeletonRecipe,
  skeletonWidthVar,
} from './Skeleton.css';

const LINE_DEFAULT_HEIGHT = '12px';

const IS_DEV: boolean =
  typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production';

const SHAPE_RADIUS_FALLBACK: Record<SkeletonShape, string> = {
  rect: vars.borderRadius.sm,
  line: vars.borderRadius.lg,
  circle: '50%',
};

function resolveDimension(
  value: number | string | undefined
): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

function resolveDefaults(
  shape: SkeletonShape,
  width: number | string | undefined,
  height: number | string | undefined,
  borderRadius: number | string | undefined
): { width: string; height: string; radius: string } {
  const resolvedWidth = resolveDimension(width) ?? '100%';

  let resolvedHeight = resolveDimension(height);
  if (resolvedHeight === undefined) {
    if (shape === 'line') {
      resolvedHeight = LINE_DEFAULT_HEIGHT;
    } else if (shape === 'circle') {
      resolvedHeight = resolvedWidth;
    } else {
      resolvedHeight = '100%';
    }
  }

  const resolvedRadius =
    resolveDimension(borderRadius) ?? SHAPE_RADIUS_FALLBACK[shape];

  return {
    width: resolvedWidth,
    height: resolvedHeight,
    radius: resolvedRadius,
  };
}

/**
 * Loading-placeholder block.
 *
 * Renders a rectangle, circle, or line shape with a configurable animation
 * (`pulse`, `wave`, `none`). Use it while waiting for real content to load.
 *
 * Skeletons are decorative — they set `aria-hidden="true"` and `aria-busy="true"`
 * but do not announce themselves. The surrounding region should announce
 * the loading state (e.g. via `Spinner` or `EmptyState loading`).
 *
 * @example
 * ```tsx
 * <Skeleton width={120} height={16} />
 * <Skeleton shape="circle" width={32} />
 * <Skeleton shape="line" width="60%" />
 * <Skeleton animation="wave" height={80} />
 * ```
 */
export const Skeleton = /*#__PURE__*/ React.memo<SkeletonProps>(
  ({
    shape = 'rect',
    width,
    height,
    borderRadius,
    animation = 'pulse',
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    if (
      IS_DEV &&
      shape === 'circle' &&
      width !== undefined &&
      height !== undefined &&
      width !== height
    ) {
      console.warn(
        '[Skeleton] shape="circle" expects equal width and height; received width=%o, height=%o.',
        width,
        height
      );
    }

    const {
      width: w,
      height: h,
      radius,
    } = resolveDefaults(shape, width, height, borderRadius);

    const inlineVars = assignInlineVars({
      [skeletonWidthVar]: w,
      [skeletonHeightVar]: h,
      [skeletonRadiusVar]: radius,
    });

    return (
      <div
        ref={ref}
        aria-hidden="true"
        aria-busy="true"
        className={cx(skeletonRecipe({ shape, animation }), className)}
        style={{ ...inlineVars, ...style }}
        data-testid={testId}
        data-shape={shape}
        data-animation={animation}
        {...rest}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
