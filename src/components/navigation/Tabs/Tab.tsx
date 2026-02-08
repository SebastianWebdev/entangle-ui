import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { useTabsContext } from './Tabs';
import type { TabProps, TabsSize, TabsVariant } from './Tabs.types';
import type { Theme } from '@/theme';

// --- Size maps ---

interface TabSizeConfig {
  height: number;
  paddingKey: keyof Theme['spacing'];
  fontKey: keyof Theme['typography']['fontSize'];
  iconSize: number;
  closeSize: number;
}

const TAB_SIZE_MAP: Record<TabsSize, TabSizeConfig> = {
  sm: {
    height: 28,
    paddingKey: 'md',
    fontKey: 'xs',
    iconSize: 12,
    closeSize: 10,
  },
  md: {
    height: 32,
    paddingKey: 'lg',
    fontKey: 'sm',
    iconSize: 14,
    closeSize: 12,
  },
  lg: {
    height: 38,
    paddingKey: 'xl',
    fontKey: 'md',
    iconSize: 16,
    closeSize: 14,
  },
};

// --- Styled ---

interface StyledTabProps {
  $active: boolean;
  $disabled: boolean;
  $variant: TabsVariant;
  $size: TabsSize;
  $fullWidth: boolean;
}

const StyledTab = styled.button<StyledTabProps>`
  /* Reset */
  margin: 0;
  border: none;
  font-family: inherit;
  outline: none;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  white-space: nowrap;
  background: transparent;

  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs}px;
  position: relative;
  flex-shrink: 0;

  /* Sizing */
  height: ${props => TAB_SIZE_MAP[props.$size].height}px;
  padding: 0
    ${props => props.theme.spacing[TAB_SIZE_MAP[props.$size].paddingKey]}px;
  font-size: ${props =>
    props.theme.typography.fontSize[TAB_SIZE_MAP[props.$size].fontKey]}px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all ${props => props.theme.transitions.fast};

  /* Full width */
  ${props => props.$fullWidth && 'flex: 1;'}

  /* Disabled */
  opacity: ${props => (props.$disabled ? 0.5 : 1)};

  /* Variant styles */
  ${props => {
    const { colors } = props.theme;

    switch (props.$variant) {
      case 'underline':
        return `
          color: ${props.$active ? colors.text.primary : colors.text.secondary};
          border-bottom: 2px solid ${props.$active ? colors.accent.primary : 'transparent'};
          margin-bottom: -1px;

          &:hover:not(:disabled) {
            color: ${colors.text.primary};
            background: ${colors.surface.hover};
          }
        `;
      case 'pills':
        return `
          color: ${props.$active ? colors.text.primary : colors.text.secondary};
          background: ${props.$active ? colors.surface.active : 'transparent'};
          border-radius: ${props.theme.borderRadius.md}px;

          &:hover:not(:disabled) {
            background: ${props.$active ? colors.surface.active : colors.surface.hover};
          }
        `;
      case 'enclosed':
        return `
          color: ${props.$active ? colors.text.primary : colors.text.secondary};
          ${
            props.$active
              ? `
                border: 1px solid ${colors.border.default};
                border-bottom: 1px solid ${colors.background.primary};
                background: ${colors.background.primary};
                border-radius: ${props.theme.borderRadius.md}px ${props.theme.borderRadius.md}px 0 0;
                margin-bottom: -1px;
              `
              : `
                border: 1px solid transparent;
              `
          }

          &:hover:not(:disabled) {
            color: ${colors.text.primary};
          }
        `;
      default:
        return '';
    }
  }}

  /* Focus visible */
  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
    z-index: 1;
  }
`;

const StyledTabIcon = styled.span<{ $size: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
  }
`;

const StyledCloseButton = styled.span<{ $size: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  color: ${props => props.theme.colors.text.muted};
  border-radius: ${props => props.theme.borderRadius.sm}px;
  padding: 2px;
  margin-left: ${props => props.theme.spacing.xs}px;

  &:hover {
    color: ${props => props.theme.colors.text.primary};
    background: ${props => props.theme.colors.surface.hover};
  }

  svg {
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
  }
`;

// --- Component ---

export const Tab: React.FC<TabProps> = ({
  value,
  children,
  icon,
  disabled = false,
  closable = false,
  onClose,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { activeValue, setActiveValue, variant, size, fullWidth, tabsId } =
    useTabsContext();
  const isActive = activeValue === value;
  const sizeConfig = TAB_SIZE_MAP[size];

  const tabId = `tabs-${tabsId}-tab-${value}`;
  const panelId = `tabs-${tabsId}-panel-${value}`;

  const handleClick = useCallback(() => {
    if (!disabled) {
      setActiveValue(value);
    }
  }, [disabled, setActiveValue, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!disabled) {
          setActiveValue(value);
        }
      }
      if (e.key === 'Delete' && closable && onClose) {
        e.preventDefault();
        onClose(value);
      }
    },
    [disabled, setActiveValue, value, closable, onClose]
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose?.(value);
    },
    [onClose, value]
  );

  return (
    <StyledTab
      ref={ref}
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      aria-disabled={disabled || undefined}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      $active={isActive}
      $disabled={disabled}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      className={className}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {icon && (
        <StyledTabIcon $size={sizeConfig.iconSize}>{icon}</StyledTabIcon>
      )}
      {children}
      {closable && (
        <StyledCloseButton
          role="button"
          aria-label={`Close ${typeof children === 'string' ? children : value}`}
          onClick={handleClose}
          $size={sizeConfig.closeSize}
        >
          <svg viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path
              d="M1 1L7 7M7 1L1 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </StyledCloseButton>
      )}
    </StyledTab>
  );
};

Tab.displayName = 'Tab';
