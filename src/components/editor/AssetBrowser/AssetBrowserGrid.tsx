'use client';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from 'react';

import { useLatest } from '@/hooks';

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
import {
  useAssetBrowserContext,
  useAssetBrowserStore,
  useAssetMarquee,
} from './AssetBrowserContext';
import { GRID_GAP, cellDomId, cellWidth } from './assetBrowserGeometry';
import { AssetBrowserGridItem } from './AssetBrowserGridItem';
import { useAssetGridKeyboardNav } from './useAssetGridKeyboardNav';
import { useAssetGridVirtualizer } from './useAssetGridVirtualizer';
import { useAssetMarqueeGesture } from './useAssetMarqueeGesture';

import type { AssetGridWindow } from './useAssetGridVirtualizer';

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
  const gridId = useId();

  const items = ctx.displayedItems;
  const count = items.length;
  const thumbPx = ctx.thumbnailSizePx;

  // Mirror the store's roving focus onto the grid's `aria-activedescendant`
  // imperatively, so a screen reader announces the focused cell without us
  // re-rendering the whole grid on every arrow-key (the per-id focus slices keep
  // re-renders to the two affected cells). The matching cell `id` is built from
  // the same `gridId` in AssetBrowserGridItem via `cellDomId`.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const apply = (): void => {
      const focusedId = store.getFocusedId();
      if (focusedId === null) el.removeAttribute('aria-activedescendant');
      else
        el.setAttribute('aria-activedescendant', cellDomId(gridId, focusedId));
    };
    apply();
    return store.subscribeFocus(apply);
  }, [store, gridId]);

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
      store.registerScrollToIndex(index => {
        scrollIndexIntoView(index, winRef.current);
      }),
    [store, winRef, scrollIndexIntoView]
  );

  const keyboard = useAssetGridKeyboardNav({
    store,
    items,
    win,
    scrollerRef,
    selectionMode: ctx.selectionMode,
    selectAll: ctx.selectAll,
    clearSelection: ctx.clearSelection,
    activateItem: ctx.activateItem,
    toggleSelectId: ctx.toggleSelectId,
    selectByKeyboard: ctx.selectByKeyboard,
    scrollIndexIntoView,
    mutations: ctx.mutations,
  });

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
    rendered.push(
      <AssetBrowserGridItem
        key={item.id}
        item={item}
        index={i}
        gridId={gridId}
        columns={win.columns}
      />
    );
  }

  return (
    <div
      ref={scrollerRef}
      className={gridScroller}
      role="grid"
      aria-label={ctx.labels.gridAria}
      aria-multiselectable={ctx.selectionMode === 'multiple'}
      aria-rowcount={win.totalRows}
      aria-colcount={win.columns}
      tabIndex={0}
      onKeyDown={keyboard.onKeyDown}
      onPointerDown={marquee.onPointerDown}
      onPointerMove={marquee.onPointerMove}
      onPointerUp={marquee.onPointerUp}
      onPointerCancel={marquee.onPointerCancel}
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
            className={gridWindow}
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
