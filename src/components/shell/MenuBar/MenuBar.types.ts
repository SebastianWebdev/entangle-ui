import type { ReactNode } from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type MenuBarSize = 'sm' | 'md';

export interface MenuBarBaseProps extends BaseComponent<HTMLDivElement> {
  /** Size of the menu bar */
  $size?: MenuBarSize;
  /** Vertical gap in pixels between top-level trigger and dropdown */
  menuOffset?: number;
  /** Children (MenuBar.Menu components) */
  children?: ReactNode;
}
export type MenuBarProps = Prettify<MenuBarBaseProps>;

export interface MenuBarMenuBaseProps extends BaseComponent<HTMLDivElement> {
  /** The trigger label */
  label: string;
  /** Dropdown menu items */
  children?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
}
export type MenuBarMenuProps = Prettify<MenuBarMenuBaseProps>;

export interface MenuBarItemBaseProps extends Omit<
  BaseComponent<HTMLButtonElement>,
  'onClick'
> {
  /** Click handler */
  onClick?: () => void;
  /** Keyboard shortcut display text (not bound) */
  shortcut?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Icon before the label */
  icon?: ReactNode;
  /** Item label */
  children?: ReactNode;
}
export type MenuBarItemProps = Prettify<MenuBarItemBaseProps>;

export interface MenuBarSubBaseProps extends BaseComponent<HTMLDivElement> {
  /** Sub-menu trigger label */
  label: string;
  /** Sub-menu items */
  children?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
}
export type MenuBarSubProps = Prettify<MenuBarSubBaseProps>;

export type MenuBarSeparatorProps = Prettify<BaseComponent<HTMLDivElement>>;

export interface MenuBarContextValue {
  size: MenuBarSize;
  menuOffset: number;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  registerMenu: (id: string) => void;
  unregisterMenu: (id: string) => void;
  menuIds: string[];
}
