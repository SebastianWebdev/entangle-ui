import type { ReactNode } from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type ToolbarOrientation = 'horizontal' | 'vertical';
export type ToolbarSize = 'sm' | 'md';
export type ToolbarButtonVariant = 'default' | 'ghost' | 'filled';

export interface ToolbarBaseProps extends BaseComponent<HTMLDivElement> {
  /** Orientation of the toolbar */
  $orientation?: ToolbarOrientation;
  /** Size of toolbar items */
  $size?: ToolbarSize;
  /** Children (Toolbar.Button, Toolbar.Group, Toolbar.Separator, etc.) */
  children?: ReactNode;
  /** ARIA label for the toolbar */
  'aria-label'?: string;
}
export type ToolbarProps = Prettify<ToolbarBaseProps>;

export interface ToolbarButtonBaseProps extends Omit<
  BaseComponent<HTMLButtonElement>,
  'onClick'
> {
  /** Click handler */
  onClick?: () => void;
  /** Icon to display */
  icon?: ReactNode;
  /** Label text (visually hidden if icon provided) */
  children?: ReactNode;
  /** Tooltip text */
  tooltip?: string;
  /** Visual variant */
  $variant?: ToolbarButtonVariant;
  /** Disabled state */
  disabled?: boolean;
}
export type ToolbarButtonProps = Prettify<ToolbarButtonBaseProps>;

export interface ToolbarToggleBaseProps extends BaseComponent<HTMLButtonElement> {
  /** Whether the toggle is pressed */
  pressed: boolean;
  /** Called when the pressed state changes */
  onPressedChange: (pressed: boolean) => void;
  /** Icon to display */
  icon?: ReactNode;
  /** Label text */
  children?: ReactNode;
  /** Tooltip text */
  tooltip?: string;
  /** Disabled state */
  disabled?: boolean;
}
export type ToolbarToggleProps = Prettify<ToolbarToggleBaseProps>;

export interface ToolbarGroupBaseProps extends BaseComponent<HTMLDivElement> {
  /** Group label for accessibility */
  'aria-label'?: string;
  /** Children (Toolbar.Button, Toolbar.Toggle) */
  children?: ReactNode;
}
export type ToolbarGroupProps = Prettify<ToolbarGroupBaseProps>;

export type ToolbarSeparatorProps = Prettify<BaseComponent<HTMLDivElement>>;

export type ToolbarSpacerProps = Prettify<BaseComponent<HTMLDivElement>>;

export interface ToolbarContextValue {
  orientation: ToolbarOrientation;
  size: ToolbarSize;
}
