import React from 'react';
import styled from '@emotion/styled';
import type { BaseComponent } from '@/types/common';
import { processCss } from '@/utils/styledUtils';

export interface FormHelperTextProps extends BaseComponent<HTMLDivElement> {
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

const StyledHelperText = styled.div<{
  $error: boolean;
  $css?: FormHelperTextProps['css'];
}>`
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  line-height: ${props => props.theme.typography.lineHeight.tight};
  color: ${props =>
    props.$error
      ? props.theme.colors.accent.error
      : props.theme.colors.text.muted};
  margin-top: ${props => props.theme.spacing.xs}px;

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

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
export const FormHelperText = React.memo<FormHelperTextProps>(
  ({ children, error = false, className, style, css, ref, ...rest }) => {
    return (
      <StyledHelperText
        ref={ref}
        $error={error}
        $css={css}
        className={className}
        style={style}
        {...rest}
      >
        {children}
      </StyledHelperText>
    );
  }
);

FormHelperText.displayName = 'FormHelperText';
