import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
} from 'react';
import { cx } from '@/utils/cx';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import type {
  AccordionContextValue,
  AccordionItemContextValue,
  AccordionProps,
} from './Accordion.types';
import { accordionRoot, accordionGapVar } from './Accordion.css';

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

  const mergedStyle: React.CSSProperties = {
    ...assignInlineVars({
      [accordionGapVar]: `${gap}px`,
    }),
    ...style,
  };

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cx(accordionRoot, className)}
        style={mergedStyle}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

Accordion.displayName = 'Accordion';
