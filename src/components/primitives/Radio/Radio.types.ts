import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

/**
 * Radio size using standard library sizing.
 */
export type RadioSize = Size;

/**
 * Position of the label relative to the radio.
 */
export type RadioLabelPosition = 'left' | 'right';

/**
 * Layout direction for radios within a RadioGroup.
 */
export type RadioGroupOrientation = 'horizontal' | 'vertical';

export interface RadioBaseProps extends Omit<
  BaseComponent<HTMLInputElement>,
  'onChange'
> {
  /**
   * Value of this radio option (used for group selection)
   */
  value: string;

  /**
   * Whether this radio is selected (controlled, standalone use).
   * Ignored when rendered inside a RadioGroup — the group drives selection.
   */
  checked?: boolean;

  /**
   * Default checked state (uncontrolled, standalone use).
   * Ignored when rendered inside a RadioGroup.
   */
  defaultChecked?: boolean;

  /**
   * Radio label text displayed next to the control
   */
  label?: string;

  /**
   * Position of the label relative to the radio
   * @default "right"
   */
  labelPosition?: RadioLabelPosition;

  /**
   * Radio size
   * - `sm`: 12px circle
   * - `md`: 14px circle
   * - `lg`: 16px circle
   * @default "md"
   *
   * Inside a RadioGroup, the group's `size` overrides this prop.
   */
  size?: RadioSize;

  /**
   * Whether the radio is disabled.
   * Inside a RadioGroup, the group's `disabled` overrides this prop.
   * @default false
   */
  disabled?: boolean;

  /**
   * Helper text displayed below the radio (standalone use)
   */
  helperText?: string;

  /**
   * Error state (visual only — RadioGroup handles validation).
   * Inside a RadioGroup, the group's `error` overrides this prop.
   * @default false
   */
  error?: boolean;

  /**
   * Error message displayed when error is true (standalone use)
   */
  errorMessage?: string;

  /**
   * Form name attribute.
   * Inside a RadioGroup, the group's `name` overrides this prop.
   */
  name?: string;

  /**
   * Change handler. Standalone Radio fires when toggled on; inside a
   * RadioGroup the group handles selection so this is rarely used directly.
   *
   * @param value - The radio's value
   * @param event - The native change event
   */
  onChange?: (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export type RadioProps = Prettify<RadioBaseProps>;

// --- RadioGroup ---

export interface RadioGroupContextValue {
  value: string | undefined;
  name: string | undefined;
  size: RadioSize;
  disabled: boolean;
  error: boolean;
  onChange: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface RadioGroupBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onChange'
> {
  /**
   * Currently selected value (controlled)
   */
  value?: string;

  /**
   * Default selected value (uncontrolled)
   */
  defaultValue?: string;

  /**
   * Group label rendered above the radios via FormLabel
   */
  label?: string;

  /**
   * Helper text displayed below the group
   */
  helperText?: string;

  /**
   * Whether the entire group is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the group has an error state
   * @default false
   */
  error?: boolean;

  /**
   * Error message displayed when error is true (overrides helperText)
   */
  errorMessage?: string;

  /**
   * Whether selection is required (sets aria-required)
   * @default false
   */
  required?: boolean;

  /**
   * Layout direction for the radios
   * @default "vertical"
   */
  orientation?: RadioGroupOrientation;

  /**
   * Spacing between radios. A number maps onto the theme spacing scale
   * (0 = 0, 1 = xs, 2 = sm, 3 = md, 4 = lg, 5 = xl, 6 = xxl, 7 = xxxl).
   * Fractional values are floored, out-of-range values are clamped.
   * A string passes through unchanged as a raw CSS gap.
   * @default 2
   */
  spacing?: number | string;

  /**
   * Form name attribute applied to all child Radios
   */
  name?: string;

  /**
   * Size applied to all child Radios
   * @default "md"
   */
  size?: RadioSize;

  /**
   * Change handler — fires when any radio in the group is selected
   */
  onChange?: (value: string) => void;

  /**
   * Children — typically Radio components
   */
  children: React.ReactNode;
}

export type RadioGroupProps = Prettify<RadioGroupBaseProps>;
