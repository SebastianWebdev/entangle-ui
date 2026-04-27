import type React from 'react';
import type { BaseComponent, Size } from '@/types/common';
import type { LiteralUnion, Prettify } from '@/types/utilities';

export type ProgressBarSize = Size;

/**
 * Semantic color name or an arbitrary CSS color string.
 *
 * Named colors map onto Entangle accent tokens.
 */
export type ProgressBarColor = LiteralUnion<
  'primary' | 'success' | 'warning' | 'error'
>;

export type ProgressBarLabelPosition = false | 'inline' | 'overlay';

export interface ProgressBarBaseProps extends BaseComponent<HTMLDivElement> {
  /**
   * Current progress value. When `undefined`, the bar is indeterminate
   * (an animated sliding gradient).
   */
  value?: number;

  /**
   * Maximum value. Progress percentage = (value / max) * 100.
   * @default 100
   */
  max?: number;

  /**
   * Minimum value. Useful when reporting progress over a range that
   * does not start at 0.
   * @default 0
   */
  min?: number;

  /**
   * Bar height.
   * - `sm`: 2px
   * - `md`: 4px (default)
   * - `lg`: 8px
   * @default "md"
   */
  size?: ProgressBarSize;

  /**
   * Fill color.
   * - `primary` (default): `accent.primary`
   * - `success`: `accent.success`
   * - `warning`: `accent.warning`
   * - `error`: `accent.error`
   * - any other string: passed through as a raw CSS color
   * @default "primary"
   */
  color?: ProgressBarColor;

  /**
   * Show the percentage as text.
   * - `false` (default): no text
   * - `inline`: rendered to the right of the bar
   * - `overlay`: centered over the bar (only practical at `size="lg"`)
   * @default false
   */
  showLabel?: ProgressBarLabelPosition;

  /**
   * Custom label override. When provided, replaces the percentage with
   * this content. Useful for "12 / 50 files" or "3.2 MB / 8.0 MB".
   */
  label?: React.ReactNode;

  /**
   * Striped pattern overlay — adds visual texture to the fill.
   * @default false
   */
  striped?: boolean;

  /**
   * When `striped` is true, animate the stripes (moving diagonal pattern).
   * Honored only when motion is allowed (`prefers-reduced-motion`).
   * @default false
   */
  animated?: boolean;

  /**
   * Accessible label. Defaults to `"Loading"` for indeterminate bars.
   */
  ariaLabel?: string;

  /**
   * Human-readable description of the current progress, exposed via
   * `aria-valuetext`. Useful when the percentage alone does not convey
   * what is happening (e.g. `"Exporting frame 45 of 120"`).
   *
   * If omitted and `label` is a string or number, that value is used.
   */
  ariaValueText?: string;
}

export type ProgressBarProps = Prettify<ProgressBarBaseProps>;

// ─── CircularProgress ─────────────────────────────────────────────

export type CircularProgressSize = 'xs' | Size | 'xl';

export interface CircularProgressBaseProps extends BaseComponent<HTMLDivElement> {
  /** Current value; `undefined` → indeterminate (rotating arc). */
  value?: number;

  /** @default 100 */
  max?: number;

  /** @default 0 */
  min?: number;

  /**
   * Diameter.
   * - `xs`: 16px
   * - `sm`: 20px
   * - `md`: 24px (default)
   * - `lg`: 32px
   * - `xl`: 48px
   * @default "md"
   */
  size?: CircularProgressSize;

  /**
   * Stroke thickness in px. If omitted, derived from `size`:
   * `xs → 1.5`, `sm/md → 2`, `lg → 2.5`, `xl → 3`.
   */
  thickness?: number;

  /** Same color options as `ProgressBar`. @default "primary" */
  color?: ProgressBarColor;

  /**
   * Render the percentage in the center of the circle.
   * Only practical at `size="lg"` or larger.
   * @default false
   */
  showLabel?: boolean;

  /** Custom center label. Overrides percentage. */
  label?: React.ReactNode;

  /**
   * Accessible label. Defaults to `"Loading"` for indeterminate progress.
   */
  ariaLabel?: string;

  /**
   * Human-readable description of the current progress, exposed via
   * `aria-valuetext`. If omitted and `label` is a string or number, that
   * value is used.
   */
  ariaValueText?: string;
}

export type CircularProgressProps = Prettify<CircularProgressBaseProps>;
