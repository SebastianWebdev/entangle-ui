// src/primitives/Button/Button.tsx
import React from 'react';
import type { Prettify } from '@/types/utilities';
import type { Size, Variant } from '@/types/common';
import { cx } from '@/utils/cx';
import {
  buttonRecipe,
  loadingSpinnerStyle,
  iconWrapperStyle,
} from './Button.css';

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
export interface ButtonBaseProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'css'
> {
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
   * Test identifier for automated testing
   */
  testId?: string;

  /**
   * Click event handler
   * Called when button is clicked (not when disabled/loading)
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Props for the Button component with prettified type for better IntelliSense
 */
export type ButtonProps = Prettify<ButtonBaseProps>;

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
    ref,
    ...props
  }) => {
    return (
      <button
        ref={ref}
        className={cx(
          buttonRecipe({ variant, size, fullWidth: fullWidth || undefined }),
          className
        )}
        disabled={disabled || loading}
        onClick={onClick}
        data-testid={testId}
        style={style}
        {...props}
      >
        {loading ? (
          <div className={loadingSpinnerStyle} />
        ) : icon ? (
          <span className={iconWrapperStyle}>{icon}</span>
        ) : null}

        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
