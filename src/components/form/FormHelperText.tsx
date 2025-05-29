import React from 'react';
import styled from '@emotion/styled';

export interface FormHelperTextProps {
  /**
   * Helper text content
   */
  children: React.ReactNode;
  
  /**
   * Whether to display in error state
   * @default false
   */
  error?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Custom CSS styles applied inline
   */
  style?: React.CSSProperties;
  
  /**
   * Custom CSS styles included in styled-components
   * This allows for more powerful styling with theme access and nesting
   */
  css?: string | ((props: any) => string);
}

const StyledHelperText = styled.div<{ $error: boolean; $css?: string | ((props: any) => string) }>`
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  line-height: ${props => props.theme.typography.lineHeight.tight};
  color: ${props => props.$error ? props.theme.colors.accent.error : props.theme.colors.text.muted};
  margin-top: ${props => props.theme.spacing.xs}px;
  
  /* Custom CSS */
  ${props => props.$css && typeof props.$css === 'function' ? props.$css(props) : props.$css}
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
export const FormHelperText: React.FC<FormHelperTextProps> = ({
  children,
  error = false,
  className,
  style,
  css,
}) => {
  return (
    <StyledHelperText 
      $error={error}
      $css={css}
      className={className}
      style={style}
    >
      {children}
    </StyledHelperText>
  );
};
