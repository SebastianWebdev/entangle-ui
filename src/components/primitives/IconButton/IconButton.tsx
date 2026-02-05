// src/primitives/IconButton/IconButton.tsx
import React from 'react';
import styled from '@emotion/styled';

import type { Prettify } from '@/types/utilities';
import type { Size, Variant } from '@/types/common';

/**
 * Standard size variants for IconButton using library sizing.
 */
export type IconButtonSize = Size;

/**
 * Visual variants for IconButton - strict typing for controlled API.
 */
export type IconButtonVariant = Variant;

/**
 * Border radius variants for IconButton shape control.
 */
export type IconButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface IconButtonBaseProps {
  /**
   * Icon component to display inside the button.
   * Should be an Icon component or similar icon element.
   * The button will automatically size itself based on the icon size.
   *
   * @example <SaveIcon />, <AddIcon />
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes for custom styling
   */
  className?: string;

  /**
   * Button size using standard library sizing
   * Button will be square and sized appropriately for the icon
   * - `sm`: 20px square (for 12px icons)
   * - `md`: 24px square (for 16px icons)
   * - `lg`: 32px square (for 20px icons)
   * @default "md"
   */
  size?: IconButtonSize;

  /**
   * Button visual variant
   * - `default`: Transparent with border, fills on hover
   * - `ghost`: No border, subtle hover state
   * - `filled`: Solid background with accent color
   * @default "ghost"
   */
  variant?: IconButtonVariant;

  /**
   * Border radius for button shape control
   * - `none`: Sharp corners (0px)
   * - `sm`: Slightly rounded (2px)
   * - `md`: Moderately rounded (4px)
   * - `lg`: More rounded (6px)
   * - `full`: Fully circular
   * @default "md"
   */
  radius?: IconButtonRadius;

  /**
   * Whether the button is disabled
   * When true, button becomes non-interactive with reduced opacity
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the button is in a loading state
   * Shows spinner and disables interaction
   * @default false
   */
  loading?: boolean;

  /**
   * Whether the button appears pressed/active
   * Useful for toggle states and active tool indicators
   * @default false
   */
  pressed?: boolean;

  /**
   * Accessible label for screen readers
   * Required for proper accessibility
   * @example "Save file", "Delete item", "Close dialog"
   */
  'aria-label': string;

  /**
   * Click event handler
   * Called when button is clicked (not when disabled/loading)
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Test identifier for automated testing
   * @example "icon-button-save", "icon-button-delete"
   */
  'data-testid'?: string;

  /**
   * Ref forwarded to the underlying button element
   */
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Props for the IconButton component with prettified type for better IntelliSense
 */
export type IconButtonProps = Prettify<IconButtonBaseProps>;

interface StyledIconButtonProps {
  $size: IconButtonSize;
  $variant: IconButtonVariant;
  $radius: IconButtonRadius;
  $loading: boolean;
  $pressed: boolean;
}

const StyledIconButton = styled.button<StyledIconButtonProps>`
  /* Reset */
  margin: 0;
  padding: 0;
  font-family: inherit;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  user-select: none;

  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transitions.normal};
  outline: none;
  position: relative;

  /* Size variants - square buttons scaled to icon size */
  ${props => {
    const sizes = {
      sm: {
        width: '20px', // Compact for 12px icons
        height: '20px',
        padding: '4px',
      },
      md: {
        width: '24px', // Standard for 16px icons
        height: '24px',
        padding: '4px',
      },
      lg: {
        width: '32px', // Larger for 20px icons
        height: '32px',
        padding: '6px',
      },
    };
    const size = sizes[props.$size];
    return `
      width: ${size.width};
      height: ${size.height};
      padding: ${size.padding};
    `;
  }}

  /* Border radius variants */
  ${props => {
    const radiusMap = {
      none: '0px',
      sm: `${props.theme.borderRadius.sm}px`,
      md: `${props.theme.borderRadius.md}px`,
      lg: `${props.theme.borderRadius.lg}px`,
      full: '50%',
    };
    return `border-radius: ${radiusMap[props.$radius]};`;
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
            border-color: ${colors.border.focus};
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
  
  /* Pressed state */
  ${props =>
    props.$pressed &&
    `
    background: ${props.theme.colors.surface.active} !important;
    border-color: ${props.theme.colors.border.focus} !important;
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Focus visible */
  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }

  /* Active press effect */
  &:active:not(:disabled) {
    transform: translateY(0.5px);
  }

  /* Icon container - centers icon properly */
  & > * {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const LoadingSpinner = styled.div<{ $size: IconButtonSize }>`
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  ${props => {
    const sizes = {
      sm: '12px',
      md: '16px',
      lg: '20px',
    };
    return `
      width: ${sizes[props.$size]};
      height: ${sizes[props.$size]};
    `;
  }}

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * A specialized square button component for displaying icons in editor interfaces.
 *
 * Designed for toolbar actions, quick controls, and icon-based interactions.
 * Always square and sized appropriately for the contained icon.
 * Supports various border radius options from sharp corners to fully circular.
 *
 * @example
 * ```tsx
 * // Basic ghost button (default)
 * <IconButton aria-label="Save file">
 *   <SaveIcon />
 * </IconButton>
 *
 * // Circular filled button
 * <IconButton
 *   variant="filled"
 *   radius="full"
 *   size="lg"
 *   aria-label="Add item"
 * >
 *   <AddIcon />
 * </IconButton>
 *
 * // Sharp corners for toolbar
 * <IconButton
 *   variant="default"
 *   radius="none"
 *   aria-label="Settings"
 * >
 *   <SettingsIcon />
 * </IconButton>
 *
 * // Toggle state
 * <IconButton
 *   pressed={isVisible}
 *   radius="sm"
 *   aria-label="Toggle visibility"
 *   onClick={toggleVisibility}
 * >
 *   <EyeIcon />
 * </IconButton>
 * ```
 */
export const IconButton: React.FC<IconButtonProps> = ({
  children,
  className,
  size = 'md',
  variant = 'ghost',
  radius = 'md',
  disabled = false,
  loading = false,
  pressed = false,
  onClick,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ref,
  ...props
}) => {
  return (
    <StyledIconButton
      ref={ref}
      className={className}
      $size={size}
      $variant={variant}
      $radius={radius}
      $loading={loading}
      $pressed={pressed}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      data-testid={testId}
      {...props}
    >
      {loading ? <LoadingSpinner $size={size} /> : children}
    </StyledIconButton>
  );
};

IconButton.displayName = 'IconButton';
