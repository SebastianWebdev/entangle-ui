import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import type { MenuConfig, MenuSelection } from '../Menu';

export interface ContextMenuTargetDetails<TPayload = unknown> {
  /**
   * Native browser contextmenu event from the latest trigger interaction.
   * Null until the first right click.
   */
  event: MouseEvent | null;

  /**
   * Element that initiated the context menu interaction.
   */
  target: HTMLElement | null;

  /**
   * Optional payload associated with the trigger area.
   */
  payload?: TPayload;
}

export type ContextMenuConfig<TPayload = unknown> =
  | MenuConfig
  | ((context: ContextMenuTargetDetails<TPayload>) => MenuConfig);

export interface ContextMenuBaseProps<TPayload = unknown>
  extends Omit<BaseComponent<HTMLDivElement>, 'children' | 'onChange'> {
  /**
   * Static menu config or resolver function called with trigger context.
   */
  config: ContextMenuConfig<TPayload>;

  /**
   * Currently selected items grouped by id.
   */
  selectedItems?: MenuSelection;

  /**
   * Called when selection state changes.
   */
  onChange?: (selection: MenuSelection) => void;

  /**
   * Content that acts as the right-click trigger area.
   */
  children?: React.ReactNode;

  /**
   * Optional data attached to this trigger area and passed to config resolver.
   */
  payload?: TPayload;

  /**
   * Custom icon for checkbox selected state.
   */
  checkboxIcon?: React.ReactNode;

  /**
   * Custom icon for radio selected state.
   */
  radioIcon?: React.ReactNode;

  /**
   * Disables opening the context menu.
   * @default false
   */
  disabled?: boolean;
}

export type ContextMenuProps<TPayload = unknown> = Prettify<
  ContextMenuBaseProps<TPayload>
>;

export interface UseContextMenuTargetResult<TPayload = unknown> {
  /**
   * Latest target context captured from right click interaction.
   */
  context: ContextMenuTargetDetails<TPayload>;

  /**
   * Attach this to an element if you want to capture context manually.
   */
  onContextMenuCapture: (
    event: React.MouseEvent<HTMLElement>
  ) => void;

  /**
   * Callback ref that captures native right-click interactions on a node.
   * Useful when you want ref-based wiring.
   */
  targetRef: (node: HTMLElement | null) => void;
}

