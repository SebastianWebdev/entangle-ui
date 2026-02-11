'use client';

// src/primitives/Input/Input.tsx
import type { Size } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import { inputWrapperRecipe } from '@/components/form/InputWrapper.css';
import { cx } from '@/utils/cx';
import React from 'react';
import {
  inputContainerStyle,
  labelRecipe,
  inputRecipe,
  iconStartStyle,
  iconEndStyle,
  helperTextRecipe,
} from './Input.css';

/**
 * Standard input sizes using library sizing.
 */
export type InputSize = Size;

export interface InputBaseProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'size' | 'css'
> {
  /**
   * Input value (controlled)
   */
  value?: string | undefined;

  /**
   * Default value (uncontrolled)
   */
  defaultValue?: string | undefined;

  /**
   * Placeholder text
   */
  placeholder?: string | undefined;

  /**
   * Input type
   */
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'search'
    | 'url'
    | 'tel'
    | undefined;

  /**
   * Input size using standard library sizing
   * - `sm`: 20px height, compact for toolbars
   * - `md`: 24px height, standard for forms
   * - `lg`: 32px height, prominent inputs
   * @default "md"
   */
  size?: InputSize;

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the input has an error state
   * @default false
   */
  error?: boolean;

  /**
   * Whether the input is required
   * @default false
   */
  required?: boolean;

  /**
   * Whether the input is read-only
   * @default false
   */
  readOnly?: boolean;

  /**
   * Input label
   */
  label?: string | undefined;

  /**
   * Helper text displayed below the input
   */
  helperText?: string | undefined;

  /**
   * Error message displayed when error is true
   */
  errorMessage?: string | undefined;

  /**
   * Icon displayed at the start of the input
   */
  startIcon?: React.ReactNode;

  /**
   * Icon displayed at the end of the input
   */
  endIcon?: React.ReactNode;

  /**
   * Change event handler
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Focus event handler
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Blur event handler
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Key down event handler
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;

  /**
   * Test identifier for automated testing
   */
  testId?: string;

  ref?: React.Ref<HTMLInputElement>;
}

/**
 * Props for the Input component with prettified type for better IntelliSense
 */
export type InputProps = Prettify<InputBaseProps>;

/**
 * A versatile input component for text entry in editor interfaces.
 *
 * Provides a clean, consistent text input with support for labels, helper text,
 * icons, and various states. Optimized for editor UIs with compact sizing.
 *
 * @example
 * ```tsx
 * // Basic text input
 * <Input
 *   placeholder="Enter text..."
 *   value={text}
 *   onChange={(e) => setText(e.target.value)}
 * />
 *
 * // With label and helper text
 * <Input
 *   label="Project Name"
 *   placeholder="My Project"
 *   helperText="Choose a unique name for your project"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 * />
 *
 * // With icons and error state
 * <Input
 *   label="Email"
 *   type="email"
 *   startIcon={<SearchIcon />}
 *   error={!!emailError}
 *   errorMessage={emailError}
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 * ```
 */
export const Input: React.FC<InputProps> = ({
  value,
  defaultValue,
  placeholder,
  type = 'text',
  size = 'md',
  disabled = false,
  error = false,
  required = false,
  readOnly = false,
  label,
  helperText,
  errorMessage,
  startIcon,
  endIcon,
  className,
  style,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  testId,
  ref,
  ...props
}) => {
  const [focused, setFocused] = React.useState(false);
  const inputId = React.useId();

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <div className={cx(inputContainerStyle, className)} style={style}>
      {label && (
        <label
          htmlFor={inputId}
          className={labelRecipe({ disabled: disabled || undefined })}
        >
          {label}
          {required && <span style={{ color: 'var(--accent-error)' }}> *</span>}
        </label>
      )}

      <div
        className={inputWrapperRecipe({
          size,
          error,
          disabled,
          focused,
        })}
      >
        {startIcon && <div className={iconStartStyle}>{startIcon}</div>}

        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          className={inputRecipe({ size })}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          data-testid={testId}
          {...props}
        />

        {endIcon && <div className={iconEndStyle}>{endIcon}</div>}
      </div>

      {(helperText ?? (error && errorMessage)) && (
        <div className={helperTextRecipe({ error: error || undefined })}>
          {error && errorMessage ? errorMessage : helperText}
        </div>
      )}
    </div>
  );
};

Input.displayName = 'Input';
