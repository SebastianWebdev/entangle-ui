'use client';

import React from 'react';
import { useTabsContext } from './Tabs';
import type { TabPanelProps } from './Tabs.types';
import { cx } from '@/utils/cx';
import { tabPanelStyle } from './Tabs.css';

// --- Component ---

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  children,
  keepMounted,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const ctx = useTabsContext();
  const { activeValue, tabsId } = ctx;
  const isActive = activeValue === value;

  // Explicit child prop wins over the parent cascade. Undefined = inherit.
  const effectiveKeepMounted = keepMounted ?? ctx.keepMounted;

  const tabId = `tabs-${tabsId}-tab-${value}`;
  const panelId = `tabs-${tabsId}-panel-${value}`;

  if (!isActive && !effectiveKeepMounted) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={isActive ? 0 : -1}
      hidden={!isActive || undefined}
      className={cx(tabPanelStyle, className)}
      style={{
        ...style,
        ...(isActive ? undefined : { display: 'none' }),
      }}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
};

TabPanel.displayName = 'TabPanel';
