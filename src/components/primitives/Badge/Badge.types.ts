import type React from 'react';
import type { BaseComponent, Size } from '@/types/common';
import type { LiteralUnion, Prettify } from '@/types/utilities';

/**
 * Visual style of the badge.
 *
 * - `subtle`: Tinted translucent fill with colored text (default)
 * - `solid`: Saturated fill with contrasting text
 * - `outline`: Transparent background with a colored border
 * - `dot`: Small colored circle followed by the label
 */
export type BadgeVariant = 'subtle' | 'solid' | 'outline' | 'dot';

/**
 * Badge size scale — includes an extra `xs` step below the standard sizes
 * because badges commonly need to fit inside dense rows.
 */
export type BadgeSize = 'xs' | Size;

/**
 * Semantic color name or an arbitrary CSS color string.
 *
 * Named colors map to Entangle theme accents:
 * - `neutral` → muted text
 * - `primary` / `info` → accent primary
 * - `success` / `warning` / `error` → corresponding accent
 *
 * Any other string (hex, rgb, hsl, etc.) is used verbatim.
 */
export type BadgeColor = LiteralUnion<
  'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info'
>;

export interface BadgeBaseProps extends BaseComponent<HTMLSpanElement> {
  /**
   * Visual style.
   * @default "subtle"
   */
  variant?: BadgeVariant;
  /**
   * Size.
   * @default "sm"
   */
  size?: BadgeSize;
  /**
   * Semantic color or arbitrary CSS color string.
   *
   * Named colors map to theme accents; hex/rgb/hsl values are passed through.
   * @default "neutral"
   */
  color?: BadgeColor;
  /**
   * Auto-uppercase the label (matches common editor-UI convention for tags).
   * @default false
   */
  uppercase?: boolean;
  /** Icon rendered before the label. */
  icon?: React.ReactNode;
  /**
   * Show a remove (×) button; fires `onRemove` when clicked.
   * @default false
   */
  removable?: boolean;
  /** Called when the remove button is clicked. */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Label content. */
  children?: React.ReactNode;
}

export type BadgeProps = Prettify<BadgeBaseProps>;
