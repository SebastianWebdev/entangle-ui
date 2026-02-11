import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

export type SelectSize = Size;
export type SelectVariant = 'default' | 'ghost' | 'filled';

export interface SelectOptionItem<T extends string = string> {
  /** Unique value used for selection */
  value: T;
  /** Display label (falls back to value if not provided) */
  label?: string;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface SelectOptionGroup<T extends string = string> {
  /** Group label displayed as a non-selectable header */
  label: string;
  /** Options within this group */
  options: SelectOptionItem<T>[];
}

export interface SelectBaseProps<T extends string = string> extends Omit<
  BaseComponent<HTMLButtonElement>,
  'onChange' | 'value' | 'defaultValue'
> {
  /**
   * Selected value (controlled)
   */
  value?: T | null;

  /**
   * Default selected value (uncontrolled)
   */
  defaultValue?: T;

  /**
   * Options to display — flat list or grouped
   */
  options: Array<SelectOptionItem<T> | SelectOptionGroup<T>>;

  /**
   * Placeholder text when no value is selected
   * @default "Select..."
   */
  placeholder?: string;

  /**
   * Whether to show a search/filter input inside the dropdown
   * @default false
   */
  searchable?: boolean;

  /**
   * Placeholder for the search input
   * @default "Search..."
   */
  searchPlaceholder?: string;

  /**
   * Custom filter function for searchable mode
   */
  filterFn?: (option: SelectOptionItem<T>, query: string) => boolean;

  /**
   * Message shown when search yields no results
   * @default "No results found"
   */
  emptyMessage?: string;

  /**
   * Size using standard library sizing
   * - `sm`: 20px trigger height
   * - `md`: 24px trigger height
   * - `lg`: 32px trigger height
   * @default "md"
   */
  size?: SelectSize;

  /**
   * Visual variant for the trigger button
   * @default "default"
   */
  variant?: SelectVariant;

  /**
   * Label displayed above the select
   */
  label?: string;

  /**
   * Helper text displayed below the select
   */
  helperText?: string;

  /**
   * Error state
   * @default false
   */
  error?: boolean;

  /**
   * Error message
   */
  errorMessage?: string;

  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the select is required
   * @default false
   */
  required?: boolean;

  /**
   * Whether a clear button appears when value is selected
   * @default false
   */
  clearable?: boolean;

  /**
   * Maximum height of the dropdown in pixels
   * @default 240
   */
  maxDropdownHeight?: number;

  /**
   * Minimum width of the dropdown in pixels.
   * When set, the dropdown will be at least this wide,
   * even if the trigger is narrower.
   */
  minDropdownWidth?: number;

  /**
   * Name attribute for form submission
   */
  name?: string;

  /**
   * Change event handler
   */
  onChange?: (value: T | null) => void;

  /**
   * Open state change handler
   */
  onOpenChange?: (open: boolean) => void;
}

export type SelectProps<T extends string = string> = Prettify<
  SelectBaseProps<T>
>;
