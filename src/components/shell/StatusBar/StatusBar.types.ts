import type { ReactNode } from 'react';

export type StatusBarSize = 'sm' | 'md';
export type StatusBarVariant = 'default' | 'error' | 'accent';

export interface StatusBarProps {
  /** Size of the status bar */
  $size?: StatusBarSize;
  /** Visual variant */
  $variant?: StatusBarVariant;
  /** Children (StatusBar.Section components) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
}

export type StatusBarSectionSide = 'left' | 'right';

export interface StatusBarSectionProps {
  /** Which side of the status bar */
  $side?: StatusBarSectionSide;
  /** Children (StatusBar.Item components) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
}

export interface StatusBarItemProps {
  /** Click handler — renders as button when provided, span otherwise */
  onClick?: () => void;
  /** Icon to display before label */
  icon?: ReactNode;
  /** Text label */
  children?: ReactNode;
  /** Tooltip text */
  title?: string;
  /** Badge value — number or boolean (dot) */
  badge?: number | boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
}

export interface StatusBarContextValue {
  size: StatusBarSize;
}
