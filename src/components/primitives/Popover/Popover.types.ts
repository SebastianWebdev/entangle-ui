import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

// --- Popover (Root) ---

export interface PopoverBaseProps extends BaseComponent {
  /**
   * Whether the popover is open (controlled)
   */
  open?: boolean;

  /**
   * Default open state (uncontrolled)
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Popover placement relative to the trigger
   * @default "bottom-start"
   */
  placement?: PopoverPlacement;

  /**
   * Distance in pixels from the trigger element
   * @default 8
   */
  offset?: number;

  /**
   * Whether clicking outside closes the popover
   * @default true
   */
  closeOnClickOutside?: boolean;

  /**
   * Whether pressing Escape closes the popover
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Whether to return focus to trigger when popover closes
   * @default true
   */
  returnFocus?: boolean;

  /**
   * Whether to render popover in a Portal
   * @default true
   */
  portal?: boolean;

  /**
   * Whether the popover content width matches the trigger width
   * @default false
   */
  matchTriggerWidth?: boolean;

  /**
   * PopoverTrigger + PopoverContent children
   */
  children: React.ReactNode;

  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
}

export type PopoverProps = Prettify<PopoverBaseProps>;

// --- PopoverTrigger ---

export interface PopoverTriggerBaseProps extends BaseComponent {
  /**
   * The element that triggers the popover.
   */
  children: React.ReactNode;
}

export type PopoverTriggerProps = Prettify<PopoverTriggerBaseProps>;

// --- PopoverContent ---

export interface PopoverContentBaseProps extends BaseComponent {
  /**
   * Popover content — any React elements
   */
  children: React.ReactNode;

  /**
   * Width of the popover content.
   * Number = pixels, string = CSS value.
   */
  width?: number | string;

  /**
   * Maximum height with scroll
   */
  maxHeight?: number | string;

  /**
   * Padding inside the popover.
   * Uses theme spacing token names.
   * @default "md"
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export type PopoverContentProps = Prettify<PopoverContentBaseProps>;

// --- PopoverClose ---

export interface PopoverCloseBaseProps
  extends BaseComponent<HTMLButtonElement> {
  /**
   * Close button content
   * @default built-in x icon
   */
  children?: React.ReactNode;
}

export type PopoverCloseProps = Prettify<PopoverCloseBaseProps>;

// --- Context ---

export interface PopoverContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  placement: PopoverPlacement;
  offset: number;
  portal: boolean;
  matchTriggerWidth: boolean;
  popoverId: string;
}
