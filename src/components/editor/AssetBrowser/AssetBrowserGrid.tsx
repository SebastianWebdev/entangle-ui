'use client';

import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { useLatest } from '@/hooks';
import { cx } from '@/utils/cx';
import {
  useAssetBrowserContext,
  useAssetBrowserStore,
  useAssetMarquee,
} from './AssetBrowserContext';
import { AssetBrowserGridItem } from './AssetBrowserGridItem';
import {
  useAssetGridVirtualizer,
  type AssetGridWindow,
} from './useAssetGridVirtualizer';
import { useAssetMarqueeGesture } from './useAssetMarqueeGesture';
import { nextGridIndex } from './assetBrowserKeyboard';
import { GRID_GAP, cellWidth } from './assetBrowserGeometry';
import {
  columnsVar,
  gridGapVar,
  gridScroller,
  gridSizer,
  gridWindow,
  gridFlow,
  cellWidthVar,
  marquee as marqueeClass,
  marqueeHVar,
  marqueeWVar,
  marqueeXVar,
  marqueeYVar,
  offsetYVar,
  totalHeightVar,
} from './AssetBrowser.css';

function MarqueeLayer(): React.ReactElement | null {
  const marquee = useAssetMarquee();
  if (!marquee.active || !marquee.rect) return null;
  return (
    <div
      className={marqueeClass}
      style={assignInlineVars({
        [marqueeXVar]: `${marquee.rect.x}px`,
        [marqueeYVar]: `${marquee.rect.y}px`,
        [marqueeWVar]: `${marquee.rect.width}px`,
        [marqueeHVar]: `${marquee.rect.height}px`,
      })}
    />
  );
}

export function AssetBrowserGrid(): React.ReactElement {
  const ctx = useAssetBrowserContext();
  const store = useAssetBrowserStore();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const items = ctx.displayedItems;
  const count = items.length;
  const thumbPx = ctx.thumbnailSizePx;

  const windowed =
    ctx.virtualized === true ||
    (ctx.virtualized === 'auto' && count > ctx.virtualizationThreshold);

  const win = useAssetGridVirtualizer({
    containerRef: scrollerRef,
    count,
    thumbPx,
    overscanRows: ctx.overscanRows,
    enabled: windowed,
  });

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item, i) => map.set(item.id, i));
    return map;
  }, [items]);

  const scrollIndexIntoView = useCallback(
    (index: number, w: AssetGridWindow): void => {
      const el = scrollerRef.current;
      if (!el) return;
      const row = Math.floor(index / w.columns);
      const top = row * w.rowHeight;
      const bottom = top + w.rowHeight;
      if (top < el.scrollTop) el.scrollTop = top;
      else if (bottom > el.scrollTop + el.clientHeight)
        el.scrollTop = bottom - el.clientHeight;
    },
    []
  );

  // Bridge the imperative `scrollToItem` handle through the store so it works
  // even when the target row is outside the virtualization window.
  const winRef = useLatest(win);
  useLayoutEffect(
    () =>
      store.registerScrollToIndex(index =>
        scrollIndexIntoView(index, winRef.current)
      ),
    [store, winRef, scrollIndexIntoView]
  );

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (count === 0) return;
    const key = e.key;
    // Let Alt+ArrowUp bubble to the root's "go to parent" handler.
    if (e.altKey && key === 'ArrowUp') return;
    const focusedId = store.getFocusedId();
    const current = focusedId ? (indexById.get(focusedId) ?? -1) : -1;
    const multiple = ctx.selectionMode === 'multiple';

    if ((e.ctrlKey || e.metaKey) && (key === 'a' || key === 'A')) {
      e.preventDefault();
      ctx.selectAll();
      return;
    }
    if (key === 'Escape') {
      ctx.clearSelection();
      return;
    }
    if (key === 'Enter') {
      const item = current >= 0 ? items[current] : undefined;
      if (item) {
        e.preventDefault();
        ctx.activateItem(item);
      }
      return;
    }
    if (key === ' ') {
      const item = current >= 0 ? items[current] : undefined;
      if (item) {
        e.preventDefault();
        ctx.toggleSelectId(item.id);
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
      e.preventDefault();
      store.setFocusedId(target.id);
      scrollIndexIntoView(next, win);
      if (ctx.selectionMode !== false) {
        ctx.selectByKeyboard(next, multiple && e.shiftKey);
      }
    }
  };

  const marquee = useAssetMarqueeGesture({
    scrollerRef,
    enabled: ctx.marqueeEnabled,
    items,
    columns: win.columns,
    thumbPx,
    commitMarquee: ctx.commitMarquee,
  });

  const sharedVars = assignInlineVars({
    [columnsVar]: String(win.columns),
    [gridGapVar]: `${GRID_GAP}px`,
    [cellWidthVar]: `${cellWidth(thumbPx)}px`,
  });

  const rendered: React.ReactNode[] = [];
  for (let i = win.startIndex; i < win.endIndex; i += 1) {
    const item = items[i];
    if (!item) continue;
    rendered.push(<AssetBrowserGridItem key={item.id} item={item} index={i} />);
  }

  return (
    <div
      ref={scrollerRef}
      className={gridScroller}
      role="grid"
      aria-label="Assets"
      aria-multiselectable={ctx.selectionMode === 'multiple'}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={marquee.onPointerDown}
      onPointerMove={marquee.onPointerMove}
      onPointerUp={marquee.onPointerUp}
    >
      {windowed ? (
        <div
          className={gridSizer}
          style={assignInlineVars({
            [totalHeightVar]: `${win.totalHeight}px`,
          })}
        >
          <MarqueeLayer />
          <div
            className={cx(gridWindow)}
            style={{
              ...sharedVars,
              ...assignInlineVars({ [offsetYVar]: `${win.offsetY}px` }),
            }}
            role="presentation"
          >
            {rendered}
          </div>
        </div>
      ) : (
        <>
          <MarqueeLayer />
          <div className={gridFlow} style={sharedVars} role="presentation">
            {rendered}
          </div>
        </>
      )}
    </div>
  );
}
