'use client';

import React, { useCallback, useRef } from 'react';

import { cx } from '@/utils/cx';

import { useTabsContext } from './Tabs';
import { tabListRecipe } from './Tabs.css';

import type { TabListProps } from './Tabs.types';

// --- Component ---

export const TabList: React.FC<TabListProps> = ({
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { orientation, variant, pillsFrame } = useTabsContext();
  const listRef = useRef<HTMLDivElement | null>(null);

  const setListRef = useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
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
    <div
      ref={setListRef}
      role="tablist"
      // Roving tabindex lives on the individual tabs; the list itself is only
      // focusable programmatically while it manages arrow-key navigation.
      tabIndex={-1}
      aria-orientation={orientation}
      className={cx(
        tabListRecipe({ orientation, variant, pillsFrame }),
        className
      )}
      style={style}
      data-testid={testId}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </div>
  );
};

TabList.displayName = 'TabList';
