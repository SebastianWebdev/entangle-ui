'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';
import type { ProgressBarColor, ProgressBarProps } from './ProgressBar.types';
import {
  progressColorVar,
  progressFillBaseStyle,
  progressFillStripedAnimatedStyle,
  progressFillStripedStyle,
  progressFillWidthVar,
  progressIndeterminateStyle,
  progressInlineLabelStyle,
  progressOverlayLabelStyle,
  progressRootStyle,
  progressTrackRecipe,
} from './ProgressBar.css';

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
 * Linear progress indicator.
 *
 * Determinate when `value` is provided; indeterminate (animated sliding bar)
 * when `value` is `undefined`. Supports inline / overlay / custom labels,
 * striped texture (optionally animated), and arbitrary CSS colors. Honors
 * `prefers-reduced-motion`.
 *
 * @example
 * ```tsx
 * <ProgressBar value={60} />
 * <ProgressBar value={50} showLabel="inline" />
 * <ProgressBar size="lg" value={75} striped animated />
 * <ProgressBar /> // indeterminate
 * ```
 */
export const ProgressBar = /*#__PURE__*/ React.memo<ProgressBarProps>(
  ({
    value,
    min = 0,
    max = 100,
    size = 'md',
    color = 'primary',
    showLabel = false,
    label,
    striped = false,
    animated = false,
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

    const inlineVars = assignInlineVars({
      [progressColorVar]: resolvedColor,
      [progressFillWidthVar]: `${percent}%`,
    });

    const fillClassName = cx(
      progressFillBaseStyle,
      striped && progressFillStripedStyle,
      striped && animated && progressFillStripedAnimatedStyle
    );

    const percentText = `${Math.round(percent)}%`;
    const labelContent = label ?? (indeterminate ? null : percentText);

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
        className={cx(progressRootStyle, className)}
        style={{ ...inlineVars, ...style }}
        data-testid={testId}
        data-indeterminate={indeterminate ? 'true' : undefined}
        {...ariaProps}
        {...rest}
      >
        <div className={progressTrackRecipe({ size })}>
          {indeterminate ? (
            <div className={progressIndeterminateStyle} aria-hidden />
          ) : (
            <div className={fillClassName} aria-hidden />
          )}
          {showLabel === 'overlay' && labelContent !== null ? (
            <span className={progressOverlayLabelStyle}>{labelContent}</span>
          ) : null}
        </div>
        {showLabel === 'inline' && labelContent !== null ? (
          <span className={progressInlineLabelStyle}>{labelContent}</span>
        ) : null}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
