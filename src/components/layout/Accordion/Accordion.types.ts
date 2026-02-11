import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

export type AccordionSize = Size;

/**
 * Visual variants for accordion headers
 * - `default`: Subtle background on header, clean separator lines
 * - `ghost`: No background, minimal separators
 * - `filled`: Darker background on header area
 */
export type AccordionVariant = 'default' | 'ghost' | 'filled';

// --- Accordion (Root) ---

export interface AccordionBaseProps extends Omit<BaseComponent, 'onChange'> {
  /**
   * Expanded item(s) — controlled.
   * Single string for single mode, string[] for multiple mode.
   */
  value?: string | string[];

  /**
   * Default expanded item(s) — uncontrolled
   */
  defaultValue?: string | string[];

  /**
   * Whether multiple items can be expanded at once
   * @default false
   */
  multiple?: boolean;

  /**
   * Whether all items can be collapsed (single mode only).
   * When false, one item must remain open.
   * @default false
   */
  collapsible?: boolean;

  /**
   * Visual variant applied to all items
   * @default "default"
   */
  variant?: AccordionVariant;

  /**
   * Size applied to all items
   * @default "md"
   */
  size?: AccordionSize;

  /**
   * Gap between accordion items in pixels
   * @default 0
   */
  gap?: number;

  /**
   * AccordionItem children
   */
  children: React.ReactNode;

  /**
   * Callback when expanded items change
   */
  onChange?: (value: string | string[]) => void;
}

export type AccordionProps = Prettify<AccordionBaseProps>;

// --- AccordionItem ---

export interface AccordionItemBaseProps extends BaseComponent {
  /**
   * Unique value identifying this item
   */
  value: string;

  /**
   * Whether this item is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * AccordionTrigger + AccordionContent children
   */
  children: React.ReactNode;
}

export type AccordionItemProps = Prettify<AccordionItemBaseProps>;

// --- AccordionTrigger ---

export interface AccordionTriggerBaseProps extends BaseComponent<HTMLButtonElement> {
  /**
   * Header content — typically text label
   */
  children: React.ReactNode;

  /**
   * Icon displayed before the label
   */
  icon?: React.ReactNode;

  /**
   * Additional actions rendered on the right side of the header.
   * Clicking them does NOT toggle the accordion.
   */
  actions?: React.ReactNode;

  /**
   * Custom chevron indicator — pass `null` to hide
   * @default built-in chevron icon
   */
  indicator?: React.ReactNode | null;
}

export type AccordionTriggerProps = Prettify<AccordionTriggerBaseProps>;

// --- AccordionContent ---

export interface AccordionContentBaseProps extends BaseComponent {
  /**
   * Collapsible content
   */
  children: React.ReactNode;

  /**
   * Whether to keep content mounted when collapsed
   * @default false
   */
  keepMounted?: boolean;
}

export type AccordionContentProps = Prettify<AccordionContentBaseProps>;

// --- Context ---

export interface AccordionContextValue {
  expandedItems: string[];
  toggleItem: (value: string) => void;
  variant: AccordionVariant;
  size: AccordionSize;
  accordionId: string;
}

export interface AccordionItemContextValue {
  value: string;
  isExpanded: boolean;
  isDisabled: boolean;
}
