import React, { useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { useTabsContext } from './Tabs';
import type { TabListProps, TabsVariant } from './Tabs.types';

// --- Styled ---

interface StyledTabListProps {
  $orientation: 'horizontal' | 'vertical';
  $variant: TabsVariant;
  $fullWidth: boolean;
}

const StyledTabList = styled.div<StyledTabListProps>`
  display: flex;
  flex-direction: ${props =>
    props.$orientation === 'vertical' ? 'column' : 'row'};
  overflow-x: ${props =>
    props.$orientation === 'horizontal' ? 'auto' : 'visible'};
  overflow-y: ${props =>
    props.$orientation === 'vertical' ? 'auto' : 'visible'};
  flex-shrink: 0;

  /* Hide scrollbar */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  /* Variant-specific styles */
  ${props => {
    const { colors } = props.theme;

    switch (props.$variant) {
      case 'underline':
        return props.$orientation === 'vertical'
          ? `border-right: 1px solid ${colors.border.default};`
          : `border-bottom: 1px solid ${colors.border.default};`;
      case 'enclosed':
        return props.$orientation === 'vertical'
          ? `border-right: 1px solid ${colors.border.default};`
          : `border-bottom: 1px solid ${colors.border.default};`;
      case 'pills':
        return `
          gap: ${props.theme.spacing.xs}px;
          padding: ${props.theme.spacing.xs}px;
        `;
      default:
        return '';
    }
  }}
`;

// --- Component ---

export const TabList: React.FC<TabListProps> = ({
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { orientation, variant, fullWidth } = useTabsContext();
  const listRef = useRef<HTMLDivElement | null>(null);

  const setListRef = useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const list = listRef.current;
      if (!list) return;

      const tabs = Array.from(
        list.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      );
      const currentIndex = tabs.indexOf(e.target as HTMLButtonElement);
      if (currentIndex === -1) return;

      const isHorizontal = orientation === 'horizontal';
      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

      let nextIndex: number | null = null;

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          nextIndex = currentIndex + 1;
          if (nextIndex >= tabs.length) nextIndex = 0;
          break;
        case prevKey:
          e.preventDefault();
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) nextIndex = tabs.length - 1;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = tabs.length - 1;
          break;
      }

      if (nextIndex !== null) {
        tabs[nextIndex]?.focus();
      }
    },
    [orientation]
  );

  return (
    <StyledTabList
      ref={setListRef}
      role="tablist"
      aria-orientation={orientation}
      $orientation={orientation}
      $variant={variant}
      $fullWidth={fullWidth}
      className={className}
      style={style}
      data-testid={testId}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </StyledTabList>
  );
};

TabList.displayName = 'TabList';
