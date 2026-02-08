import React from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import type { SplitPanePanelProps } from './SplitPane.types';
import type { Theme } from '@/theme/types';

interface StyledPanelProps {
  $css?: SplitPanePanelProps['css'];
}

const StyledPanel = styled.div<StyledPanelProps>`
  overflow: auto;
  ${props => processCss(props.$css, props.theme as Theme)}
`;

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
  css,
  style,
  ref,
  ...htmlProps
}) => {
  return (
    <StyledPanel
      ref={ref}
      className={className}
      data-testid={testId}
      data-splitpane-panel=""
      $css={css}
      style={style}
      {...htmlProps}
    >
      {children}
    </StyledPanel>
  );
};

SplitPanePanel.displayName = 'SplitPanePanel';
