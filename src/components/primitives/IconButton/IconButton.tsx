// src/primitives/IconButton/IconButton.tsx
import React from 'react';

import type { Prettify } from '@/types/utilities';
import type { Size, Variant } from '@/types/common';
import { cx } from '@/utils/cx';
import { iconButtonRecipe, loadingSpinnerRecipe } from './IconButton.css';

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

export interface IconButtonBaseProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'css' | 'children'
> {
  /**
   * Icon component to display inside the button.
   * Should be an Icon component or similar icon element.
   * The button will automatically size itself based on the icon size.
   *
   * @example <SaveIcon />, <AddIcon />
   */
  children: React.ReactNode;

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
   */
  testId?: string;

  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Props for the IconButton component with prettified type for better IntelliSense
 */
export type IconButtonProps = Prettify<IconButtonBaseProps>;

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
export const IconButton = /*#__PURE__*/ React.memo<IconButtonProps>(
  ({
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
    testId,
    style,
    ref,
    ...props
  }) => {
    return (
      <button
        ref={ref}
        className={cx(
          iconButtonRecipe({
            size,
            variant,
            radius,
            pressed: pressed || undefined,
          }),
          className
        )}
        disabled={disabled || loading}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={pressed}
        data-testid={testId}
        style={style}
        {...props}
      >
        {loading ? (
          <div className={loadingSpinnerRecipe({ size })} />
        ) : (
          children
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
