import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';

/**
 * Which axes can scroll.
 */
export type ScrollAreaDirection = 'vertical' | 'horizontal' | 'both';

/**
 * Scrollbar visibility behavior.
 * - `auto`: Show on scroll/hover, hide after idle timeout
 * - `always`: Always visible
 * - `hover`: Show only when hovering the scroll area
 * - `never`: Hide scrollbars entirely (still scrollable via wheel/touch)
 */
export type ScrollbarVisibility = 'auto' | 'always' | 'hover' | 'never';

export interface ScrollAreaBaseProps extends BaseComponent {
  /**
   * Scrollable content
   */
  children: React.ReactNode;

  /**
   * Scroll direction
   * @default "vertical"
   */
  direction?: ScrollAreaDirection;

  /**
   * Scrollbar visibility behavior
   * @default "auto"
   */
  scrollbarVisibility?: ScrollbarVisibility;

  /**
   * Delay in ms before scrollbar auto-hides
   * Only applies when scrollbarVisibility is "auto"
   * @default 1000
   */
  hideDelay?: number;

  /**
   * Scrollbar width in pixels
   * @default 6
   */
  scrollbarWidth?: number;

  /**
   * Minimum scrollbar thumb length in pixels
   * @default 30
   */
  minThumbLength?: number;

  /**
   * Padding between scrollbar and content edge in pixels
   * @default 2
   */
  scrollbarPadding?: number;

  /**
   * Whether to show fade masks at scroll boundaries
   * @default false
   */
  fadeMask?: boolean;

  /**
   * Height of the fade mask gradient in pixels
   * @default 24
   */
  fadeMaskHeight?: number;

  /**
   * Maximum height of the scroll area
   */
  maxHeight?: number | string;

  /**
   * Maximum width of the scroll area
   */
  maxWidth?: number | string;

  /**
   * Callback when scroll position changes
   */
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;

  /**
   * Callback when scroll reaches top edge
   */
  onScrollTop?: () => void;

  /**
   * Callback when scroll reaches bottom edge
   */
  onScrollBottom?: () => void;
}

export type ScrollAreaProps = Prettify<ScrollAreaBaseProps>;
