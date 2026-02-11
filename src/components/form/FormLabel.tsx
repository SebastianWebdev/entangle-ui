'use client';

import React from 'react';
import type { BaseComponent } from '@/types/common';
import { Prettify } from '@/types/utilities';
import { cx } from '@/utils/cx';
import { formLabelRecipe, requiredIndicatorStyle } from './FormLabel.css';

export interface FormLabelBaseProps extends BaseComponent<HTMLLabelElement> {
  /**
   * Label content
   */
  children: React.ReactNode;

  /**
   * HTML for attribute to associate label with form control
   */
  htmlFor?: string;

  /**
   * Whether the associated form control is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the associated form control is required
   * @default false
   */
  required?: boolean;
}

export type FormLabelProps = Prettify<FormLabelBaseProps>;

/**
 * A standardized form label component for use with form controls.
 *
 * Provides consistent styling and behavior for labels across different
 * form components, with support for required indicators and disabled states.
 *
 * @example
 * ```tsx
 * <FormLabel htmlFor="name-input" required>
 *   Full Name
 * </FormLabel>
 * <Input id="name-input" />
 * ```
 */
export const FormLabel = /*#__PURE__*/ React.memo<FormLabelProps>(
  ({
    children,
    htmlFor,
    disabled = false,
    required = false,
    className,
    style,
    ref,
    ...rest
  }) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={cx(formLabelRecipe({ disabled }), className)}
        style={style}
        {...rest}
      >
        {children}
        {required && <span className={requiredIndicatorStyle}> *</span>}
      </label>
    );
  }
);

FormLabel.displayName = 'FormLabel';
