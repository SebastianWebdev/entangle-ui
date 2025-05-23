// src/primitives/Button/Button.tsx
import React from 'react';
import styled from '@emotion/styled';
import {Size, Variant} from '@/types/common'

/**
 * Rozmiary przycisku zoptymalizowane dla interfejsów edytora
 */
export type ButtonSize =Size;

/**
 * Warianty wizualne przycisku
 */
export type ButtonVariant = Variant;

/**
 * Właściwości komponentu Button
 */
export interface ButtonProps {
  /** 
   * Zawartość przycisku - tekst, ikony lub inne elementy React
   * @example "Zapisz", <><SaveIcon /> Zapisz</> 
   */
  children?: React.ReactNode;
  
  /** 
   * Dodatkowe klasy CSS
   */
  className?: string;
  
  /** 
   * Wariant rozmiaru zoptymalizowany dla interfejsów edytora
   * - `sm`: wysokość 24px, kompaktowy dla pasków narzędzi
   * - `md`: wysokość 28px, standardowy dla paneli
   * - `lg`: wysokość 32px, dla prominentnych akcji
   * @default "md"
   */
  size?: ButtonSize;
  
  /** 
   * Wariant wizualny przycisku
   * - `default`: Przezroczysty z obramowaniem, wypełnia się przy hover
   * - `ghost`: Bez obramowania, subtelny stan hover  
   * - `filled`: Solidne tło z kolorem akcentu
   * @default "default"
   */
  variant?: ButtonVariant;
  
  /** 
   * Czy przycisk jest wyłączony
   * Gdy true, przycisk staje się nieinteraktywny z obniżoną przezroczystością
   * @default false
   */
  disabled?: boolean;
  
  /** 
   * Stan ładowania - pokazuje spinner i wyłącza interakcję
   * Używaj dla operacji asynchronicznych jak zapisywanie, ładowanie danych
   * @default false
   */
  loading?: boolean;
  
  /** 
   * Element ikony do wyświetlenia przed tekstem
   * Powinien mieć rozmiar 16x16px dla optymalnego wyglądu
   * @example <SaveIcon />, <PlayIcon />
   */
  icon?: React.ReactNode;
  
  /** 
   * Czy przycisk powinien zajmować pełną szerokość kontenera
   * Przydatne dla akcji formularzy i przycisków modalnych
   * @default false
   */
  fullWidth?: boolean;
  
  /** 
   * Handler zdarzenia kliknięcia
   * Wywoływany gdy przycisk jest kliknięty (nie gdy disabled/loading)
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /** 
   * Identyfikator testowy dla testów automatycznych
   * Powinien następować wzorzec: component-action-context
   * @example "button-save-project", "button-cancel-dialog"
   */
  'data-testid'?: string;
}

/**
 * Właściwości dla stylowanego komponentu przycisku
 */
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

/**
 * Komponent spinnera ładowania
 */
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

/**
 * Wrapper dla ikony
 */
const IconWrapper = styled.span`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Wszechstronny komponent przycisku dla interfejsów edytora.
 * 
 * Obsługuje wiele wariantów, rozmiarów i stanów. Zoptymalizowany dla profesjonalnych
 * interfejsów edytora z kompaktowymi wymiarami i precyzyjnymi interakcjami.
 * 
 * @example
 * ```tsx
 * // Podstawowe użycie
 * <Button variant="default" size="md">Zapisz</Button>
 * 
 * // Z ikoną i stanem ładowania
 * <Button 
 *   icon={<SaveIcon />} 
 *   loading={isSaving}
 *   onClick={handleSave}
 * >
 *   Zapisz Projekt
 * </Button>
 * 
 * // Przycisk pełnej szerokości
 * <Button variant="filled" fullWidth>
 *   Potwierdź
 * </Button>
 * ```
 */
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
