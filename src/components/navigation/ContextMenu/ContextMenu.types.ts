import type React from 'react';

import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import type { MenuHandle } from '../Menu/Menu.types';

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
  /**
   * Gap in px between submenu popups and their anchor. Inherited by any
   * `Menu.SubContent` rendered inside the content.
   * @default 8
   */
  gap?: number;
  /** Imperative handle for closing the menu from app code. */
  ref?: React.Ref<MenuHandle>;
}
export type ContextMenuProps = Prettify<ContextMenuRootBaseProps>;

/**
 * Area that opens the menu on right click or long press.
 *
 * By default the children are wrapped in a `display: contents` element so the
 * trigger is transparent to layout. Pass `render` to make the trigger render
 * *as* your own element instead — no wrapper, and the element stays fully
 * stylable (positioning, margins, etc.).
 */
export interface ContextMenuTriggerBaseProps extends BaseComponent<HTMLDivElement> {
  /** The right-click target area. */
  children?: React.ReactNode;
  /**
   * Render the trigger as this element instead of wrapping the children in a
   * `display: contents` element. The element carries its own children.
   */
  render?: React.ReactElement;
}
export type ContextMenuTriggerProps = Prettify<ContextMenuTriggerBaseProps>;

/**
 * Styled popup surface positioned at the pointer. Place items or any custom
 * node inside.
 *
 * Unlike `Menu.Content`, this exposes no `side` / `align` / `sideOffset`: a
 * context menu opens *at the pointer* (the cursor is the anchor), so there is
 * no trigger edge to align against. Submenus still honour the root `gap`.
 */
export interface ContextMenuContentBaseProps extends BaseComponent<HTMLDivElement> {
  /** Items, groups, or custom panel content. */
  children?: React.ReactNode;
}
export type ContextMenuContentProps = Prettify<ContextMenuContentBaseProps>;
