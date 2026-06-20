'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useEventCallback } from '@/hooks/useEventCallback';

import type React from 'react';

export interface UseListboxNavOptions<T> {
  /** Items rendered in the listbox. The hook tracks navigation by index. */
  items: T[];

  /**
   * Whether a given item should be skipped during navigation and rejected by
   * `selectActive()`.
   */
  isItemDisabled?: (item: T, index: number) => boolean;

  /** Initial active index. Defaults to `-1` (no active item). */
  defaultActiveIndex?: number;

  /**
   * Wrap from last → first (and vice versa) on `next`/`prev`.
   * @default true
   */
  loop?: boolean;

  /**
   * Reset the active index when the items array changes by reference.
   * Useful for filtered listboxes where the previous index would be stale.
   * @default true
   */
  resetOnItemsChange?: boolean;

  /** Called when the active item is committed via `selectActive()`. */
  onSelect?: (item: T, index: number) => void;

  /** Called on `Escape`. */
  onEscape?: () => void;
}

export interface UseListboxNavReturn {
  /** Currently active index, or `-1` when none. */
  activeIndex: number;
  /** Direct setter; the value is not validated. */
  setActiveIndex: (index: number) => void;
  /** Move to the next non-disabled item. */
  next: () => void;
  /** Move to the previous non-disabled item. */
  prev: () => void;
  /** Activate the first non-disabled item. */
  first: () => void;
  /** Activate the last non-disabled item. */
  last: () => void;
  /** Commit the active item via `onSelect`. */
  selectActive: () => void;
  /**
   * Single keyboard handler for ArrowUp/Down/Home/End/Enter/Escape. Returns
   * `true` when the event was handled (and `preventDefault` was called).
   */
  handleKeyDown: (event: KeyboardEvent | React.KeyboardEvent) => boolean;
  /** Snapshot of the navigable indices (non-disabled, in order). */
  navigableIndices: number[];
}

/**
 * Shared keyboard navigation for listbox-like surfaces (Select, MultiSelect,
 * Combobox, CommandPalette). Tracks an `activeIndex`, skips disabled items,
 * and exposes a single `handleKeyDown` covering Arrow / Home / End / Enter /
 * Escape semantics.
 *
 * The hook is purely logical — consumers render the list and bind the handler
 * to an input or the listbox container. Scroll-into-view is the consumer's
 * concern.
 *
 * @example
 * ```tsx
 * const { activeIndex, handleKeyDown } = useListboxNav({
 *   items: filtered,
 *   isItemDisabled: o => o.disabled ?? false,
 *   onSelect: (item) => commit(item),
 *   onEscape: () => close(),
 * });
 * ```
 */
export function useListboxNav<T>(
  options: UseListboxNavOptions<T>
): UseListboxNavReturn {
  const {
    items,
    isItemDisabled,
    defaultActiveIndex = -1,
    loop = true,
    resetOnItemsChange = true,
    onSelect,
    onEscape,
  } = options;

  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

  // Stable refs so handlers don't churn when callers pass inline closures.
  const itemsRef = useRef(items);
  const isItemDisabledRef = useRef(isItemDisabled);
  const onSelectRef = useRef(onSelect);
  const loopRef = useRef(loop);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    isItemDisabledRef.current = isItemDisabled;
  }, [isItemDisabled]);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  // Reset active index when items reference changes (e.g. filter).
  const prevItemsRef = useRef(items);
  useEffect(() => {
    if (!resetOnItemsChange) return;
    if (prevItemsRef.current !== items) {
      setActiveIndex(defaultActiveIndex);
      prevItemsRef.current = items;
    }
  }, [items, resetOnItemsChange, defaultActiveIndex]);

  const getNavigableIndices = useCallback((): number[] => {
    const list = itemsRef.current;
    const disabled = isItemDisabledRef.current;
    if (!disabled) return list.map((_, i) => i);
    const out: number[] = [];
    for (let i = 0; i < list.length; i += 1) {
      const item = list[i] as T;
      if (!disabled(item, i)) out.push(i);
    }
    return out;
  }, []);

  // Reactive navigable-index list for the returned value. Derived from the
  // live props rather than the latest-refs above, which exist only for reads
  // inside the event-time keyboard handlers.
  const navigableIndices = useMemo(() => {
    if (!isItemDisabled) return items.map((_, i) => i);
    const out: number[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i] as T;
      if (!isItemDisabled(item, i)) out.push(i);
    }
    return out;
  }, [items, isItemDisabled]);

  const move = useCallback(
    (direction: 'next' | 'prev' | 'first' | 'last') => {
      const navigable = getNavigableIndices();
      if (navigable.length === 0) {
        setActiveIndex(-1);
        return;
      }

      setActiveIndex(current => {
        const currentNavIdx = navigable.indexOf(current);
        switch (direction) {
          case 'first':
            return navigable[0] ?? -1;
          case 'last':
            return navigable[navigable.length - 1] ?? -1;
          case 'next': {
            if (currentNavIdx === -1) return navigable[0] ?? -1;
            const nextIdx = currentNavIdx + 1;
            if (nextIdx >= navigable.length) {
              return loopRef.current
                ? (navigable[0] ?? -1)
                : (navigable[navigable.length - 1] ?? -1);
            }
            return navigable[nextIdx] ?? -1;
          }
          case 'prev': {
            if (currentNavIdx === -1)
              return navigable[navigable.length - 1] ?? -1;
            const prevIdx = currentNavIdx - 1;
            if (prevIdx < 0) {
              return loopRef.current
                ? (navigable[navigable.length - 1] ?? -1)
                : (navigable[0] ?? -1);
            }
            return navigable[prevIdx] ?? -1;
          }
        }
      });
    },
    [getNavigableIndices]
  );

  const next = useCallback(() => {
    move('next');
  }, [move]);
  const prev = useCallback(() => {
    move('prev');
  }, [move]);
  const first = useCallback(() => {
    move('first');
  }, [move]);
  const last = useCallback(() => {
    move('last');
  }, [move]);

  const selectActive = useCallback(() => {
    const list = itemsRef.current;
    const disabled = isItemDisabledRef.current;
    setActiveIndex(current => {
      if (current < 0 || current >= list.length) return current;
      const item = list[current] as T;
      if (disabled?.(item, current)) return current;
      onSelectRef.current?.(item, current);
      return current;
    });
  }, []);

  // Escape handling via useEventCallback: stable identity (so handleKeyDown
  // does not churn when callers pass an inline onEscape) while always seeing
  // the latest onEscape and reporting whether it actually handled the key.
  const handleEscape = useEventCallback(
    (event: KeyboardEvent | React.KeyboardEvent): boolean => {
      if (!onEscape) return false;
      event.preventDefault();
      onEscape();
      return true;
    }
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent | React.KeyboardEvent): boolean => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          next();
          return true;
        case 'ArrowUp':
          event.preventDefault();
          prev();
          return true;
        case 'Home':
          event.preventDefault();
          first();
          return true;
        case 'End':
          event.preventDefault();
          last();
          return true;
        case 'Enter':
          event.preventDefault();
          selectActive();
          return true;
        case 'Escape':
          return handleEscape(event);
        default:
          return false;
      }
    },
    [next, prev, first, last, selectActive, handleEscape]
  );

  return {
    activeIndex,
    setActiveIndex,
    next,
    prev,
    first,
    last,
    selectActive,
    handleKeyDown,
    navigableIndices,
  };
}
