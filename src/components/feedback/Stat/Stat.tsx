'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';
import {
  statContentStyle,
  statDeltaColorVar,
  statDeltaIconStyle,
  statDeltaStyle,
  statHelperStyle,
  statIconStyle,
  statLabelStyle,
  statRoot,
  statValueRecipe,
} from './Stat.css';
import type {
  StatDelta,
  StatDeltaDirection,
  StatDeltaSemantics,
  StatProps,
} from './Stat.types';

const ARROW_PATHS: Record<StatDeltaDirection, string> = {
  up: 'M6 2 L10 7 L7 7 L7 10 L5 10 L5 7 L2 7 Z',
  down: 'M6 10 L2 5 L5 5 L5 2 L7 2 L7 5 L10 5 Z',
  neutral: 'M2 6 L10 6 L10 7 L2 7 Z',
};

function deltaColor(
  direction: StatDeltaDirection,
  semantics: StatDeltaSemantics
): string {
  if (semantics === 'neutral' || direction === 'neutral') {
    return vars.colors.text.muted;
  }
  const isUpGood = semantics === 'positive';
  const upColor = isUpGood
    ? vars.colors.accent.success
    : vars.colors.accent.error;
  const downColor = isUpGood
    ? vars.colors.accent.error
    : vars.colors.accent.success;
  return direction === 'up' ? upColor : downColor;
}

function DeltaIcon({ direction }: { direction: StatDeltaDirection }) {
  return (
    <svg
      className={statDeltaIconStyle}
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ARROW_PATHS[direction]} fill="currentColor" />
    </svg>
  );
}

function DeltaDisplay({ delta }: { delta: StatDelta }) {
  const semantics = delta.semantics ?? 'positive';
  const color = deltaColor(delta.direction, semantics);
  return (
    <span
      className={statDeltaStyle}
      style={assignInlineVars({ [statDeltaColorVar]: color })}
    >
      <DeltaIcon direction={delta.direction} />
      {delta.value}
    </span>
  );
}

/**
 * KPI / metric display: label + value + optional trend delta.
 *
 * Use `delta.semantics` to indicate whether "up" is good. Errors and
 * latency, for example, want `semantics: "negative"` so an upward
 * direction shows red.
 *
 * @example
 * ```tsx
 * <Stat
 *   label="MRR"
 *   value="$12,400"
 *   delta={{ value: '+8.2%', direction: 'up' }}
 *   helper="vs. last month"
 * />
 * ```
 */
export const Stat: React.FC<StatProps> = ({
  label,
  value,
  delta,
  helper,
  icon,
  size = 'md',
  className,
  style,
  testId,
  ref,
  ...rest
}) => (
  <div
    ref={ref}
    className={cx(statRoot({ size }), className)}
    style={style}
    data-testid={testId}
    {...rest}
  >
    {icon && <div className={statIconStyle}>{icon}</div>}
    <div className={statContentStyle}>
      <p className={statLabelStyle}>{label}</p>
      <p className={statValueRecipe({ size })}>{value}</p>
      {delta && <DeltaDisplay delta={delta} />}
      {helper && <p className={statHelperStyle}>{helper}</p>}
    </div>
  </div>
);

Stat.displayName = 'Stat';
