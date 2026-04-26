'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';
import type {
  CircularProgressProps,
  CircularProgressSize,
  ProgressBarColor,
} from './ProgressBar.types';
import {
  circularFillCircleStyle,
  circularIndeterminateStyle,
  circularLabelStyle,
  circularRootStyle,
  circularSvgStyle,
  circularTrackCircleStyle,
  progressColorVar,
} from './ProgressBar.css';

const SIZE_MAP: Record<CircularProgressSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

const DEFAULT_THICKNESS: Record<CircularProgressSize, number> = {
  xs: 1.5,
  sm: 2,
  md: 2,
  lg: 2.5,
  xl: 3,
};

const LABEL_FONT_SIZE: Record<CircularProgressSize, string> = {
  xs: vars.typography.fontSize.xxs,
  sm: vars.typography.fontSize.xxs,
  md: vars.typography.fontSize.xs,
  lg: vars.typography.fontSize.xs,
  xl: vars.typography.fontSize.sm,
};

const NAMED_COLOR_MAP: Record<string, string> = {
  primary: vars.colors.accent.primary,
  success: vars.colors.accent.success,
  warning: vars.colors.accent.warning,
  error: vars.colors.accent.error,
};

function resolveColor(color: ProgressBarColor): string {
  return NAMED_COLOR_MAP[color as string] ?? color;
}

function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function toPercent(clamped: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((clamped - min) / (max - min)) * 100;
}

function deriveValueText(
  ariaValueText: string | undefined,
  label: React.ReactNode
): string | undefined {
  if (ariaValueText !== undefined) return ariaValueText;
  if (typeof label === 'string') return label;
  if (typeof label === 'number') return String(label);
  return undefined;
}

/**
 * Circular progress indicator.
 *
 * Determinate when `value` is provided; indeterminate (rotating arc) when
 * `value` is `undefined`. Renders an SVG with two stacked circles — track
 * and fill — using `stroke-dasharray` to draw the progress arc. Honors
 * `prefers-reduced-motion`.
 *
 * @example
 * ```tsx
 * <CircularProgress value={75} />
 * <CircularProgress size="xl" value={42} showLabel />
 * <CircularProgress /> // indeterminate
 * ```
 */
export const CircularProgress = /*#__PURE__*/ React.memo<CircularProgressProps>(
  ({
    value,
    min = 0,
    max = 100,
    size = 'md',
    thickness,
    color = 'primary',
    showLabel = false,
    label,
    ariaLabel,
    ariaValueText,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const indeterminate = value === undefined;
    const clampedValue = indeterminate ? 0 : clampValue(value, min, max);
    const percent = toPercent(clampedValue, min, max);
    const resolvedColor = resolveColor(color);
    const diameter = SIZE_MAP[size];
    const stroke = thickness ?? DEFAULT_THICKNESS[size];
    const radius = (diameter - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = indeterminate
      ? circumference * 0.75
      : circumference * (1 - percent / 100);

    const inlineVars = assignInlineVars({
      [progressColorVar]: resolvedColor,
    });

    const percentText = `${Math.round(percent)}%`;
    const labelContent = label ?? (indeterminate ? null : percentText);
    const showLabelText = showLabel && labelContent !== null;

    const ariaProps: React.AriaAttributes = {
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-label': ariaLabel ?? (indeterminate ? 'Loading' : undefined),
    };
    if (!indeterminate) {
      ariaProps['aria-valuenow'] = clampedValue;
      const valueText = deriveValueText(ariaValueText, label);
      if (valueText !== undefined) {
        ariaProps['aria-valuetext'] = valueText;
      }
    }

    return (
      <div
        ref={ref}
        role="progressbar"
        className={cx(circularRootStyle, className)}
        style={{
          ...inlineVars,
          width: diameter,
          height: diameter,
          ...style,
        }}
        data-testid={testId}
        data-indeterminate={indeterminate ? 'true' : undefined}
        {...ariaProps}
        {...rest}
      >
        <svg
          className={circularSvgStyle}
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
          aria-hidden
        >
          <circle
            className={circularTrackCircleStyle}
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
          />
          <circle
            className={cx(
              circularFillCircleStyle,
              indeterminate && circularIndeterminateStyle
            )}
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={
              indeterminate
                ? undefined
                : `rotate(-90 ${diameter / 2} ${diameter / 2})`
            }
          />
        </svg>
        {showLabelText ? (
          <span
            className={circularLabelStyle}
            style={{ fontSize: LABEL_FONT_SIZE[size] }}
          >
            {labelContent}
          </span>
        ) : null}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';
