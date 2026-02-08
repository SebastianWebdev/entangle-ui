import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

export type TabsSize = Size;

/**
 * Visual variants for the tab list
 * - `underline`: Bottom border indicator (default, like VS Code tabs)
 * - `pills`: Filled background on active tab
 * - `enclosed`: Bordered active tab with connected panel
 */
export type TabsVariant = 'underline' | 'pills' | 'enclosed';

// --- Tabs (Root) ---

export interface TabsBaseProps extends Omit<BaseComponent, 'onChange'> {
  /**
   * Currently active tab value (controlled)
   */
  value?: string;

  /**
   * Default active tab (uncontrolled)
   */
  defaultValue?: string;

  /**
   * Tab list variant
   * @default "underline"
   */
  variant?: TabsVariant;

  /**
   * Tab size
   * - `sm`: 28px tab height, compact toolbars
   * - `md`: 32px tab height, standard panels
   * - `lg`: 38px tab height, prominent navigation
   * @default "md"
   */
  size?: TabsSize;

  /**
   * Orientation of the tab list
   * @default "horizontal"
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Whether tabs fill the available width equally
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Children: TabList + TabPanel components
   */
  children: React.ReactNode;

  /**
   * Callback when active tab changes
   */
  onChange?: (value: string) => void;
}

export type TabsProps = Prettify<TabsBaseProps>;

// --- TabList ---

export interface TabListBaseProps extends BaseComponent {
  /**
   * Tab elements
   */
  children: React.ReactNode;
}

export type TabListProps = Prettify<TabListBaseProps>;

// --- Tab ---

export interface TabBaseProps extends BaseComponent<HTMLButtonElement> {
  /**
   * Unique value identifying this tab.
   * Must match a TabPanel's value.
   */
  value: string;

  /**
   * Tab label content
   */
  children: React.ReactNode;

  /**
   * Icon displayed before the label
   */
  icon?: React.ReactNode;

  /**
   * Whether this tab is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether this tab can be closed
   * @default false
   */
  closable?: boolean;

  /**
   * Callback when close button is clicked.
   * Only relevant when closable is true.
   */
  onClose?: (value: string) => void;
}

export type TabProps = Prettify<TabBaseProps>;

// --- TabPanel ---

export interface TabPanelBaseProps extends BaseComponent {
  /**
   * Value matching a Tab's value
   */
  value: string;

  /**
   * Panel content — only rendered when this tab is active
   */
  children: React.ReactNode;

  /**
   * Whether to keep panel mounted when inactive (preserves state).
   * When false, panel is unmounted when not active.
   * @default false
   */
  keepMounted?: boolean;
}

export type TabPanelProps = Prettify<TabPanelBaseProps>;

// --- Context ---

export interface TabsContextValue {
  activeValue: string;
  setActiveValue: (value: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  orientation: 'horizontal' | 'vertical';
  fullWidth: boolean;
  tabsId: string;
}
