import type React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

/**
 * Spacing map — numeric indexes map onto the theme spacing scale.
 *
 * - `0` → no spacing
 * - `1` → `xs` (2px)
 * - `2` → `sm` (4px)
 * - `3` → `md` (8px)
 * - `4` → `lg` (12px)
 * - `5` → `xl` (16px)
 * - `6` → `xxl` (24px)
 * - `7` → `xxxl` (32px)
 */
export type DividerSpacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface DividerBaseProps extends BaseComponent<HTMLDivElement> {
  /**
   * Divider axis.
   * @default "horizontal"
   */
  orientation?: DividerOrientation;
  /**
   * Line style.
   * @default "solid"
   */
  variant?: DividerVariant;
  /**
   * Margin along the axis (top/bottom for horizontal, left/right for vertical).
   *
   * Numbers map onto the theme spacing scale (see `DividerSpacing`).
   * Strings are passed through verbatim.
   *
   * @default 0
   */
  spacing?: DividerSpacing | string;
  /**
   * Optional label rendered centered on the line.
   *
   * Only honored for horizontal dividers — the pseudo-line layout does
   * not translate well to vertical dividers in a flex row.
   */
  label?: React.ReactNode;
}

export type DividerProps = Prettify<DividerBaseProps>;
