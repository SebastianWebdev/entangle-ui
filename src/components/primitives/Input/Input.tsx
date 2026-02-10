// src/primitives/Input/Input.tsx
import type { BaseComponent, Size } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import { StyledInputWrapper } from '@/components/form';
import { processCss } from '@/utils/styledUtils';
import styled from '@emotion/styled';
import React from 'react';

/**
 * Standard input sizes using library sizing.
 */
export type InputSize = Size;

export interface InputBaseProps
  extends Omit<BaseComponent<HTMLInputElement>, 'onChange'> {
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
}

/**
 * Props for the Input component with prettified type for better IntelliSense
 */
export type InputProps = Prettify<InputBaseProps>;

interface StyledInputContainerProps {
  $size: InputSize;
  $error: boolean;
  $disabled: boolean;
  $focused: boolean;
  $css?: InputProps['css'];
}

const StyledInputContainer = styled.div<StyledInputContainerProps>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs}px;

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

const StyledLabel = styled.label<{ $disabled: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.sm}px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props =>
    props.$disabled
      ? props.theme.colors.text.disabled
      : props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

const StyledInput = styled.input<{ $size: InputSize }>`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  color: ${props => props.theme.colors.text.primary};

  ${props => {
    const fontSize = {
      sm: props.theme.typography.fontSize.md,
      md: props.theme.typography.fontSize.md,
      lg: props.theme.typography.fontSize.lg,
    };
    return `font-size: ${fontSize[props.$size]}px;`;
  }}

  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }

  &:disabled {
    cursor: not-allowed;
  }

  /* Remove number input arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

const StyledIcon = styled.div<{ $position: 'start' | 'end' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.muted};

  ${props =>
    props.$position === 'start' ? 'margin-right: 6px;' : 'margin-left: 6px;'}

  & > * {
    width: 14px;
    height: 14px;
  }
`;

const StyledHelperText = styled.div<{ $error: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  line-height: ${props => props.theme.typography.lineHeight.tight};
  color: ${props =>
    props.$error
      ? props.theme.colors.accent.error
      : props.theme.colors.text.muted};
`;

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
  css,
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
    <StyledInputContainer
      className={className}
      style={style}
      $size={size}
      $error={error}
      $disabled={disabled}
      $focused={focused}
      $css={css}
    >
      {label && (
        <StyledLabel htmlFor={inputId} $disabled={disabled}>
          {label}
          {required && <span style={{ color: 'var(--accent-error)' }}> *</span>}
        </StyledLabel>
      )}

      <StyledInputWrapper
        $size={size}
        $error={error}
        $disabled={disabled}
        $focused={focused}
      >
        {startIcon && <StyledIcon $position="start">{startIcon}</StyledIcon>}

        <StyledInput
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          $size={size}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          data-testid={testId}
          {...props}
        />

        {endIcon && <StyledIcon $position="end">{endIcon}</StyledIcon>}
      </StyledInputWrapper>

      {(helperText ?? (error && errorMessage)) && (
        <StyledHelperText $error={error}>
          {error && errorMessage ? errorMessage : helperText}
        </StyledHelperText>
      )}
    </StyledInputContainer>
  );
};

Input.displayName = 'Input';
