'use client';

import React from 'react';
import { useAccordionContext, AccordionItemContext } from './Accordion';
import type {
  AccordionItemContextValue,
  AccordionItemProps,
} from './Accordion.types';
import { cx } from '@/utils/cx';
import { accordionItem } from './Accordion.css';

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
