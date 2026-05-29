import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import type React from 'react';

/**
 * Visual shape of a skeleton block.
 *
 * - `rect`  — generic rectangle, the default for content blocks
 * - `circle` — perfect circle (avatars, dots); width and height should match
 * - `line`  — text-line skeleton with rounded ends and a thin default height
 */
export type SkeletonShape = 'rect' | 'circle' | 'line';

/**
 * Loading-placeholder animation style.
 *
 * - `pulse` — opacity oscillation (default; subtle, low-cost)
 * - `wave`  — shimmer gradient sweep (left → right)
 * - `none`  — static; pick this when many skeletons render at once
 */
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

export interface SkeletonBaseProps extends BaseComponent {
  /**
   * Shape of the skeleton.
   * @default "rect"
   */
  shape?: SkeletonShape;

  /**
   * Width. Number → px, string → CSS value (`100%`, `12rem`, `min-content`).
   * @default "100%"
   */
  width?: number | string;

  /**
   * Height. Number → px, string → CSS value.
   *
   * Defaults to `12px` for `shape="line"`. For `shape="circle"`, height
   * follows `width` automatically when not provided.
   */
  height?: number | string;

  /**
   * Border-radius override. Defaults are derived from the shape:
   * `rect` → `vars.borderRadius.sm`, `line` → `vars.borderRadius.lg`,
   * `circle` → `50%`.
   * Number → px, string → CSS value.
   */
  borderRadius?: number | string;

  /**
   * Animation style.
   * @default "pulse"
   */
  animation?: SkeletonAnimation;
}

export type SkeletonProps = Prettify<SkeletonBaseProps>;

export interface SkeletonGroupBaseProps extends BaseComponent {
  /**
   * Number of skeletons to auto-generate. Ignored when `children` is provided.
   */
  count?: number;

  /**
   * Spacing between items. A number is mapped onto the spacing scale
   * (0 → `0`, 1 → `xs`, 2 → `sm`, 3 → `md`, 4 → `lg`, 5 → `xl`,
   * 6 → `xxl`, 7+ → `xxxl`). A string passes through as a raw CSS gap value.
   * @default 2
   */
  spacing?: number | string;

  /**
   * Layout direction.
   * @default "column"
   */
  direction?: 'row' | 'column';

  /**
   * Props applied to each auto-generated `Skeleton` (used only with `count`).
   */
  itemProps?: Partial<SkeletonProps>;

  /**
   * Children — when provided, overrides `count` and the wrapper just lays
   * the children out using `direction` + `spacing`.
   */
  children?: React.ReactNode;
}

export type SkeletonGroupProps = Prettify<SkeletonGroupBaseProps>;

/**
 * Pre-built skeleton arrangement.
 *
 * - `card`  — circular avatar, a few text lines, and a thumbnail block
 * - `list`  — vertical rows of avatar + two text lines
 * - `table` — header row + data rows laid out on a CSS grid
 * - `grid`  — uniform grid of square blocks (no animation by default)
 * - `chat`  — alternating left/right message bubbles
 */
export type SkeletonLayoutVariant = 'card' | 'list' | 'table' | 'grid' | 'chat';

export interface SkeletonLayoutBaseProps extends BaseComponent {
  /**
   * Which pre-built arrangement to render.
   */
  variant: SkeletonLayoutVariant;

  /**
   * Number of repeating units in the layout.
   *
   * - `list` — number of rows (default 5)
   * - `table` — number of data rows excluding the header (default 5)
   * - `grid` — total number of cells (default 12)
   * - `chat` — number of message bubbles (default 4)
   * - `card` — ignored (a card is a single unit)
   */
  count?: number;

  /**
   * Number of columns. Only meaningful for `grid` and `table` variants.
   * @default 4
   */
  columns?: number;

  /**
   * Animation applied to every nested skeleton.
   * Defaults to `pulse` for most variants and `none` for `grid` — running
   * dozens of animations at once is more noise than help on dense surfaces.
   */
  animation?: SkeletonAnimation;

  /**
   * Width of the layout container. Number → px, string → CSS value.
   * @default "100%"
   */
  width?: number | string;
}

export type SkeletonLayoutProps = Prettify<SkeletonLayoutBaseProps>;
