// src/primitives/Button/Button.tsx
import React from 'react';
import styled from '@emotion/styled';

export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'default' | 'ghost' | 'filled';

export interface ButtonProps {
  /** Button content */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Button size */
  size?: ButtonSize;
  /** Button variant */
  variant?: ButtonVariant;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon before text */
  icon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Test ID */
  'data-testid'?: string;
}

interface StyledButtonProps {
  $size: ButtonSize;
  $variant: ButtonVariant;
  $loading: boolean;
  $fullWidth: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  /* Reset */
  margin: 0;
  font-family: inherit;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.md}px;
  transition: all ${props => props.theme.transitions.normal};
  outline: none;
  
  /* Size variants */
  ${props => {
    const sizes = {
      sm: {
        height: '24px',
        padding: `0 ${props.theme.spacing.sm * 2}px`,
        fontSize: `${props.theme.typography.fontSize.xs}px`,
        gap: `${props.theme.spacing.xs}px`,
      },
      md: {
        height: '28px',
        padding: `0 ${props.theme.spacing.md + props.theme.spacing.xs}px`,
        fontSize: `${props.theme.typography.fontSize.xs}px`,
        gap: `${props.theme.spacing.sm + props.theme.spacing.xs}px`,
      },
      lg: {
        height: '32px',
        padding: `0 ${props.theme.spacing.xl}px`,
        fontSize: `${props.theme.typography.fontSize.sm}px`,
        gap: `${props.theme.spacing.md}px`,
      },
    };
    const size = sizes[props.$size];
    return `
      height: ${size.height};
      padding: ${size.padding};
      font-size: ${size.fontSize};
      gap: ${size.gap};
    `;
  }}
  
  /* Variant styles */
  ${props => {
    const { colors } = props.theme;
    
    switch (props.$variant) {
      case 'default':
        return `
          background: transparent;
          border: 1px solid ${colors.border.default};
          color: ${colors.text.primary};
          
          &:hover:not(:disabled) {
            background: ${colors.surface.hover};
            border-color: transparent;
          }
          
          &:active:not(:disabled) {
            background: ${colors.surface.active};
          }
        `;
        
      case 'ghost':
        return `
          background: transparent;
          border: 1px solid transparent;
          color: ${colors.text.secondary};
          
          &:hover:not(:disabled) {
            background: ${colors.surface.hover};
            color: ${colors.text.primary};
          }
          
          &:active:not(:disabled) {
            background: ${colors.surface.active};
          }
        `;
        
      case 'filled':
        return `
          background: ${colors.accent.primary};
          border: 1px solid ${colors.accent.primary};
          color: white;
          
          &:hover:not(:disabled) {
            background: ${colors.accent.secondary};
            border-color: ${colors.accent.secondary};
          }
          
          &:active:not(:disabled) {
            background: ${colors.accent.secondary};
          }
        `;
        
      default:
        return '';
    }
  }}
  
  /* Full width */
  ${props => props.$fullWidth && 'width: 100%;'}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Focus visible */
  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const IconWrapper = styled.span`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  size = 'md',
  variant = 'default',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  onClick,
  'data-testid': testId,
  ...props
}) => {
  return (
    <StyledButton
      className={className}
      $size={size}
      $variant={variant}
      $loading={loading}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      data-testid={testId}
      {...props}
    >
      {loading ? (
        <LoadingSpinner />
      ) : icon ? (
        <IconWrapper>{icon}</IconWrapper>
      ) : null}
      
      {children && <span>{children}</span>}
    </StyledButton>
  );
};