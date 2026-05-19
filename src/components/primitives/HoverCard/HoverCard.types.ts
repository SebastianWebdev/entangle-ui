import type React from 'react';
import type { FloatingContext, UseFloatingReturn } from '@floating-ui/react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import type { PopoverPlacement } from '@/components/primitives/Popover';

export interface HoverCardBaseProps {
  /** Open state (controlled). */
  open?: boolean;
  /** Default open state (uncontrolled). @default false */
  defaultOpen?: boolean;
  /** Side relative to the trigger. @default "bottom-start" */
  placement?: PopoverPlacement;
  /** Distance in pixels from the trigger. @default 8 */
  offset?: number;
  /** Delay before opening on hover, in ms. @default 400 */
  openDelay?: number;
  /** Delay before closing once cursor leaves, in ms. @default 150 */
  closeDelay?: number;
  /** Render the content in a portal. @default true */
  portal?: boolean;
  /**
   * Disable the safe polygon that lets the cursor move from the trigger
   * onto the content without closing. @default false
   */
  disableSafePolygon?: boolean;
  /** Disable the entire HoverCard (never opens). @default false */
  disabled?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** `HoverCard.Trigger` + `HoverCard.Content` children. */
  children: React.ReactNode;
}

export type HoverCardProps = Prettify<HoverCardBaseProps>;

export interface HoverCardTriggerBaseProps {
  /** Trigger element — must be a single React element. */
  children: React.ReactElement;
}

export type HoverCardTriggerProps = Prettify<HoverCardTriggerBaseProps>;

export interface HoverCardContentBaseProps extends BaseComponent<HTMLDivElement> {
  /** Content rendered inside the floating panel. */
  children: React.ReactNode;
  /** Width of the content. */
  width?: number | string;
  /** Maximum height with scroll. */
  maxHeight?: number | string;
  /** Padding inside the content. @default "md" */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export type HoverCardContentProps = Prettify<HoverCardContentBaseProps>;

export interface HoverCardContextValue {
  isOpen: boolean;
  hoverCardId: string;
  portal: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  floatingRefs: UseFloatingReturn['refs'];
  floatingStyles: React.CSSProperties;
  floatingContext: FloatingContext;
  getReferenceProps: (
    props?: React.HTMLProps<HTMLElement>
  ) => Record<string, unknown>;
  getFloatingProps: (
    props?: React.HTMLProps<HTMLElement>
  ) => Record<string, unknown>;
}
