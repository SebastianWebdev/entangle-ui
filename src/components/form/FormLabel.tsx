import React from 'react';
import styled from '@emotion/styled';

export interface FormLabelProps {
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
   * This allows for more powerful styling with theme access
   * Can be an object of CSS properties or a function that receives theme and returns CSS properties
   */
  css?: React.CSSProperties | ((theme: any) => React.CSSProperties);
}

const StyledLabel = styled.label<{ $disabled: boolean; $css?: React.CSSProperties | ((theme: any) => React.CSSProperties) }>`
  font-size: ${props => props.theme.typography.fontSize.sm}px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.$disabled ? props.theme.colors.text.disabled : props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.tight};
  margin-bottom: ${props => props.theme.spacing.xs}px;
  display: inline-block;
  
  /* Custom CSS */
  ${props => {
    if (!props.$css) return '';
    
    const cssObj = typeof props.$css === 'function' 
      ? props.$css(props.theme) 
      : props.$css;
      
    return Object.entries(cssObj)
      .map(([key, value]) => {
        // Konwertuj camelCase na kebab-case
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${kebabKey}: ${value};`;
      })
      .join('\n');
  }}
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
export const FormLabel: React.FC<FormLabelProps> = ({
  children,
  htmlFor,
  disabled = false,
  required = false,
  className,
  style,
  css,
}) => {
  return (
    <StyledLabel 
      htmlFor={htmlFor}
      $disabled={disabled}
      $css={css}
      className={className}
      style={style}
    >
      {children}
      {required && <RequiredIndicator> *</RequiredIndicator>}
    </StyledLabel>
  );
};
