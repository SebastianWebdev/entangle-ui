import React from 'react';
import styled from '@emotion/styled';
import type { BaseComponent } from '@/types/common';
import { processCss } from '@/utils/styledUtils';
import { Prettify } from '@/types/utilities';

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

const StyledLabel = styled.label<{
  $disabled: boolean;
  $css?: FormLabelBaseProps['css'];
}>`
  font-size: ${props => props.theme.typography.fontSize.sm}px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props =>
    props.$disabled
      ? props.theme.colors.text.disabled
      : props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.tight};
  margin-bottom: ${props => props.theme.spacing.xs}px;
  display: inline-block;

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

const RequiredIndicator = styled.span`
  color: ${props => props.theme.colors.accent.error};
  margin-left: 2px;
`;

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
export const FormLabel = React.memo<FormLabelProps>(
  ({
    children,
    htmlFor,
    disabled = false,
    required = false,
    className,
    style,
    css,
    ref,
    ...rest
  }) => {
    return (
      <StyledLabel
        ref={ref}
        htmlFor={htmlFor}
        $disabled={disabled}
        $css={css}
        className={className}
        style={style}
        {...rest}
      >
        {children}
        {required && <RequiredIndicator> *</RequiredIndicator>}
      </StyledLabel>
    );
  }
);

FormLabel.displayName = 'FormLabel';
