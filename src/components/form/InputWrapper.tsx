import React from 'react';
import styled from '@emotion/styled';
import type { Size } from '@/types/common';

export interface InputWrapperProps {
  /**
   * Ref to the input wrapper element
   */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Input wrapper content
   */
  children: React.ReactNode;
  
  /**
   * Input size using standard library sizing
   * - `sm`: 20px height, compact for toolbars
   * - `md`: 24px height, standard for forms
   * - `lg`: 32px height, prominent inputs
   * @default "md"
   */
  size?: Size;
  
  /**
   * Whether the input has an error state
   * @default false
   */
  error?: boolean;
  
  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the input is focused
   * @default false
   */
  focused?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Mouse down event handler
   */
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  
  /**
   * Click event handler
   */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

interface StyledInputWrapperProps {
  $size: Size;
  $error: boolean;
  $disabled: boolean;
  $focused: boolean;
}

const StyledInputWrapper = styled.div<StyledInputWrapperProps>`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid;
  border-radius: ${props => props.theme.borderRadius.md}px;
  transition: all ${props => props.theme.transitions.normal};
  background: ${props => props.$disabled ? props.theme.colors.surface.disabled : props.theme.colors.surface.default};
  
  /* Size variants */
  ${props => {
    const sizes = {
      sm: {
        height: '20px',
        padding: `0 ${props.theme.spacing.sm}px`,
      },
      md: {
        height: '24px',
        padding: `0 ${props.theme.spacing.md}px`,
      },
      lg: {
        height: '32px',
        padding: `0 ${props.theme.spacing.lg}px`,
      },
    };
    const size = sizes[props.$size];
    return `
      height: ${size.height};
      padding: ${size.padding};
    `;
  }}
  
  /* Border color states */
  border-color: ${props => {
    if (props.$error) return props.theme.colors.border.error;
    if (props.$focused) return props.theme.colors.border.focus;
    return props.theme.colors.border.default;
  }};
  
  /* Focus ring */
  ${props => props.$focused && !props.$error && `
    box-shadow: 0 0 0 2px ${props.theme.colors.accent.primary}20;
  `}
  
  /* Disabled state */
  ${props => props.$disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
  
  /* Hover state */
  &:hover:not(:focus-within) {
    border-color: ${props => {
      if (props.$disabled || props.$error) return 'inherit';
      return props.theme.colors.border.focus;
    }};
  }
`;

/**
 * A standardized wrapper component for form inputs.
 * 
 * Provides consistent styling and behavior for input containers
 * across different form components, with support for different sizes,
 * states (error, disabled, focused), and consistent border styling.
 * 
 * @example
 * ```tsx
 * <InputWrapper 
 *   size="md"
 *   error={!!inputError}
 *   disabled={isDisabled}
 *   focused={isFocused}
 * >
 *   <input type="text" />
 * </InputWrapper>
 * ```
 */
export const InputWrapper: React.FC<InputWrapperProps> = ({
  children,
  size = 'md',
  error = false,
  disabled = false,
  focused = false,
  className,
  onMouseDown,
  onClick,
  ref
}) => {
  return (
    <StyledInputWrapper
      $size={size}
      $error={error}
      $disabled={disabled}
      $focused={focused}
      className={className}
      onMouseDown={onMouseDown}
      onClick={onClick}
      ref={ref}
    >
      {children}
    </StyledInputWrapper>
  );
};
