import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

/**
 * Checkbox size using standard library sizing.
 */
export type CheckboxSize = Size;

/**
 * Checkbox visual variant.
 */
export type CheckboxVariant = 'default' | 'filled';

export interface CheckboxBaseProps extends Omit<
  BaseComponent<HTMLButtonElement>,
  'onChange'
> {
  /**
   * Whether the checkbox is checked (controlled)
   */
  checked?: boolean;

  /**
   * Default checked state (uncontrolled)
   * @default false
   */
  defaultChecked?: boolean;

  /**
   * Whether the checkbox is in an indeterminate state.
   * Used for "select all" patterns when some items are checked.
   * Takes visual precedence over checked state.
   * @default false
   */
  indeterminate?: boolean;

  /**
   * Checkbox label text displayed next to the control
   */
  label?: string;

  /**
   * Position of the label relative to the checkbox
   * @default "right"
   */
  labelPosition?: 'left' | 'right';

  /**
   * Checkbox size
   * - `sm`: 14px box, compact for dense UIs
   * - `md`: 16px box, standard for forms
   * - `lg`: 20px box, prominent settings
   * @default "md"
   */
  size?: CheckboxSize;

  /**
   * Visual variant
   * - `default`: Border-only when unchecked, filled when checked
   * - `filled`: Subtle background when unchecked, accent when checked
   * @default "default"
   */
  variant?: CheckboxVariant;

  /**
   * Whether the checkbox is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the checkbox is required
   * @default false
   */
  required?: boolean;

  /**
   * Whether the checkbox has an error state
   * @default false
   */
  error?: boolean;

  /**
   * Helper text displayed below the checkbox
   */
  helperText?: string;

  /**
   * Error message displayed when error is true
   */
  errorMessage?: string;

  /**
   * Value attribute for use in CheckboxGroup
   */
  value?: string;

  /**
   * Name attribute for form submission
   */
  name?: string;

  /**
   * Change event handler
   * @param checked - The new checked state
   */
  onChange?: (checked: boolean) => void;
}

export type CheckboxProps = Prettify<CheckboxBaseProps>;

// --- CheckboxGroup ---

export interface CheckboxGroupContextValue {
  groupValue: string[];
  toggleValue: (value: string) => void;
  disabled: boolean;
  size: CheckboxSize;
}

export interface CheckboxGroupBaseProps extends Omit<
  BaseComponent,
  'onChange'
> {
  /**
   * Currently selected values (controlled)
   */
  value?: string[];

  /**
   * Default selected values (uncontrolled)
   */
  defaultValue?: string[];

  /**
   * Group label
   */
  label?: string;

  /**
   * Layout direction
   * @default "column"
   */
  direction?: 'row' | 'column';

  /**
   * Gap between checkboxes using theme spacing multiplier
   * @default 2
   */
  gap?: number;

  /**
   * Whether all checkboxes in the group are disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Size applied to all checkboxes in the group.
   * Individual checkbox size overrides this.
   * @default "md"
   */
  size?: CheckboxSize;

  /**
   * Helper text for the group
   */
  helperText?: string;

  /**
   * Error state for the group
   * @default false
   */
  error?: boolean;

  /**
   * Error message for the group
   */
  errorMessage?: string;

  /**
   * Whether the group is required
   * @default false
   */
  required?: boolean;

  /**
   * Checkbox elements to render
   */
  children: React.ReactNode;

  /**
   * Change event handler
   * @param value - Array of selected checkbox values
   */
  onChange?: (value: string[]) => void;
}

export type CheckboxGroupProps = Prettify<CheckboxGroupBaseProps>;
