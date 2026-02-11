import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';

export type BaseTooltipRootProps = BaseTooltip.Root.Props;
export type BaseTooltipPopupProps = Parameters<typeof BaseTooltip.Popup>[0];
export type BaseTooltipPositionerProps = Parameters<
  typeof BaseTooltip.Positioner
>[0];

/**
 * Intuitive placement options similar to MUI
 */
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/**
 * Collision handling strategies - simplified presets
 */
export type TooltipCollisionStrategy =
  | 'flip' // Flip to opposite side
  | 'shift' // Shift within bounds
  | 'hide' // Hide when no space
  | 'flip-shift' // Flip first, then shift
  | 'smart' // Intelligent fallback with axis switching
  | 'none'; // No collision handling

export type CollisionAvoidance =
  BaseTooltipPositionerProps['collisionAvoidance'];

/**
 * Advanced collision configuration for power users
 */

export interface TooltipCollisionConfig {
  /**
   * How to avoid collisions on the side axis
   */
  side?: 'flip' | 'shift' | 'none';

  /**
   * How to avoid collisions on the align axis
   */
  align?: 'flip' | 'shift' | 'none';

  /**
   * Fallback behavior when preferred axis doesn't fit
   */
  fallbackAxisSide?: 'start' | 'end' | 'none';
}

/**
 * Advanced positioning configuration
 */
export interface TooltipPositioner {
  /**
   * Distance in pixels from the trigger element
   * @default 8
   */
  offset?: number;

  /**
   * Padding in pixels from viewport edges during collision detection
   * @default 8
   */
  padding?: number;

  /**
   * Whether the tooltip should stick to the viewport during scroll
   * @default false
   */
  sticky?: boolean;

  /**
   * Custom boundary element for collision detection
   * Can be a CSS selector or HTMLElement
   * @default viewport
   */
  boundary?: string | HTMLElement;

  /**
   * Whether to track cursor position on specified axis
   */
  trackCursor?: 'x' | 'y' | 'both';
}

/**
 * Animation configuration
 */
export interface TooltipAnimation {
  /**
   * Whether animations are enabled
   * @default true
   */
  animated?: boolean;

  /**
   * Animation duration in milliseconds
   * @default 200
   */
  duration?: number;

  /**
   * Animation easing function
   * @default 'ease-out'
   */
  easing?: string;
}
