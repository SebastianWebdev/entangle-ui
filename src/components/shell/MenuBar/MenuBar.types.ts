import type { ReactNode } from 'react';

export type MenuBarSize = 'sm' | 'md';

export interface MenuBarProps {
  /** Size of the menu bar */
  $size?: MenuBarSize;
  /** Vertical gap in pixels between top-level trigger and dropdown */
  menuOffset?: number;
  /** Children (MenuBar.Menu components) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
}

export interface MenuBarMenuProps {
  /** The trigger label */
  label: string;
  /** Dropdown menu items */
  children?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
}

export interface MenuBarItemProps {
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
  /** Additional CSS class */
  className?: string;
}

export interface MenuBarSubProps {
  /** Sub-menu trigger label */
  label: string;
  /** Sub-menu items */
  children?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
}

export interface MenuBarSeparatorProps {
  /** Additional CSS class */
  className?: string;
}

export interface MenuBarContextValue {
  size: MenuBarSize;
  menuOffset: number;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  registerMenu: (id: string) => void;
  unregisterMenu: (id: string) => void;
  menuIds: string[];
}
