import type React from 'react';
import type { BaseComponent, Size } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type TextAreaSize = Size;
export type TextAreaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextAreaBaseProps extends Omit<
  BaseComponent<HTMLTextAreaElement>,
  'onChange' | 'size' | 'css' | 'defaultValue'
> {
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Placeholder text. */
  placeholder?: string;

  /**
   * Size scale (matches Input).
   * @default "md"
   */
  size?: TextAreaSize;

  /** @default false */
  disabled?: boolean;
  /** @default false */
  error?: boolean;
  /** @default false */
  required?: boolean;
  /** @default false */
  readOnly?: boolean;

  /** Label rendered above the textarea (uses FormLabel). */
  label?: string;
  /** Helper text below the textarea. */
  helperText?: string;
  /** Error message shown when `error` is true; overrides `helperText`. */
  errorMessage?: string;

  /**
   * User resize direction. Auto-resize (via `minRows`/`maxRows`) forces
   * this to `'none'`.
   * @default "vertical"
   */
  resize?: TextAreaResize;

  /**
   * Initial number of rows (used when not auto-sizing).
   * @default 3
   */
  rows?: number;
  /**
   * Minimum rows when auto-sizing. Setting this (or `maxRows`) enables
   * auto-resize.
   */
  minRows?: number;
  /** Maximum rows when auto-sizing. Overflow scrolls above this. */
  maxRows?: number;

  /**
   * Render in monospace font.
   * @default false
   */
  monospace?: boolean;

  /** Maximum allowed character count (HTML attribute). */
  maxLength?: number;
  /**
   * Show character count below the textarea. Pair with `maxLength`
   * to show `123/500`.
   * @default false
   */
  showCount?: boolean;

  /** Change handler returning the string value directly. */
  onChange?: (value: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;

  /** @internal passed through to the underlying <textarea>. */
  name?: string;
  /** @internal passed through to the underlying <textarea>. */
  id?: string;
}

export type TextAreaProps = Prettify<TextAreaBaseProps>;
