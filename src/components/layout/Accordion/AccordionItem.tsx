import React from 'react';
import styled from '@emotion/styled';
import { useAccordionContext, AccordionItemContext } from './Accordion';
import type {
  AccordionItemContextValue,
  AccordionItemProps,
} from './Accordion.types';

// --- Styled ---

const StyledAccordionItem = styled.div`
  display: flex;
  flex-direction: column;
`;

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
      <StyledAccordionItem
        ref={ref}
        className={className}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {children}
      </StyledAccordionItem>
    </AccordionItemContext.Provider>
  );
};

AccordionItem.displayName = 'AccordionItem';
