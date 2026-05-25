import type React from 'react';

import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';

/**
 * Root of a context menu. Owns open/close state for one trigger area.
 *
 * Scope a menu to an area by giving that area its own `ContextMenu` — there is
 * no per-target config resolver. For advanced panels, drop any custom node
 * (tabs, search, etc.) inside `ContextMenu.Content`.
 */
export interface ContextMenuRootBaseProps {
  /** `ContextMenu.Trigger` and `ContextMenu.Content`. */
  children?: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Disables opening the context menu. */
  disabled?: boolean;
}
export type ContextMenuProps = Prettify<ContextMenuRootBaseProps>;

/**
 * Area that opens the menu on right click or long press.
 */
export interface ContextMenuTriggerBaseProps extends BaseComponent<HTMLDivElement> {
  /** The right-click target area. */
  children?: React.ReactNode;
}
export type ContextMenuTriggerProps = Prettify<ContextMenuTriggerBaseProps>;

/**
 * Styled popup surface positioned at the pointer. Place items or any custom
 * node inside.
 */
export interface ContextMenuContentBaseProps extends BaseComponent<HTMLDivElement> {
  /** Items, groups, or custom panel content. */
  children?: React.ReactNode;
}
export type ContextMenuContentProps = Prettify<ContextMenuContentBaseProps>;
