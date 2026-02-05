import type React from 'react';

import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';

/**
 * How submenus should be triggered.
 * - `hover`: Submenu opens on hover
 * - `click`: Submenu opens on click only
 */
export type SubmenuTrigger = 'hover' | 'click';

/**
 * Configuration for a single menu item.
 */
export type MenuItem = {
  /** Unique identifier for the menu item */
  id: string;
  /** Display text for the menu item */
  label: string;
  /** Click handler called with item id and event */
  onClick: (id: string, event: MouseEvent) => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Nested submenu configuration */
  subMenu?: MenuConfig;
  /** How submenu should be triggered when subMenu is present */
  submenuTrigger?: SubmenuTrigger;
};

/**
 * Type of item selection behavior within a group.
 * - `radio`: Single selection within group
 * - `checkbox`: Multiple selection within group
 * - `none`: No selection state, just click handlers
 */
export type ItemSelectionType = 'radio' | 'checkbox' | 'none';

/**
 * Configuration for a group of menu items.
 * Groups are visually separated and can have different selection behaviors.
 */
export type MenuGroup = {
  /** Unique identifier for the group */
  id: string;
  /** Optional label displayed above the group */
  label?: string;
  /** Array of menu items in this group */
  items: MenuItem[];
  /** Selection behavior for items in this group */
  itemSelectionType: ItemSelectionType;
  /** Whether to close menu when any item in group is clicked */
  closeOnItemClick?: boolean;
};

/**
 * Configuration for a menu component.
 * Defines structure, behavior, and selection state.
 */
export type MenuConfig = {
  /** Whether to open menu on hover instead of click */
  openOnHover?: boolean;
  /** Array of menu groups */
  groups: MenuGroup[];
};

/**
 * Selected items state organized by group.
 * Maps group ID to array of selected item IDs.
 */
export type MenuSelection = Record<string, string[]>;

/**
 * Base props for the Menu component.
 */
export interface MenuBaseProps
  extends Omit<BaseComponent<HTMLElement>, 'onChange'> {
  /** Menu configuration object */
  config: MenuConfig;
  /** Currently selected items organized by group */
  selectedItems?: MenuSelection;
  /** Callback when selection changes */
  onChange?: (selection: MenuSelection) => void;
  /** Menu trigger element */
  children?: React.ReactNode;
  /** Custom icon for checkbox selected state */
  checkboxIcon?: React.ReactNode;
  /** Custom icon for radio selected state */
  radioIcon?: React.ReactNode;
  /** Whether the menu is disabled */
  disabled?: boolean;
  /** Whether this menu is a submenu */
  isSubmenu?: boolean;
}

/**
 * Props for the Menu component using Prettify utility type.
 */
export type MenuProps = Prettify<MenuBaseProps>;
