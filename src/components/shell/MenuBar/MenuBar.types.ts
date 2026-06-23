import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import type { ReactNode } from 'react';

export type MenuBarSize = 'sm' | 'md';

export interface MenuBarBaseProps extends BaseComponent {
  /** Size of the menu bar */
  size?: MenuBarSize;
  /** Vertical gap in pixels between top-level trigger and dropdown */
  menuOffset?: number;
  /** Children (MenuBar.Menu components) */
  children?: ReactNode;
}
export type MenuBarProps = Prettify<MenuBarBaseProps>;

export interface MenuBarMenuBaseProps extends BaseComponent {
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

export interface MenuBarSubBaseProps extends BaseComponent {
  /** Sub-menu trigger label */
  label: string;
  /** Sub-menu items */
  children?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
}
export type MenuBarSubProps = Prettify<MenuBarSubBaseProps>;

export type MenuBarSeparatorProps = Prettify<BaseComponent>;

export interface MenuBarCheckboxItemBaseProps extends Omit<
  BaseComponent<HTMLButtonElement>,
  'onClick'
> {
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. @default false */
  defaultChecked?: boolean;
  /** Called when the checked state toggles. */
  onCheckedChange?: (checked: boolean) => void;
  /** Keyboard shortcut display text (not bound). */
  shortcut?: string;
  /** Indicator shown when checked. @default CheckIcon */
  indicator?: ReactNode;
  /** Whether activating the item closes the menu. @default false */
  closeOnClick?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Item label. */
  children?: ReactNode;
}
export type MenuBarCheckboxItemProps = Prettify<MenuBarCheckboxItemBaseProps>;

export interface MenuBarRadioGroupBaseProps extends Omit<
  BaseComponent,
  'onChange'
> {
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called when the selected value changes. */
  onValueChange?: (value: string) => void;
  /** Radio items. */
  children?: ReactNode;
}
export type MenuBarRadioGroupProps = Prettify<MenuBarRadioGroupBaseProps>;

export interface MenuBarRadioItemBaseProps extends Omit<
  BaseComponent<HTMLButtonElement>,
  'onClick'
> {
  /** Value this item represents within its `MenuBar.RadioGroup`. */
  value: string;
  /** Keyboard shortcut display text (not bound). */
  shortcut?: string;
  /** Indicator shown when selected. @default CircleIcon */
  indicator?: ReactNode;
  /** Whether activating the item closes the menu. @default false */
  closeOnClick?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Item label. */
  children?: ReactNode;
}
export type MenuBarRadioItemProps = Prettify<MenuBarRadioItemBaseProps>;

export interface MenuBarRadioGroupContextValue {
  value: string | undefined;
  setValue: (value: string) => void;
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
