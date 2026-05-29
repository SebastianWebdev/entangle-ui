import type { BaseComponent, Size } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import type React from 'react';

export type ComboboxSize = Size;
export type ComboboxVariant = 'default' | 'ghost' | 'filled';

export interface ComboboxOption<T extends string = string> {
  /** Unique value used for selection */
  value: T;
  /** Display label (falls back to value when omitted) */
  label?: string;
  /** Optional description rendered next to the label */
  description?: string;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface ComboboxBaseProps<T extends string = string> extends Omit<
  BaseComponent<HTMLInputElement>,
  'onChange' | 'value' | 'defaultValue' | 'children'
> {
  /** Controlled selected value */
  value?: T | null;

  /** Default selected value (uncontrolled) */
  defaultValue?: T;

  /** Available options */
  options: ComboboxOption<T>[];

  /** Placeholder rendered when the input is empty */
  placeholder?: string;

  /**
   * Custom filter function. Receives the raw query and the option, returns
   * either a boolean (`true` to keep) or a numeric score (higher = better).
   * When omitted, options are filtered by the built-in fuzzy matcher
   * (`fuzzyScore`).
   */
  filterFn?: (option: ComboboxOption<T>, query: string) => boolean | number;

  /** Message shown when filtering yields no results */
  emptyMessage?: string;

  /** Loading indicator state — replaces options with a spinner row */
  loading?: boolean;

  /** Message shown while loading */
  loadingMessage?: string;

  /**
   * Allow values not present in `options`. The `onChange` handler still fires
   * with the user-typed string when the input is blurred or `Enter` is pressed
   * with no active suggestion.
   * @default false
   */
  freeSolo?: boolean;

  /**
   * When true the user can create a brand new option by pressing Enter on a
   * value that doesn't match any existing option. The `onCreate` callback (or
   * `onChange` when omitted) is invoked. Implies `freeSolo`.
   * @default false
   */
  creatable?: boolean;

  /**
   * Render the "create" row when `creatable` is true and the query has no
   * exact match. Defaults to `'Create "<query>"'`.
   */
  createLabel?: (query: string) => React.ReactNode;

  /**
   * Open the dropdown automatically when the input gains focus, even when no
   * query is typed yet.
   * @default false
   */
  openOnFocus?: boolean;

  /** Component size */
  size?: ComboboxSize;

  /** Visual variant */
  variant?: ComboboxVariant;

  /** Label rendered above the input */
  label?: string;

  /** Helper text rendered below */
  helperText?: string;

  /** Error state */
  error?: boolean;

  /** Error message — overrides `helperText` when `error` is true */
  errorMessage?: string;

  /** Disable the input */
  disabled?: boolean;

  /** Mark the field as required */
  required?: boolean;

  /** Read-only — input value is fixed */
  readOnly?: boolean;

  /** Show a clear button when a value is selected */
  clearable?: boolean;

  /** Maximum dropdown height in pixels */
  maxDropdownHeight?: number;

  /** Minimum dropdown width in pixels */
  minDropdownWidth?: number;

  /** Hidden form-input name */
  name?: string;

  /** Selection change handler. `null` is passed when the value is cleared. */
  onChange?: (value: T | null) => void;

  /**
   * Free-text change handler. Fires every keystroke regardless of selection
   * status. Useful for async option loading.
   */
  onInputChange?: (input: string) => void;

  /**
   * Called when the user creates a new option (only when `creatable` is set).
   * Falls back to `onChange` with the typed string cast as `T` when omitted.
   */
  onCreate?: (input: string) => void;

  /** Open state change handler */
  onOpenChange?: (open: boolean) => void;
}

export type ComboboxProps<T extends string = string> = Prettify<
  ComboboxBaseProps<T>
>;
