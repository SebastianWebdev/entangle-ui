import React from 'react';
import styled from '@emotion/styled';
import { useTabsContext } from './Tabs';
import type { TabPanelProps } from './Tabs.types';

// --- Styled ---

const StyledTabPanel = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  outline: none;
`;

// --- Component ---

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  children,
  keepMounted = false,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { activeValue, tabsId } = useTabsContext();
  const isActive = activeValue === value;

  const tabId = `tabs-${tabsId}-tab-${value}`;
  const panelId = `tabs-${tabsId}-panel-${value}`;

  if (!isActive && !keepMounted) {
    return null;
  }

  return (
    <StyledTabPanel
      ref={ref}
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={isActive ? 0 : -1}
      hidden={!isActive || undefined}
      className={className}
      style={{
        ...style,
        ...(isActive ? undefined : { display: 'none' }),
      }}
      data-testid={testId}
      {...rest}
    >
      {children}
    </StyledTabPanel>
  );
};

TabPanel.displayName = 'TabPanel';
