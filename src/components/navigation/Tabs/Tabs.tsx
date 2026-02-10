import React, { createContext, useContext, useId, useState } from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import type { TabsContextValue, TabsProps } from './Tabs.types';

// --- Context ---

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs compound components must be used within <Tabs>');
  }
  return ctx;
}

// --- Styled ---

interface StyledTabsRootProps {
  $orientation: 'horizontal' | 'vertical';
  $css?: TabsProps['css'];
}

const StyledTabsRoot = styled.div<StyledTabsRootProps>`
  display: flex;
  flex-direction: ${props =>
    props.$orientation === 'vertical' ? 'row' : 'column'};
  min-width: 0;
  min-height: 0;

  ${props => processCss(props.$css, props.theme)}
`;

// --- Component ---

/**
 * Tabs component for switching between views within a panel.
 *
 * Compound component pattern: use with TabList, Tab, and TabPanel.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="properties">
 *   <TabList>
 *     <Tab value="properties">Properties</Tab>
 *     <Tab value="materials">Materials</Tab>
 *   </TabList>
 *   <TabPanel value="properties">Properties content</TabPanel>
 *   <TabPanel value="materials">Materials content</TabPanel>
 * </Tabs>
 * ```
 */
export const Tabs: React.FC<TabsProps> = ({
  value: valueProp,
  defaultValue,
  variant = 'underline',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  pillsFrame = true,
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
  const tabsId = autoId;

  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = valueProp !== undefined;
  const activeValue = isControlled ? valueProp : internalValue;

  const setActiveValue = (val: string) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    onChange?.(val);
  };

  const contextValue: TabsContextValue = {
    activeValue,
    setActiveValue,
    variant,
    size,
    orientation,
    fullWidth,
    pillsFrame,
    tabsId,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <StyledTabsRoot
        ref={ref}
        $orientation={orientation}
        $css={css}
        className={className}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {children}
      </StyledTabsRoot>
    </TabsContext.Provider>
  );
};

Tabs.displayName = 'Tabs';
