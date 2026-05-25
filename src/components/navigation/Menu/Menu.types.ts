import type React from 'react';

import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';

/** Side of the trigger the popup is placed against. */
export type MenuSide = 'top' | 'right' | 'bottom' | 'left';

/** Alignment of the popup relative to the trigger. */
export type MenuAlign = 'start' | 'center' | 'end';

/**
 * Root of the menu. Groups the trigger and content, owns open/close state.
 */
export interface MenuRootBaseProps {
  /** Trigger and content of the menu. */
  children?: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the menu traps interaction while open.
   * @default true
   */
  modal?: boolean;
  /** Disables opening the menu. */
  disabled?: boolean;
  /**
   * Gap in px between every popup (the menu and its submenus) and its anchor.
   * Set once here for the whole menu; overridable per popup via
   * `Menu.Content`'s `sideOffset`.
   * @default 8
   */
  gap?: number;
}
export type MenuRootProps = Prettify<MenuRootBaseProps>;

/**
 * Button that opens the menu. Defaults to the library `Button`; pass `render`
 * to compose with another element (e.g. `IconButton`).
 */
export interface MenuTriggerBaseProps extends BaseComponent<HTMLButtonElement> {
  /** Trigger content. */
  children?: React.ReactNode;
  /** Disables the trigger. */
  disabled?: boolean;
  /** Also open the menu when the trigger is hovered. */
  openOnHover?: boolean;
  /** Replace the default Button with a custom element. */
  render?: React.ReactElement;
}
export type MenuTriggerProps = Prettify<MenuTriggerBaseProps>;

/**
 * Styled popup surface. Place items or any custom node inside.
 */
export interface MenuContentBaseProps extends BaseComponent<HTMLDivElement> {
  /** Items, groups, or custom panel content. */
  children?: React.ReactNode;
  /** Preferred side relative to the trigger. */
  side?: MenuSide;
  /** Alignment along the chosen side. */
  align?: MenuAlign;
  /** Gap in px between trigger and popup. @default 4 */
  sideOffset?: number;
  /** Offset in px along the alignment axis. */
  alignOffset?: number;
}
export type MenuContentProps = Prettify<MenuContentBaseProps>;

/**
 * Single actionable row. Icon on the left, label in the center, shortcut and
 * action on the right.
 */
export interface MenuItemBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onClick'
> {
  /** Label content. */
  children?: React.ReactNode;
  /** Icon rendered in the left slot. */
  icon?: React.ReactNode;
  /** Keyboard shortcut hint rendered on the right. */
  shortcut?: React.ReactNode;
  /** Arbitrary node rendered on the right (badge, switch, etc.). */
  endContent?: React.ReactNode;
  /** Disables the item. */
  disabled?: boolean;
  /** Whether clicking the item closes the menu. @default true */
  closeOnClick?: boolean;
  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLElement>;
}
export type MenuItemProps = Prettify<MenuItemBaseProps>;

/**
 * Wraps a set of radio items, owns the selected value.
 */
export interface MenuRadioGroupBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onChange'
> {
  /** Radio items. */
  children?: React.ReactNode;
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called when the selected value changes. */
  onValueChange?: (value: string) => void;
}
export type MenuRadioGroupProps = Prettify<MenuRadioGroupBaseProps>;

/**
 * Radio row. Shows a selection indicator in the left slot when active.
 */
export interface MenuRadioItemBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onClick'
> {
  /** Value this item represents within its `RadioGroup`. */
  value: string;
  /** Label content. */
  children?: React.ReactNode;
  /** Indicator shown when selected. @default CircleIcon */
  indicator?: React.ReactNode;
  /** Keyboard shortcut hint rendered on the right. */
  shortcut?: React.ReactNode;
  /** Arbitrary node rendered on the right. */
  endContent?: React.ReactNode;
  /** Disables the item. */
  disabled?: boolean;
  /** Whether clicking the item closes the menu. @default false */
  closeOnClick?: boolean;
  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLElement>;
}
export type MenuRadioItemProps = Prettify<MenuRadioItemBaseProps>;

/**
 * Checkbox row. Shows a selection indicator in the left slot when ticked.
 */
export interface MenuCheckboxItemBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onClick'
> {
  /** Label content. */
  children?: React.ReactNode;
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  /** Called when toggled. */
  onCheckedChange?: (checked: boolean) => void;
  /** Indicator shown when ticked. @default CheckIcon */
  indicator?: React.ReactNode;
  /** Keyboard shortcut hint rendered on the right. */
  shortcut?: React.ReactNode;
  /** Arbitrary node rendered on the right. */
  endContent?: React.ReactNode;
  /** Disables the item. */
  disabled?: boolean;
  /** Whether clicking the item closes the menu. @default false */
  closeOnClick?: boolean;
  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLElement>;
}
export type MenuCheckboxItemProps = Prettify<MenuCheckboxItemBaseProps>;

/**
 * Visually separated group of items with an optional label.
 */
export interface MenuGroupBaseProps extends BaseComponent<HTMLDivElement> {
  /** Group items. */
  children?: React.ReactNode;
  /** Label rendered above the group. */
  label?: React.ReactNode;
}
export type MenuGroupProps = Prettify<MenuGroupBaseProps>;

export type MenuSeparatorProps = Prettify<BaseComponent<HTMLDivElement>>;

/**
 * Groups a submenu trigger with its content.
 */
export interface MenuSubBaseProps {
  /** `SubTrigger` and `SubContent`. */
  children?: React.ReactNode;
  /** Uncontrolled initial open state of the submenu. */
  defaultOpen?: boolean;
}
export type MenuSubProps = Prettify<MenuSubBaseProps>;

/**
 * Row that opens a submenu. Renders a chevron in the right slot.
 */
export interface MenuSubTriggerBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onClick'
> {
  /** Label content. */
  children?: React.ReactNode;
  /** Icon rendered in the left slot. */
  icon?: React.ReactNode;
  /** Disables the submenu trigger. */
  disabled?: boolean;
  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLElement>;
}
export type MenuSubTriggerProps = Prettify<MenuSubTriggerBaseProps>;
