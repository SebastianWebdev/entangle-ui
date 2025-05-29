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
}

const StyledHelperText = styled.div<{ $error: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  line-height: ${props => props.theme.typography.lineHeight.tight};
  color: ${props => props.$error ? props.theme.colors.accent.error : props.theme.colors.text.muted};
  margin-top: ${props => props.theme.spacing.xs}px;
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
}) => {
  return (
    <StyledHelperText 
      $error={error}
      className={className}
    >
      {children}
    </StyledHelperText>
  );
};
