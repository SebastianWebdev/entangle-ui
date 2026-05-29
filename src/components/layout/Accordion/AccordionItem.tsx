'use client';

import React from 'react';

import { cx } from '@/utils/cx';

import { useAccordionContext, AccordionItemContext } from './Accordion';
import { accordionItem } from './Accordion.css';

import type {
  AccordionItemContextValue,
  AccordionItemProps,
} from './Accordion.types';

// --- Component ---

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  disabled = false,
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { expandedItems } = useAccordionContext();
  const isExpanded = expandedItems.includes(value);

  const itemContext: AccordionItemContextValue = {
    value,
    isExpanded,
    isDisabled: disabled,
  };

  return (
    <AccordionItemContext.Provider value={itemContext}>
      <div
        ref={ref}
        className={cx(accordionItem, className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

AccordionItem.displayName = 'AccordionItem';
