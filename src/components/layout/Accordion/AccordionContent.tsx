import React from 'react';
import { useAccordionContext, useAccordionItemContext } from './Accordion';
import type { AccordionContentProps } from './Accordion.types';
import { cx } from '@/utils/cx';
import {
  contentWrapper,
  contentWrapperExpanded,
  contentWrapperCollapsed,
  contentInner,
  contentBody,
} from './Accordion.css';

// --- Component ---

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  keepMounted = false,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { size, accordionId } = useAccordionContext();
  const { value, isExpanded } = useAccordionItemContext();

  const triggerId = `accordion-${accordionId}-trigger-${value}`;
  const contentId = `accordion-${accordionId}-content-${value}`;

  if (!isExpanded && !keepMounted) {
    return null;
  }

  return (
    <div
      className={cx(
        contentWrapper,
        isExpanded ? contentWrapperExpanded : contentWrapperCollapsed
      )}
      role="region"
      id={contentId}
      aria-labelledby={triggerId}
      hidden={!isExpanded || undefined}
    >
      <div className={contentInner}>
        <div
          ref={ref}
          className={cx(contentBody({ size }), className)}
          style={style}
          data-testid={testId}
          {...rest}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

AccordionContent.displayName = 'AccordionContent';
