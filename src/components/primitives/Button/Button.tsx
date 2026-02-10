// src/primitives/Button/Button.tsx
import React from 'react';
import styled from '@emotion/styled';
import type { BaseComponent, Size, Variant } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import { processCss } from '@/utils/styledUtils';

/**
 * Button sizes optimized for editor interfaces
 */
export type ButtonSize = Size;

/**
 * Visual variants for the button
 */
export type ButtonVariant = Variant;

/**
 * Base props for the Button component
 */
export interface ButtonBaseProps extends BaseComponent<HTMLButtonElement> {
  /**
   * Button content — text, icons, or other React elements
   * @example "Save", <><SaveIcon /> Save</>
   */
  children?: React.ReactNode;

  /**
   * Size variant optimized for editor interfaces
   * - `sm`: 20px height, compact for toolbars
   * - `md`: 24px height, standard for panels
   * - `lg`: 32px height, prominent actions
   * @default "md"
   */
  size?: ButtonSize;

  /**
   * Visual variant of the button
   * - `default`: Transparent with border, fills on hover
   * - `ghost`: No border, subtle hover state
   * - `filled`: Solid background with accent color
   * @default "default"
   */
  variant?: ButtonVariant;

  /**
   * Whether the button is disabled
   * When true, button becomes non-interactive with reduced opacity
   * @default false
   */
  disabled?: boolean;

  /**
   * Loading state — shows spinner and disables interaction
   * Use for async operations like saving, loading data
   * @default false
   */
  loading?: boolean;

  /**
   * Icon element to display before text
   * Should be 16x16px for optimal appearance
   * @example <SaveIcon />, <PlayIcon />
   */
  icon?: React.ReactNode;

  /**
   * Whether the button should take the full width of the container
   * Useful for form actions and modal buttons
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Click event handler
   * Called when button is clicked (not when disabled/loading)
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Props for the Button component with prettified type for better IntelliSense
 */
export type ButtonProps = Prettify<ButtonBaseProps>;

interface StyledButtonProps {
  $size: ButtonSize;
  $variant: ButtonVariant;
  $loading: boolean;
  $fullWidth: boolean;
  $css?: ButtonProps['css'];
}

const StyledButton = styled.button<StyledButtonProps>`
  /* Reset */
  margin: 0;
  font-family: inherit;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  user-select: none;

  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.md}px;
  transition: all ${props => props.theme.transitions.normal};
  outline: none;

  /* Size variants */
  ${props => {
    const sizes = {
      sm: {
        height: '20px',
        padding: `0 ${props.theme.spacing.sm}px`,
        fontSize: `${props.theme.typography.fontSize.md}px`,
        gap: `${props.theme.spacing.xs}px`,
      },
      md: {
        height: '24px',
        padding: `0 ${props.theme.spacing.md}px`,
        fontSize: `${props.theme.typography.fontSize.md}px`,
        gap: `${props.theme.spacing.sm}px`,
      },
      lg: {
        height: '32px',
        padding: `0 ${props.theme.spacing.xl}px`,
        fontSize: `${props.theme.typography.fontSize.lg}px`,
        gap: `${props.theme.spacing.md}px`,
      },
    };
    const size = sizes[props.$size];
    return `
      height: ${size.height};
      padding: ${size.padding};
      font-size: ${size.fontSize};
      gap: ${size.gap};
    `;
  }}

  /* Variant styles */
  ${props => {
    const { colors } = props.theme;

    switch (props.$variant) {
      case 'default':
        return `
          background: transparent;
          border: 1px solid ${colors.border.default};
          color: ${colors.text.primary};
          
          &:hover:not(:disabled) {
            background: ${colors.surface.hover};
            border-color: transparent;
          }
          
          &:active:not(:disabled) {
            background: ${colors.surface.active};
          }
        `;

      case 'ghost':
        return `
          background: transparent;
          border: 1px solid transparent;
          color: ${colors.text.secondary};
          
          &:hover:not(:disabled) {
            background: ${colors.surface.hover};
            color: ${colors.text.primary};
          }
          
          &:active:not(:disabled) {
            background: ${colors.surface.active};
          }
        `;

      case 'filled':
        return `
          background: ${colors.accent.primary};
          border: 1px solid ${colors.accent.primary};
          color: white;
          
          &:hover:not(:disabled) {
            background: ${colors.accent.secondary};
            border-color: ${colors.accent.secondary};
          }
          
          &:active:not(:disabled) {
            background: ${colors.accent.secondary};
          }
        `;

      default:
        return '';
    }
  }}
  
  /* Full width */
  ${props => props.$fullWidth && 'width: 100%;'}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Focus visible */
  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

/**
 * Loading spinner component
 */
const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * Icon wrapper
 */
const IconWrapper = styled.span`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Versatile button component for editor interfaces.
 *
 * Supports multiple variants, sizes, and states. Optimized for professional
 * editor interfaces with compact dimensions and precise interactions.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Button variant="default" size="md">Save</Button>
 *
 * // With icon and loading state
 * <Button
 *   icon={<SaveIcon />}
 *   loading={isSaving}
 *   onClick={handleSave}
 * >
 *   Save Project
 * </Button>
 *
 * // Full width button
 * <Button variant="filled" fullWidth>
 *   Confirm
 * </Button>
 * ```
 */
export const Button = /*#__PURE__*/ React.memo<ButtonProps>(
  ({
    children,
    className,
    size = 'md',
    variant = 'default',
    disabled = false,
    loading = false,
    icon,
    fullWidth = false,
    onClick,
    testId,
    style,
    css,
    ref,
    ...props
  }) => {
    return (
      <StyledButton
        ref={ref}
        className={className}
        $size={size}
        $variant={variant}
        $loading={loading}
        $fullWidth={fullWidth}
        $css={css}
        disabled={disabled || loading}
        onClick={onClick}
        data-testid={testId}
        style={style}
        {...props}
      >
        {loading ? (
          <LoadingSpinner />
        ) : icon ? (
          <IconWrapper>{icon}</IconWrapper>
        ) : null}

        {children && <span>{children}</span>}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';
