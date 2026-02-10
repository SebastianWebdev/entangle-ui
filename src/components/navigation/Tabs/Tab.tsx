import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { useTabsContext } from './Tabs';
import type { TabProps, TabsSize, TabsVariant } from './Tabs.types';
import { CloseIcon } from '@/components/Icons';
import type { Theme } from '@/theme';

// --- Size maps ---

interface TabSizeConfig {
  height: number;
  paddingKey: keyof Theme['spacing'];
  fontKey: keyof Theme['typography']['fontSize'];
  iconSize: number;
}

const TAB_SIZE_MAP: Record<TabsSize, TabSizeConfig> = {
  sm: {
    height: 24,
    paddingKey: 'sm',
    fontKey: 'xs',
    iconSize: 11,
  },
  md: {
    height: 28,
    paddingKey: 'md',
    fontKey: 'sm',
    iconSize: 13,
  },
  lg: {
    height: 32,
    paddingKey: 'lg',
    fontKey: 'md',
    iconSize: 15,
  },
};

// --- Styled ---

interface StyledTabProps {
  $active: boolean;
  $disabled: boolean;
  $variant: TabsVariant;
  $size: TabsSize;
  $orientation: 'horizontal' | 'vertical';
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
  border-radius: ${props => props.theme.borderRadius.sm}px;

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
  line-height: ${props => props.theme.typography.lineHeight.tight};
  transition: all ${props => props.theme.transitions.fast};
  min-width: 0;

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
          background: ${props.$active ? colors.surface.active : 'transparent'};
          ${
            props.$active
              ? props.$orientation === 'vertical'
                ? 'margin-right: -1px;'
                : 'margin-bottom: -1px;'
              : ''
          }

          &::after {
            content: '';
            position: absolute;
            border-radius: ${props.theme.borderRadius.sm}px;
            background: ${colors.accent.primary};
            opacity: ${props.$active ? 1 : 0};
            transition: opacity ${props.theme.transitions.fast};
            ${
              props.$orientation === 'vertical'
                ? `
                  top: 0;
                  bottom: 0;
                  right: -1px;
                  width: 2px;
                `
                : `
                  left: 0;
                  right: 0;
                  bottom: -1px;
                  height: 2px;
                `
            }
          }

          &:hover:not(:disabled) {
            color: ${colors.text.primary};
            background: ${colors.surface.hover};
          }
        `;
      case 'pills':
        return `
          color: ${props.$active ? colors.text.primary : colors.text.secondary};
          background: ${props.$active ? colors.surface.active : colors.background.secondary};
          border: 1px solid ${props.$active ? colors.border.default : 'transparent'};
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
                background: ${colors.background.primary};
                ${
                  props.$orientation === 'vertical'
                    ? `
                      border-right-color: ${colors.background.primary};
                      border-radius: ${props.theme.borderRadius.md}px 0 0 ${props.theme.borderRadius.md}px;
                      margin-right: -1px;
                    `
                    : `
                      border-bottom-color: ${colors.background.primary};
                      border-radius: ${props.theme.borderRadius.md}px ${props.theme.borderRadius.md}px 0 0;
                      margin-bottom: -1px;
                    `
                }
              `
              : `
                background: ${colors.surface.default};
                border: 1px solid transparent;
              `
          }

          &:hover:not(:disabled) {
            color: ${colors.text.primary};
            background: ${props.$active ? colors.background.primary : colors.surface.hover};
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

const StyledCloseButton = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  color: ${props => props.theme.colors.text.muted};
  border-radius: ${props => props.theme.borderRadius.sm}px;
  padding: 2px;
  margin-left: ${props => props.theme.spacing.sm}px;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text.primary};
    background: ${props => props.theme.colors.surface.hover};
  }

  svg {
    color: currentColor;
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
  const {
    activeValue,
    setActiveValue,
    variant,
    size,
    orientation,
    fullWidth,
    tabsId,
  } = useTabsContext();
  const isActive = activeValue === value;
  const sizeConfig = TAB_SIZE_MAP[size];
  const closeIconSize = size === 'lg' ? 'md' : 'sm';

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
      $orientation={orientation}
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
        >
          <CloseIcon size={closeIconSize} decorative />
        </StyledCloseButton>
      )}
    </StyledTab>
  );
};

Tab.displayName = 'Tab';
