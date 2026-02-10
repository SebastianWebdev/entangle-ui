import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
} from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import type {
  AccordionContextValue,
  AccordionItemContextValue,
  AccordionProps,
} from './Accordion.types';

// --- Contexts ---

const AccordionContext =
  /*#__PURE__*/ createContext<AccordionContextValue | null>(null);
const AccordionItemContext =
  /*#__PURE__*/ createContext<AccordionItemContextValue | null>(null);

export function useAccordionContext(): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error(
      'Accordion compound components must be used within <Accordion>'
    );
  }
  return ctx;
}

export function useAccordionItemContext(): AccordionItemContextValue {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error(
      'AccordionTrigger/AccordionContent must be used within <AccordionItem>'
    );
  }
  return ctx;
}

export { AccordionContext, AccordionItemContext };

// --- Helpers ---

function normalizeValue(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

// --- Styled ---

interface StyledAccordionRootProps {
  $gap: number;
  $css?: AccordionProps['css'];
}

const StyledAccordionRoot = styled.div<StyledAccordionRootProps>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$gap}px;

  ${props => processCss(props.$css, props.theme)}
`;

// --- Component ---

/**
 * Accordion component for collapsible sections in property inspectors
 * and settings panels.
 *
 * Compound component pattern: use with AccordionItem, AccordionTrigger,
 * and AccordionContent.
 *
 * @example
 * ```tsx
 * <Accordion defaultValue="transform">
 *   <AccordionItem value="transform">
 *     <AccordionTrigger>Transform</AccordionTrigger>
 *     <AccordionContent>Position, rotation, scale fields...</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
export const Accordion: React.FC<AccordionProps> = ({
  value: valueProp,
  defaultValue,
  multiple = false,
  collapsible = false,
  variant = 'default',
  size = 'md',
  gap = 0,
  children,
  onChange,
  className,
  style,
  css,
  testId,
  ref,
  ...rest
}) => {
  const autoId = useId();

  const [internalValue, setInternalValue] = useState<string[]>(
    normalizeValue(defaultValue)
  );
  const isControlled = valueProp !== undefined;
  const expandedItems = isControlled
    ? normalizeValue(valueProp)
    : internalValue;

  const toggleItem = useCallback(
    (itemValue: string) => {
      const isExpanded = expandedItems.includes(itemValue);

      let nextExpanded: string[];

      if (multiple) {
        nextExpanded = isExpanded
          ? expandedItems.filter(v => v !== itemValue)
          : [...expandedItems, itemValue];
      } else {
        if (isExpanded) {
          nextExpanded = collapsible ? [] : expandedItems;
        } else {
          nextExpanded = [itemValue];
        }
      }

      if (!isControlled) {
        setInternalValue(nextExpanded);
      }

      if (multiple) {
        onChange?.(nextExpanded);
      } else {
        onChange?.(nextExpanded[0] ?? '');
      }
    },
    [expandedItems, multiple, collapsible, isControlled, onChange]
  );

  const contextValue: AccordionContextValue = {
    expandedItems,
    toggleItem,
    variant,
    size,
    accordionId: autoId,
  };

  return (
    <AccordionContext.Provider value={contextValue}>
      <StyledAccordionRoot
        ref={ref}
        $gap={gap}
        $css={css}
        className={className}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {children}
      </StyledAccordionRoot>
    </AccordionContext.Provider>
  );
};

Accordion.displayName = 'Accordion';
