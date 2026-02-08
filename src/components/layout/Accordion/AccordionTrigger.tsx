import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { useAccordionContext, useAccordionItemContext } from './Accordion';
import type {
  AccordionSize,
  AccordionTriggerProps,
  AccordionVariant,
} from './Accordion.types';
import type { Theme } from '@/theme';

// --- Size maps ---

interface TriggerSizeConfig {
  height: number;
  paddingKey: keyof Theme['spacing'];
  fontKey: keyof Theme['typography']['fontSize'];
  chevronSize: number;
}

const TRIGGER_SIZE_MAP: Record<AccordionSize, TriggerSizeConfig> = {
  sm: { height: 28, paddingKey: 'md', fontKey: 'xs', chevronSize: 10 },
  md: { height: 32, paddingKey: 'lg', fontKey: 'sm', chevronSize: 12 },
  lg: { height: 38, paddingKey: 'xl', fontKey: 'md', chevronSize: 14 },
};

// --- Styled ---

interface StyledTriggerButtonProps {
  $variant: AccordionVariant;
  $size: AccordionSize;
  $expanded: boolean;
  $disabled: boolean;
}

const StyledTriggerButton = styled.button<StyledTriggerButtonProps>`
  /* Reset */
  margin: 0;
  border: none;
  font-family: inherit;
  outline: none;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  width: 100%;
  text-align: left;

  /* Layout */
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm}px;

  /* Sizing */
  height: ${props => TRIGGER_SIZE_MAP[props.$size].height}px;
  padding: 0
    ${props => props.theme.spacing[TRIGGER_SIZE_MAP[props.$size].paddingKey]}px;
  font-size: ${props =>
    props.theme.typography.fontSize[TRIGGER_SIZE_MAP[props.$size].fontKey]}px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  transition: background ${props => props.theme.transitions.fast};

  /* Disabled */
  opacity: ${props => (props.$disabled ? 0.5 : 1)};

  /* Variant styles */
  ${props => {
    const { colors } = props.theme;

    switch (props.$variant) {
      case 'ghost':
        return `
          background: transparent;
          border-bottom: 1px solid ${colors.border.default};
          &:hover:not(:disabled) {
            background: ${colors.surface.hover};
          }
        `;
      case 'filled':
        return `
          background: ${colors.background.tertiary};
          &:hover:not(:disabled) {
            background: ${colors.surface.hover};
          }
        `;
      default:
        return `
          background: ${colors.surface.default};
          border-bottom: 1px solid ${colors.border.default};
          &:hover:not(:disabled) {
            background: ${colors.surface.hover};
          }
        `;
    }
  }}

  /* Focus visible */
  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
    z-index: 1;
  }
`;

interface StyledChevronProps {
  $expanded: boolean;
  $size: number;
}

const StyledChevron = styled.span<StyledChevronProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform ${props => props.theme.transitions.fast};
  transform: rotate(${props => (props.$expanded ? '90deg' : '0deg')});
  color: ${props => props.theme.colors.text.muted};

  svg {
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
  }
`;

const StyledActionsArea = styled.span`
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: ${props => props.theme.spacing.xs}px;
`;

const StyledIconArea = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

// --- Chevron icon ---

const ChevronRightIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4.5 3L7.5 6L4.5 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- Component ---

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  icon,
  actions,
  indicator,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { toggleItem, variant, size, accordionId } = useAccordionContext();
  const { value, isExpanded, isDisabled } = useAccordionItemContext();
  const sizeConfig = TRIGGER_SIZE_MAP[size];

  const triggerId = `accordion-${accordionId}-trigger-${value}`;
  const contentId = `accordion-${accordionId}-content-${value}`;

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      toggleItem(value);
    }
  }, [isDisabled, toggleItem, value]);

  const handleActionsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const showIndicator = indicator !== null;

  return (
    <StyledTriggerButton
      ref={ref}
      type="button"
      id={triggerId}
      aria-expanded={isExpanded}
      aria-controls={contentId}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      onClick={handleClick}
      $variant={variant}
      $size={size}
      $expanded={isExpanded}
      $disabled={isDisabled}
      className={className}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {showIndicator && (
        <StyledChevron $expanded={isExpanded} $size={sizeConfig.chevronSize}>
          {indicator ?? <ChevronRightIcon size={sizeConfig.chevronSize} />}
        </StyledChevron>
      )}
      {icon && <StyledIconArea>{icon}</StyledIconArea>}
      <span>{children}</span>
      {actions && (
        <StyledActionsArea onClick={handleActionsClick}>
          {actions}
        </StyledActionsArea>
      )}
    </StyledTriggerButton>
  );
};

AccordionTrigger.displayName = 'AccordionTrigger';
