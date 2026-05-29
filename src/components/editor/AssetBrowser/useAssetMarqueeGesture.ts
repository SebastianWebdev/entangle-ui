'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useLatest } from '@/hooks';

import { useAssetBrowserStore } from './AssetBrowserContext';
import {
  itemRect,
  rectFromPoints,
  rectsIntersect,
} from './assetBrowserGeometry';

import type { AssetItem } from './AssetBrowser.types';
import type { PointerEvent, RefObject } from 'react';

export interface UseAssetMarqueeGestureOptions {
  /** The scroll container — also the pointer-capture target and coordinate origin. */
  scrollerRef: RefObject<HTMLElement | null>;
  /** When false, pointer-down is ignored. */
  enabled: boolean;
  /** Currently displayed items, in display order. */
  items: readonly AssetItem[];
  /** Current grid column count (from the virtualizer). */
  columns: number;
  /** Current thumbnail pixel size. */
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
 * Handlers have stable identities (`useCallback`) and read the latest props
 * through `useLatest` refs, matching `component-patterns.md` rules #3/#11.
 */
export function useAssetMarqueeGesture(
  options: UseAssetMarqueeGestureOptions
): AssetMarqueeGestureHandlers {
  const { scrollerRef, enabled, items, columns, thumbPx, commitMarquee } =
    options;
  const store = useAssetBrowserStore();

  const dragRef = useRef<MarqueeDrag | null>(null);
  const rafRef = useRef(0);

  const enabledRef = useLatest(enabled);
  const itemsRef = useLatest(items);
  const columnsRef = useLatest(columns);
  const thumbPxRef = useLatest(thumbPx);
  const commitMarqueeRef = useLatest(commitMarquee);

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
    [store, scrollerRef, contentPoint, enabledRef]
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
    [store, contentPoint]
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
      const ids: string[] = [];
      const currentItems = itemsRef.current;
      for (let i = 0; i < currentItems.length; i += 1) {
        const item = currentItems[i];
        if (!item || item.selectable === false) continue;
        if (
          rectsIntersect(
            rect,
            itemRect(i, columnsRef.current, thumbPxRef.current)
          )
        ) {
          ids.push(item.id);
        }
      }
      commitMarqueeRef.current(ids, drag.additive);
      store.clearMarquee();
    },
    [
      store,
      scrollerRef,
      contentPoint,
      itemsRef,
      columnsRef,
      thumbPxRef,
      commitMarqueeRef,
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
