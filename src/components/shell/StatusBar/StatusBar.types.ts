import type { ReactNode } from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type StatusBarSize = 'sm' | 'md';
export type StatusBarVariant = 'default' | 'error' | 'accent';

export interface StatusBarBaseProps extends BaseComponent<HTMLDivElement> {
  /** Size of the status bar */
  $size?: StatusBarSize;
  /** Visual variant */
  $variant?: StatusBarVariant;
  /** Children (StatusBar.Section components) */
  children?: ReactNode;
}
export type StatusBarProps = Prettify<StatusBarBaseProps>;

export type StatusBarSectionSide = 'left' | 'right';

export interface StatusBarSectionBaseProps
  extends BaseComponent<HTMLDivElement> {
  /** Which side of the status bar */
  $side?: StatusBarSectionSide;
  /** Children (StatusBar.Item components) */
  children?: ReactNode;
}
export type StatusBarSectionProps = Prettify<StatusBarSectionBaseProps>;

export interface StatusBarItemBaseProps
  extends Omit<BaseComponent<HTMLElement>, 'onClick'> {
  /** Click handler - renders as button when provided, span otherwise */
  onClick?: () => void;
  /** Icon to display before label */
  icon?: ReactNode;
  /** Text label */
  children?: ReactNode;
  /** Tooltip text */
  title?: string;
  /** Badge value - number or boolean (dot) */
  badge?: number | boolean;
  /** Disabled state */
  disabled?: boolean;
}
export type StatusBarItemProps = Prettify<StatusBarItemBaseProps>;

export interface StatusBarContextValue {
  size: StatusBarSize;
}
