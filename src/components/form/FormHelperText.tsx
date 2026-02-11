import React from 'react';
import type { BaseComponent } from '@/types/common';
import { Prettify } from '@/types/utilities';
import { cx } from '@/utils/cx';
import { formHelperTextRecipe } from './FormHelperText.css';

export interface FormHelperTextBaseProps extends BaseComponent<HTMLDivElement> {
  /**
   * Helper text content
   */
  children: React.ReactNode;

  /**
   * Whether to display in error state
   * @default false
   */
  error?: boolean;
}

export type FormHelperTextProps = Prettify<FormHelperTextBaseProps>;

/**
 * A standardized helper text component for use with form controls.
 *
 * Provides consistent styling for helper text and error messages
 * across different form components.
 *
 * @example
 * ```tsx
 * <Input label="Email" />
 * <FormHelperText>We'll never share your email with anyone else.</FormHelperText>
 *
 * <Input label="Username" error={!!usernameError} />
 * <FormHelperText error>{usernameError}</FormHelperText>
 * ```
 */
export const FormHelperText = /*#__PURE__*/ React.memo<FormHelperTextProps>(
  ({ children, error = false, className, style, ref, ...rest }) => {
    return (
      <div
        ref={ref}
        className={cx(formHelperTextRecipe({ error }), className)}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

FormHelperText.displayName = 'FormHelperText';
