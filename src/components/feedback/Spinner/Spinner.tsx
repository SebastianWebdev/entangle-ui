'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';
import type { SpinnerColor, SpinnerProps, SpinnerSize } from './Spinner.types';
import {
  spinnerColorVar,
  spinnerDotRecipe,
  spinnerDotsSizerStyle,
  spinnerLabelStyle,
  spinnerPulseStyle,
  spinnerRingStyle,
  spinnerRootStyle,
  spinnerSizeVar,
  visuallyHiddenStyle,
} from './Spinner.css';

const SIZE_MAP: Record<SpinnerSize, string> = {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '20px',
};

const NAMED_COLOR_MAP: Record<string, string> = {
  primary: vars.colors.text.primary,
  secondary: vars.colors.text.secondary,
  muted: vars.colors.text.muted,
  accent: vars.colors.accent.primary,
};

function resolveColor(color: SpinnerColor): string {
  return NAMED_COLOR_MAP[color as string] ?? color;
}

/**
 * Loading / activity indicator.
 *
 * Announces itself via `role="status"` and `aria-label`; honors
 * `prefers-reduced-motion` by halting animation and dimming the indicator.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner variant="dots" size="lg" />
 * <Spinner showLabel label="Fetching results..." />
 * ```
 */
export const Spinner = /*#__PURE__*/ React.memo<SpinnerProps>(
  ({
    size = 'md',
    variant = 'ring',
    color = 'accent',
    label = 'Loading...',
    showLabel = false,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const resolvedColor = resolveColor(color);
    const resolvedSize = SIZE_MAP[size];

    const inlineVars = assignInlineVars({
      [spinnerColorVar]: resolvedColor,
      [spinnerSizeVar]: resolvedSize,
    });

    const indicator =
      variant === 'ring' ? (
        <span className={spinnerRingStyle} aria-hidden />
      ) : variant === 'pulse' ? (
        <span className={spinnerPulseStyle} aria-hidden />
      ) : (
        <span className={spinnerDotsSizerStyle} aria-hidden>
          <span className={spinnerDotRecipe({ delay: '0' })} />
          <span className={spinnerDotRecipe({ delay: '1' })} />
          <span className={spinnerDotRecipe({ delay: '2' })} />
        </span>
      );

    return (
      <span
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cx(spinnerRootStyle, className)}
        style={{ ...inlineVars, ...style }}
        data-testid={testId}
        {...rest}
      >
        {indicator}
        {showLabel ? (
          <span className={spinnerLabelStyle}>{label}</span>
        ) : (
          <span className={visuallyHiddenStyle}>{label}</span>
        )}
      </span>
    );
  }
);

Spinner.displayName = 'Spinner';
