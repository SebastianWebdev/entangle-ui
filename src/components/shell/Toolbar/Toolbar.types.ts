import type { ReactNode } from 'react';

export type ToolbarOrientation = 'horizontal' | 'vertical';
export type ToolbarSize = 'sm' | 'md';
export type ToolbarButtonVariant = 'default' | 'ghost' | 'filled';

export interface ToolbarProps {
  /** Orientation of the toolbar */
  $orientation?: ToolbarOrientation;
  /** Size of toolbar items */
  $size?: ToolbarSize;
  /** Children (Toolbar.Button, Toolbar.Group, Toolbar.Separator, etc.) */
  children?: ReactNode;
  /** ARIA label for the toolbar */
  'aria-label'?: string;
  /** Additional CSS class */
  className?: string;
}

export interface ToolbarButtonProps {
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
  /** Additional CSS class */
  className?: string;
}

export interface ToolbarToggleProps {
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
  /** Additional CSS class */
  className?: string;
}

export interface ToolbarGroupProps {
  /** Group label for accessibility */
  'aria-label'?: string;
  /** Children (Toolbar.Button, Toolbar.Toggle) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
}

export interface ToolbarSeparatorProps {
  /** Additional CSS class */
  className?: string;
}

export interface ToolbarSpacerProps {
  /** Additional CSS class */
  className?: string;
}

export interface ToolbarContextValue {
  orientation: ToolbarOrientation;
  size: ToolbarSize;
}
