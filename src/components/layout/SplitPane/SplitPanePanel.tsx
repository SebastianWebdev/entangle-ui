'use client';

import React from 'react';
import type { SplitPanePanelProps } from './SplitPane.types';
import { cx } from '@/utils/cx';
import { panelStyle } from './SplitPane.css';

/**
 * A panel within a SplitPane layout.
 *
 * Simple wrapper that renders its children with `overflow: auto`.
 * The parent SplitPane manages its sizing.
 *
 * @example
 * ```tsx
 * <SplitPane>
 *   <SplitPanePanel>Left content</SplitPanePanel>
 *   <SplitPanePanel>Right content</SplitPanePanel>
 * </SplitPane>
 * ```
 */
export const SplitPanePanel: React.FC<SplitPanePanelProps> = ({
  children,
  className,
  testId,
  style,
  ref,
  ...htmlProps
}) => {
  return (
    <div
      ref={ref}
      className={cx(panelStyle, className)}
      data-testid={testId}
      data-splitpane-panel=""
      style={style}
      {...htmlProps}
    >
      {children}
    </div>
  );
};

SplitPanePanel.displayName = 'SplitPanePanel';
