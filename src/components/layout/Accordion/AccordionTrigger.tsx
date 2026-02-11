'use client';

import React, { useCallback } from 'react';
import { useAccordionContext, useAccordionItemContext } from './Accordion';
import type { AccordionSize, AccordionTriggerProps } from './Accordion.types';
import { cx } from '@/utils/cx';
import {
  triggerButton,
  chevronStyle,
  chevronExpanded,
  chevronCollapsed,
  actionsArea,
  iconArea,
} from './Accordion.css';

// --- Size maps ---

interface ChevronSizeConfig {
  chevronSize: number;
}

const CHEVRON_SIZE_MAP: Record<AccordionSize, ChevronSizeConfig> = {
  sm: { chevronSize: 10 },
  md: { chevronSize: 12 },
  lg: { chevronSize: 14 },
};

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
  const sizeConfig = CHEVRON_SIZE_MAP[size];

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
    <button
      ref={ref}
      type="button"
      id={triggerId}
      aria-expanded={isExpanded}
      aria-controls={contentId}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      onClick={handleClick}
      className={cx(
        triggerButton({ variant, size, disabled: isDisabled }),
        className
      )}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {showIndicator && (
        <span
          className={cx(
            chevronStyle,
            isExpanded ? chevronExpanded : chevronCollapsed
          )}
          style={{
            width: `${sizeConfig.chevronSize}px`,
            height: `${sizeConfig.chevronSize}px`,
          }}
        >
          {indicator ?? <ChevronRightIcon size={sizeConfig.chevronSize} />}
        </span>
      )}
      {icon && <span className={iconArea}>{icon}</span>}
      <span>{children}</span>
      {actions && (
        <span className={actionsArea} onClick={handleActionsClick}>
          {actions}
        </span>
      )}
    </button>
  );
};

AccordionTrigger.displayName = 'AccordionTrigger';
