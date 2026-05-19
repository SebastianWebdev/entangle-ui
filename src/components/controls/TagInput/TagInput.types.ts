import type React from 'react';
import type { BaseComponent, Size } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type TagInputSize = Size;
export type TagInputVariant = 'default' | 'ghost' | 'filled';

/** Keys (or characters) that commit the current draft as a tag. */
export type TagInputSeparator = 'Enter' | 'Comma' | 'Space' | 'Tab';

export interface TagInputRenderTagState {
  /** Tag value */
  tag: string;
  /** Position in the array */
  index: number;
  /** Whether the parent component is disabled */
  disabled: boolean;
  /** Remove this tag */
  remove: () => void;
}

export interface TagInputBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'children'
> {
  /** Controlled list of tags */
  value?: string[];

  /** Default tags (uncontrolled) */
  defaultValue?: string[];

  /** Called whenever the tag list changes */
  onChange?: (tags: string[]) => void;

  /** Placeholder shown in the inner input when empty */
  placeholder?: string;

  /**
   * Keys / characters that commit the current draft to a tag.
   * @default ['Enter', 'Comma']
   */
  separators?: TagInputSeparator[];

  /**
   * Add the current draft as a tag when the input loses focus.
   * @default false
   */
  addOnBlur?: boolean;

  /**
   * Allow duplicate tags. When `false`, attempts to add an existing tag
   * are ignored (and `onValidate` receives `'duplicate'`).
   * @default false
   */
  allowDuplicates?: boolean;

  /**
   * Maximum number of tags. When reached, the input is disabled.
   */
  max?: number;

  /**
   * Synchronous validator. Return `false` (or a string with an error message)
   * to reject the candidate value. Return `true` to accept.
   */
  validate?: (value: string, current: string[]) => boolean | string;

  /**
   * Transform the candidate before validation. Defaults to trimming.
   */
  normalize?: (value: string) => string;

  /**
   * Called when a candidate fails validation. Receives the raw value, the
   * normalized value, and the reason (`'duplicate'`, `'max'`, `'empty'`,
   * `'invalid'`, or the validator's string).
   */
  onValidate?: (
    rawValue: string,
    reason:
      | 'duplicate'
      | 'max'
      | 'empty'
      | 'invalid'
      // Custom reason returned from the `validate` callback (string).
      | (string & {})
  ) => void;

  /**
   * Render a single chip. When omitted the built-in chip is used.
   */
  renderTag?: (state: TagInputRenderTagState) => React.ReactNode;

  /**
   * Component size.
   * @default 'md'
   */
  size?: TagInputSize;

  /**
   * Visual variant for the wrapper.
   * @default 'default'
   */
  variant?: TagInputVariant;

  /** Label rendered above the input */
  label?: string;

  /** Helper text rendered below the input */
  helperText?: string;

  /** Error state */
  error?: boolean;

  /** Error message — shown in place of `helperText` when `error` is true */
  errorMessage?: string;

  /** Disable the entire control */
  disabled?: boolean;

  /** Mark the field as required */
  required?: boolean;

  /** Read-only — chips are visible but not removable, input is hidden */
  readOnly?: boolean;

  /** Name attribute used for form submission (joined by `,`) */
  name?: string;

  /** ARIA label for the inner text input */
  inputAriaLabel?: string;

  /** Ref forwarded to the inner `<input>` */
  inputRef?: React.Ref<HTMLInputElement>;
}

export type TagInputProps = Prettify<TagInputBaseProps>;
