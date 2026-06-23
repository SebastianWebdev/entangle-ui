import type { BaseComponent, Size } from '@/types/common';
import type { LiteralUnion, Prettify } from '@/types/utilities';

export type SpinnerSize = 'xs' | Size;
export type SpinnerVariant = 'ring' | 'dots' | 'pulse';

/**
 * Semantic color name or an arbitrary CSS color string.
 *
 * Named colors map to Entangle theme tokens.
 */
export type SpinnerColor = LiteralUnion<
  'primary' | 'secondary' | 'accent' | 'muted'
>;

export interface SpinnerBaseProps extends BaseComponent<HTMLSpanElement> {
  /**
   * Size scale.
   * @default "md"
   */
  size?: SpinnerSize;
  /**
   * Visual style.
   * @default "ring"
   */
  variant?: SpinnerVariant;
  /**
   * Color. Accepts a named token or any CSS color string.
   * @default "accent"
   */
  color?: SpinnerColor;
  /**
   * Visible text / `aria-label`.
   * @default "Loading..."
   */
  label?: string;
  /**
   * Show the label visually next to the spinner.
   * @default false
   */
  showLabel?: boolean;
  /**
   * Render the spinner as purely decorative: `role="presentation"` +
   * `aria-hidden`, with no live region. Use when the spinner sits inside an
   * existing live region (e.g. `StatusBar`, which is itself `role="status"`) so
   * the activity is not announced twice.
   * @default false
   */
  decorative?: boolean;
}

export type SpinnerProps = Prettify<SpinnerBaseProps>;
