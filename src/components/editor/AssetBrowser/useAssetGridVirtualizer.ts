'use client';

import { useEffect, useMemo, useState } from 'react';

import { useResizeObserver } from '@/hooks';

import { columnsFor, rowHeight as rowHeightFor } from './assetBrowserGeometry';

import type { RefObject } from 'react';

export interface UseAssetGridVirtualizerOptions {
  containerRef: RefObject<HTMLElement | null>;
  count: number;
  thumbPx: number;
  overscanRows: number;
  /** When false, the window spans the whole list (no virtualization). */
  enabled: boolean;
}

export interface AssetGridWindow {
  columns: number;
  rowHeight: number;
  totalRows: number;
  totalHeight: number;
  /** First rendered item index (row-aligned). */
  startIndex: number;
  /** One past the last rendered item index. */
  endIndex: number;
  /** Pixel offset of the rendered window from the top. */
  offsetY: number;
  /** Whether windowing is currently active. */
  windowed: boolean;
}

/**
 * Windowed grid math. Tracks container width + height via `useResizeObserver`
 * and scroll position via a throttled (rAF) scroll listener, then derives the
 * row-aligned slice of items to render.
 *
 * When `enabled` is false it still reports `columns`/`rowHeight` (needed for
 * keyboard navigation) but renders the whole list.
 */
export function useAssetGridVirtualizer(
  options: UseAssetGridVirtualizerOptions
): AssetGridWindow {
  const { containerRef, count, thumbPx, overscanRows, enabled } = options;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [scrollTop, setScrollTop] = useState(0);

  useResizeObserver(containerRef, entry => {
    setSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    });
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;
    let raf = 0;
    const onScroll = (): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrollTop(el.scrollTop);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [containerRef, enabled]);

  return useMemo<AssetGridWindow>(() => {
    const columns = columnsFor(size.width, thumbPx);
    const rh = rowHeightFor(thumbPx);
    const totalRows = Math.ceil(count / columns);
    const totalHeight = totalRows * rh;

    if (!enabled) {
      return {
        columns,
        rowHeight: rh,
        totalRows,
        totalHeight,
        startIndex: 0,
        endIndex: count,
        offsetY: 0,
        windowed: false,
      };
    }

    const startRow = Math.max(0, Math.floor(scrollTop / rh) - overscanRows);
    const viewportRows = Math.ceil((size.height || rh) / rh);
    const endRow = Math.min(
      totalRows,
      startRow + viewportRows + overscanRows * 2
    );

    return {
      columns,
      rowHeight: rh,
      totalRows,
      totalHeight,
      startIndex: startRow * columns,
      endIndex: Math.min(count, endRow * columns),
      offsetY: startRow * rh,
      windowed: true,
    };
  }, [
    size.width,
    size.height,
    scrollTop,
    count,
    thumbPx,
    overscanRows,
    enabled,
  ]);
}
