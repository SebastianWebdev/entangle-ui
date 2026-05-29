import type { BaseComponent, Size } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import type React from 'react';

export type MultiSelectSize = Size;
export type MultiSelectVariant = 'default' | 'ghost' | 'filled';

export interface MultiSelectOption<T extends string = string> {
  /** Unique value used for selection */
  value: T;
  /** Display label (falls back to value when omitted) */
  label?: string;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface MultiSelectOptionGroup<T extends string = string> {
  /** Group header label */
  label: string;
  /** Options inside this group */
  options: MultiSelectOption<T>[];
}

export interface MultiSelectBaseProps<T extends string = string> extends Omit<
  BaseComponent<HTMLButtonElement>,
  'onChange' | 'value' | 'defaultValue' | 'children'
> {
  /** Controlled list of selected values */
  value?: T[];

  /** Default selection (uncontrolled) */
  defaultValue?: T[];

  /** Options — flat list or grouped */
  options: Array<MultiSelectOption<T> | MultiSelectOptionGroup<T>>;

  /** Placeholder shown when nothing is selected */
  placeholder?: string;

  /** Whether to render a search input inside the dropdown */
  searchable?: boolean;

  /** Placeholder for the search input */
  searchPlaceholder?: string;

  /** Custom filter for searchable mode */
  filterFn?: (option: MultiSelectOption<T>, query: string) => boolean;

  /** Message shown when search yields no results */
  emptyMessage?: string;

  /** Maximum number of selected items */
  max?: number;

  /**
   * Cap of inline chips rendered in the trigger before falling back to a
   * "+N more" badge. `Infinity` to render every chip. Set to `0` to never
   * render chips and only show the count.
   * @default 3
   */
  maxInlineChips?: number;

  /** Component size */
  size?: MultiSelectSize;

  /** Visual variant */
  variant?: MultiSelectVariant;

  /** Label rendered above the trigger */
  label?: string;

  /** Helper text rendered below */
  helperText?: string;

  /** Error state */
  error?: boolean;

  /** Error message — overrides `helperText` when `error` is true */
  errorMessage?: string;

  /** Disable the entire control */
  disabled?: boolean;

  /** Mark the field as required */
  required?: boolean;

  /** Show a clear-all button when at least one value is selected */
  clearable?: boolean;

  /** Maximum dropdown height in pixels */
  maxDropdownHeight?: number;

  /** Minimum dropdown width in pixels */
  minDropdownWidth?: number;

  /**
   * Close the dropdown after each selection.
   * @default false
   */
  closeOnSelect?: boolean;

  /** Hidden form-input name. Selected values are joined by `,`. */
  name?: string;

  /** Selection change handler */
  onChange?: (values: T[]) => void;

  /** Open state change handler */
  onOpenChange?: (open: boolean) => void;
}

export type MultiSelectProps<T extends string = string> = Prettify<
  MultiSelectBaseProps<T>
>;
