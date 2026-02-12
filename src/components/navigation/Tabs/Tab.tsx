'use client';

import React, { useCallback } from 'react';
import { useTabsContext } from './Tabs';
import type { TabProps, TabsSize } from './Tabs.types';
import { CloseIcon } from '@/components/Icons/CloseIcon';
import { cx } from '@/utils/cx';
import { vars } from '@/theme/contract.css';
import {
  tabBaseStyle,
  tabRecipe,
  tabUnderlineStyle,
  tabUnderlineActiveStyle,
  tabUnderlineInactiveStyle,
  tabUnderlineActiveHorizontalStyle,
  tabUnderlineActiveVerticalStyle,
  tabUnderlineInactiveIndicatorStyle,
  tabPillsStyle,
  tabPillsActiveStyle,
  tabPillsInactiveStyle,
  tabEnclosedStyle,
  tabEnclosedActiveHorizontalStyle,
  tabEnclosedActiveVerticalStyle,
  tabEnclosedInactiveStyle,
  tabIconStyle,
  tabCloseButtonStyle,
} from './Tabs.css';

// --- Size maps ---

interface TabSizeConfig {
  iconSize: number;
}

const TAB_SIZE_MAP: Record<TabsSize, TabSizeConfig> = {
  sm: { iconSize: 11 },
  md: { iconSize: 13 },
  lg: { iconSize: 15 },
};

// --- Helper to compute variant classes ---

function getVariantClasses(
  variant: string,
  isActive: boolean,
  orientation: 'horizontal' | 'vertical'
): string {
  switch (variant) {
    case 'underline':
      return cx(
        tabUnderlineStyle,
        isActive ? tabUnderlineActiveStyle : tabUnderlineInactiveStyle,
        isActive
          ? orientation === 'vertical'
            ? tabUnderlineActiveVerticalStyle
            : tabUnderlineActiveHorizontalStyle
          : tabUnderlineInactiveIndicatorStyle
      );
    case 'pills':
      return cx(
        tabPillsStyle,
        isActive ? tabPillsActiveStyle : tabPillsInactiveStyle
      );
    case 'enclosed':
      return cx(
        tabEnclosedStyle,
        isActive
          ? orientation === 'vertical'
            ? tabEnclosedActiveVerticalStyle
            : tabEnclosedActiveHorizontalStyle
          : tabEnclosedInactiveStyle
      );
    default:
      return '';
  }
}

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

  const variantClasses = getVariantClasses(variant, isActive, orientation);

  return (
    <button
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
      className={cx(
        tabBaseStyle,
        tabRecipe({ size, disabled, fullWidth }),
        variantClasses,
        className
      )}
      style={{
        gap: vars.spacing.xs,
        transition: `all ${vars.transitions.fast}`,
        ...style,
      }}
      data-testid={testId}
      {...rest}
    >
      {icon && (
        <span
          className={tabIconStyle}
          style={{
            width: `${sizeConfig.iconSize}px`,
            height: `${sizeConfig.iconSize}px`,
          }}
        >
          {icon}
        </span>
      )}
      {children}
      {closable && (
        <span
          className={tabCloseButtonStyle}
          role="button"
          aria-label={`Close ${typeof children === 'string' ? children : value}`}
          onClick={handleClose}
        >
          <CloseIcon size={closeIconSize} decorative />
        </span>
      )}
    </button>
  );
};

Tab.displayName = 'Tab';
