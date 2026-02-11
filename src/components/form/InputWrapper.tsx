'use client';

import React from 'react';
import type { BaseComponent, Size } from '@/types/common';
import { Prettify } from '@/types/utilities';
import { cx } from '@/utils/cx';
import { inputWrapperRecipe } from './InputWrapper.css';

export interface InputWrapperBaseProps extends BaseComponent<HTMLDivElement> {
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
}

export type InputWrapperProps = Prettify<InputWrapperBaseProps>;

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
export const InputWrapper = /*#__PURE__*/ React.memo<InputWrapperProps>(
  ({
    children,
    size = 'md',
    error = false,
    disabled = false,
    focused = false,
    className,
    style,
    ref,
    ...rest
  }) => {
    return (
      <div
        ref={ref}
        className={cx(
          inputWrapperRecipe({ size, error, disabled, focused }),
          className
        )}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

InputWrapper.displayName = 'InputWrapper';
