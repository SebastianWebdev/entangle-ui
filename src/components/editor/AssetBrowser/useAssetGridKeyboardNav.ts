'use client';

import {
  useEffectEvent,
  useMemo,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import type { AssetItem } from './AssetBrowser.types';
import type { AssetBrowserStore } from './AssetBrowserStore';
import { nextGridIndex } from './assetBrowserKeyboard';
import type { AssetGridWindow } from './useAssetGridVirtualizer';

export interface UseAssetGridKeyboardNavOptions {
  store: AssetBrowserStore;
  items: readonly AssetItem[];
  /** Current windowed layout (columns, rowHeight). */
  win: AssetGridWindow;
  /** The grid scroller — used to derive `rowsPerPage` from clientHeight. */
  scrollerRef: RefObject<HTMLElement | null>;
  selectionMode: 'single' | 'multiple' | false;
  selectAll: () => void;
  clearSelection: () => void;
  activateItem: (item: AssetItem) => void;
  toggleSelectId: (id: string) => void;
  selectByKeyboard: (index: number, extend: boolean) => void;
  /** Bring the row containing the given item index into view. */
  scrollIndexIntoView: (index: number, w: AssetGridWindow) => void;
}

export interface AssetGridKeyboardNav {
  onKeyDown: (event: KeyboardEvent) => void;
}

/**
 * 2D grid keyboard navigation for `AssetBrowserGrid`. Handles arrows, Home/End,
 * PageUp/PageDown, Enter (activate), Space (toggle), Ctrl/Cmd+A (select all),
 * Escape (clear). Returns a stable `onKeyDown` (`useEffectEvent`).
 *
 * Alt+ArrowUp is intentionally **not** handled here — it bubbles to the root's
 * "go to parent" handler when `history` is on.
 */
export function useAssetGridKeyboardNav(
  options: UseAssetGridKeyboardNavOptions
): AssetGridKeyboardNav {
  const {
    store,
    items,
    win,
    scrollerRef,
    selectionMode,
    selectAll,
    clearSelection,
    activateItem,
    toggleSelectId,
    selectByKeyboard,
    scrollIndexIntoView,
  } = options;

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item, i) => map.set(item.id, i));
    return map;
  }, [items]);

  const onKeyDown = useEffectEvent((event: KeyboardEvent): void => {
    const count = items.length;
    if (count === 0) return;
    const key = event.key;
    // Let Alt+ArrowUp bubble to the root's "go to parent" handler.
    if (event.altKey && key === 'ArrowUp') return;
    const focusedId = store.getFocusedId();
    const current = focusedId ? (indexById.get(focusedId) ?? -1) : -1;
    const multiple = selectionMode === 'multiple';

    if ((event.ctrlKey || event.metaKey) && (key === 'a' || key === 'A')) {
      event.preventDefault();
      selectAll();
      return;
    }
    if (key === 'Escape') {
      clearSelection();
      return;
    }
    if (key === 'Enter') {
      const item = current >= 0 ? items[current] : undefined;
      if (item) {
        event.preventDefault();
        activateItem(item);
      }
      return;
    }
    if (key === ' ') {
      const item = current >= 0 ? items[current] : undefined;
      if (item) {
        event.preventDefault();
        toggleSelectId(item.id);
      }
      return;
    }

    const rowsPerPage = Math.max(
      1,
      Math.floor(
        (scrollerRef.current?.clientHeight ?? win.rowHeight) / win.rowHeight
      )
    );
    const next = nextGridIndex(current, key, {
      columns: win.columns,
      count,
      rowsPerPage,
    });
    const target = next >= 0 ? items[next] : undefined;
    if (next !== current && target) {
      event.preventDefault();
      store.setFocusedId(target.id);
      scrollIndexIntoView(next, win);
      if (selectionMode !== false) {
        selectByKeyboard(next, multiple && event.shiftKey);
      }
    }
  });

  return { onKeyDown };
}
