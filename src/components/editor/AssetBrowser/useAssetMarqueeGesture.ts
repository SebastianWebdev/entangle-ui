'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent,
  type RefObject,
} from 'react';
import { useLatest } from '@/hooks';
import type { AssetItem } from './AssetBrowser.types';
import { useAssetBrowserStore } from './AssetBrowserContext';
import {
  itemRect,
  rectFromPoints,
  rectsIntersect,
} from './assetBrowserGeometry';

export interface UseAssetMarqueeGestureOptions {
  /** The scroll container — also the pointer-capture target and coordinate origin. */
  scrollerRef: RefObject<HTMLElement | null>;
  /** When false, pointer-down is ignored. Live (read at event time). */
  enabled: boolean;
  /** Currently displayed items, in display order. Live. */
  items: readonly AssetItem[];
  /** Current grid column count (from the virtualizer). Live. */
  columns: number;
  /** Current thumbnail pixel size. Live. */
  thumbPx: number;
  /** Called once on pointer-up with the items that intersect the marquee rect. */
  commitMarquee: (ids: string[], additive: boolean) => void;
}

export interface AssetMarqueeGestureHandlers {
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
}

interface MarqueeDrag {
  startX: number;
  startY: number;
  additive: boolean;
  moved: boolean;
}

/**
 * Pointer-driven rubber-band selection for the grid. The active rect lives in
 * the AssetBrowser store (so the marquee overlay can subscribe via its own
 * slice), while pointer-move updates are RAF-throttled. The hit-test runs once
 * on pointer-up and reports through `commitMarquee`.
 *
 * Live props (`items`, `columns`, `thumbPx`, `commitMarquee`, `enabled`) are
 * read through `useLatest` so the returned handlers keep stable identity.
 */
export function useAssetMarqueeGesture(
  options: UseAssetMarqueeGestureOptions
): AssetMarqueeGestureHandlers {
  const { scrollerRef } = options;
  const store = useAssetBrowserStore();

  const enabledRef = useLatest(options.enabled);
  const itemsRef = useLatest(options.items);
  const columnsRef = useLatest(options.columns);
  const thumbPxRef = useLatest(options.thumbPx);
  const commitMarqueeRef = useLatest(options.commitMarquee);

  const dragRef = useRef<MarqueeDrag | null>(null);
  const rafRef = useRef(0);

  const contentPoint = useCallback(
    (event: PointerEvent): { x: number; y: number } => {
      const el = scrollerRef.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      return {
        x: event.clientX - rect.left + el.scrollLeft,
        y: event.clientY - rect.top + el.scrollTop,
      };
    },
    [scrollerRef]
  );

  const onPointerDown = useCallback(
    (event: PointerEvent): void => {
      if (event.button !== 0 || !enabledRef.current) return;
      // Started on an item, not empty space — let the item handle the click.
      if (event.target !== event.currentTarget) return;
      const p = contentPoint(event);
      dragRef.current = {
        startX: p.x,
        startY: p.y,
        additive: event.ctrlKey || event.metaKey,
        moved: false,
      };
      scrollerRef.current?.setPointerCapture(event.pointerId);
      store.setMarquee({
        active: true,
        rect: { x: p.x, y: p.y, width: 0, height: 0 },
        additive: dragRef.current.additive,
      });
    },
    [contentPoint, enabledRef, scrollerRef, store]
  );

  const onPointerMove = useCallback(
    (event: PointerEvent): void => {
      const drag = dragRef.current;
      if (!drag) return;
      drag.moved = true;
      cancelAnimationFrame(rafRef.current);
      const p = contentPoint(event);
      rafRef.current = requestAnimationFrame(() => {
        store.setMarquee({
          active: true,
          rect: rectFromPoints(drag.startX, drag.startY, p.x, p.y),
          additive: drag.additive,
        });
      });
    },
    [contentPoint, store]
  );

  const onPointerUp = useCallback(
    (event: PointerEvent): void => {
      const drag = dragRef.current;
      if (!drag) return;
      cancelAnimationFrame(rafRef.current);
      dragRef.current = null;
      scrollerRef.current?.releasePointerCapture(event.pointerId);
      const p = contentPoint(event);
      const rect = rectFromPoints(drag.startX, drag.startY, p.x, p.y);
      const items = itemsRef.current;
      const columns = columnsRef.current;
      const thumbPx = thumbPxRef.current;
      const ids: string[] = [];
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (!item || item.selectable === false) continue;
        if (rectsIntersect(rect, itemRect(i, columns, thumbPx))) {
          ids.push(item.id);
        }
      }
      commitMarqueeRef.current(ids, drag.additive);
      store.clearMarquee();
    },
    [
      contentPoint,
      scrollerRef,
      itemsRef,
      columnsRef,
      thumbPxRef,
      commitMarqueeRef,
      store,
    ]
  );

  // Cancel any in-flight RAF on unmount.
  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return { onPointerDown, onPointerMove, onPointerUp };
}
