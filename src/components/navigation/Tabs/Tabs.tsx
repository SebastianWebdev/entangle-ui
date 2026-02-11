import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react';
import { cx } from '@/utils/cx';
import type { TabsContextValue, TabsProps } from './Tabs.types';
import { tabsRootRecipe } from './Tabs.css';

// --- Context ---

const TabsContext = /*#__PURE__*/ createContext<TabsContextValue | null>(null);

export function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs compound components must be used within <Tabs>');
  }
  return ctx;
}

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
  testId,
  ref,
  ...rest
}) => {
  const autoId = useId();
  const tabsId = autoId;

  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = valueProp !== undefined;
  const activeValue = isControlled ? valueProp : internalValue;

  const setActiveValue = useCallback(
    (val: string) => {
      if (!isControlled) {
        setInternalValue(val);
      }
      onChange?.(val);
    },
    [isControlled, onChange]
  );

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      activeValue,
      setActiveValue,
      variant,
      size,
      orientation,
      fullWidth,
      pillsFrame,
      tabsId,
    }),
    [
      activeValue,
      setActiveValue,
      variant,
      size,
      orientation,
      fullWidth,
      pillsFrame,
      tabsId,
    ]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cx(tabsRootRecipe({ orientation }), className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

Tabs.displayName = 'Tabs';
