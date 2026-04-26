import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

export type SegmentedControlSize = Size;

export type SegmentedControlOrientation = 'horizontal' | 'vertical';

/**
 * Visual variants for SegmentedControl.
 * - `subtle`: container has secondary background, selected segment lifts to surface
 * - `solid`: filled accent for selected segment, muted for others
 * - `outline`: bordered container, selected segment marked with accent edge
 */
export type SegmentedControlVariant = 'subtle' | 'solid' | 'outline';

// --- Root ---

export interface SegmentedControlBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onChange'
> {
  /** Currently selected value (controlled) */
  value?: string;

  /** Default selected value (uncontrolled) */
  defaultValue?: string;

  /**
   * Size.
   * - `sm`: 20px height (toolbar density)
   * - `md`: 24px height (default)
   * - `lg`: 32px height
   * @default "md"
   */
  size?: SegmentedControlSize;

  /**
   * Layout direction.
   * @default "horizontal"
   */
  orientation?: SegmentedControlOrientation;

  /**
   * Visual style.
   * @default "subtle"
   */
  variant?: SegmentedControlVariant;

  /**
   * Stretch the control to fill the parent container's width (horizontal)
   * or height (vertical). Each segment grows equally.
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether the control is disabled in its entirety.
   * @default false
   */
  disabled?: boolean;

  /** Change handler — fires when a different segment is selected. */
  onChange?: (value: string) => void;

  /**
   * Children — typically `SegmentedControlItem` components.
   */
  children: React.ReactNode;

  /**
   * Optional aria-label for the control as a whole.
   * @default "Segmented control"
   */
  'aria-label'?: string;
}

export type SegmentedControlProps = Prettify<SegmentedControlBaseProps>;

// --- Item ---

export interface SegmentedControlItemBaseProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'children'
> {
  /** Unique value for this segment. */
  value: string;

  /**
   * Visible label. Optional when `icon` is provided (for icon-only segments).
   */
  children?: React.ReactNode;

  /** Optional icon, rendered before the label. */
  icon?: React.ReactNode;

  /**
   * Tooltip shown on hover. Especially useful for icon-only segments.
   */
  tooltip?: React.ReactNode;

  /**
   * Disable just this segment.
   * @default false
   */
  disabled?: boolean;

  /** Test identifier for automated testing. */
  testId?: string;

  ref?: React.Ref<HTMLButtonElement>;
}

export type SegmentedControlItemProps = Prettify<SegmentedControlItemBaseProps>;

// --- Context ---

export interface SegmentedControlContextValue {
  value: string;
  size: SegmentedControlSize;
  variant: SegmentedControlVariant;
  orientation: SegmentedControlOrientation;
  disabled: boolean;
  fullWidth: boolean;
  onChange: (value: string) => void;
  /** Registers an item element for sliding indicator measurement. */
  registerItem: (value: string, node: HTMLButtonElement | null) => void;
}
