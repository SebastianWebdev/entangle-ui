import React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

/**
 * Split direction.
 * - `horizontal`: panels side by side (divider is a vertical bar)
 * - `vertical`: panels stacked (divider is a horizontal bar)
 */
export type SplitDirection = 'horizontal' | 'vertical';

/**
 * Panel size - number for pixels, string for CSS values (e.g. "30%").
 */
export type PanelSize = number | string;

/**
 * Configuration for a single panel.
 */
export interface PanelConfig {
  /** Initial size in pixels or CSS value (e.g. "30%") */
  defaultSize?: PanelSize;

  /** Minimum size in pixels */
  minSize?: number;

  /** Maximum size in pixels */
  maxSize?: number;

  /**
   * Whether this panel can collapse to zero width/height
   * @default false
   */
  collapsible?: boolean;

  /**
   * Size threshold below which the panel snaps to collapsed.
   * Only used when collapsible is true.
   * @default minSize / 2
   */
  collapseThreshold?: number;
}

// --- SplitPane (Root) ---

interface SplitPaneBaseProps extends BaseComponent {
  /**
   * Split direction
   * - `horizontal`: panes side by side (divider is vertical bar)
   * - `vertical`: panes stacked (divider is horizontal bar)
   * @default "horizontal"
   */
  direction?: SplitDirection;

  /**
   * Panel size configuration array.
   * Must match the number of SplitPanePanel children.
   * If not provided, panels split equally.
   */
  panels?: PanelConfig[];

  /**
   * Controlled panel sizes in pixels.
   * Array of current sizes for each panel.
   */
  sizes?: number[];

  /**
   * Divider width/height in pixels
   * @default 4
   */
  dividerSize?: number;

  /**
   * SplitPanePanel children (minimum 2)
   */
  children: React.ReactNode;

  /**
   * Callback when panel sizes change during drag
   * @param sizes - Array of panel sizes in pixels
   */
  onResize?: (sizes: number[]) => void;

  /**
   * Callback when resize ends (drag released)
   * Use for persisting layout to storage.
   */
  onResizeEnd?: (sizes: number[]) => void;

  /**
   * Callback when a panel collapses or expands
   */
  onCollapseChange?: (panelIndex: number, collapsed: boolean) => void;
}

export type SplitPaneProps = Prettify<SplitPaneBaseProps>;

// --- SplitPanePanel ---

interface SplitPanePanelBaseProps extends BaseComponent {
  /** Panel content */
  children?: React.ReactNode;
}

export type SplitPanePanelProps = Prettify<SplitPanePanelBaseProps>;
