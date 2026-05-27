'use client';

import React, { useMemo, useRef } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { cx } from '@/utils/cx';
import {
  useAssetBrowserContext,
  useAssetBrowserStore,
  useAssetMarquee,
} from './AssetBrowserContext';
import { AssetBrowserGridItem } from './AssetBrowserGridItem';
import { useAssetGridVirtualizer } from './useAssetGridVirtualizer';
import { nextGridIndex } from './assetBrowserKeyboard';
import {
  itemRect,
  rectFromPoints,
  rectsIntersect,
  GRID_GAP,
  cellWidth,
} from './assetBrowserGeometry';
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

interface MarqueeDrag {
  startX: number;
  startY: number;
  additive: boolean;
  moved: boolean;
}

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
  const dragRef = useRef<MarqueeDrag | null>(null);
  const rafRef = useRef(0);

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

  const scrollRowIntoView = (index: number): void => {
    const el = scrollerRef.current;
    if (!el) return;
    const row = Math.floor(index / win.columns);
    const top = row * win.rowHeight;
    const bottom = top + win.rowHeight;
    if (top < el.scrollTop) el.scrollTop = top;
    else if (bottom > el.scrollTop + el.clientHeight)
      el.scrollTop = bottom - el.clientHeight;
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (count === 0) return;
    const key = e.key;
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
      scrollRowIntoView(next);
      if (ctx.selectionMode !== false) {
        ctx.selectByKeyboard(next, multiple && e.shiftKey);
      }
    }
  };

  const contentPoint = (e: React.PointerEvent): { x: number; y: number } => {
    const el = scrollerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: e.clientX - rect.left + el.scrollLeft,
      y: e.clientY - rect.top + el.scrollTop,
    };
  };

  const marqueeEnabled = ctx.selectionMode === 'multiple';

  const handlePointerDown = (e: React.PointerEvent): void => {
    if (e.button !== 0 || !marqueeEnabled) return;
    if (e.target !== e.currentTarget) return; // started on an item, not empty space
    const p = contentPoint(e);
    dragRef.current = {
      startX: p.x,
      startY: p.y,
      additive: e.ctrlKey || e.metaKey,
      moved: false,
    };
    scrollerRef.current?.setPointerCapture(e.pointerId);
    store.setMarquee({
      active: true,
      rect: { x: p.x, y: p.y, width: 0, height: 0 },
      additive: dragRef.current.additive,
    });
  };

  const handlePointerMove = (e: React.PointerEvent): void => {
    const drag = dragRef.current;
    if (!drag) return;
    drag.moved = true;
    cancelAnimationFrame(rafRef.current);
    const p = contentPoint(e);
    rafRef.current = requestAnimationFrame(() => {
      store.setMarquee({
        active: true,
        rect: rectFromPoints(drag.startX, drag.startY, p.x, p.y),
        additive: drag.additive,
      });
    });
  };

  const handlePointerUp = (e: React.PointerEvent): void => {
    const drag = dragRef.current;
    if (!drag) return;
    cancelAnimationFrame(rafRef.current);
    dragRef.current = null;
    scrollerRef.current?.releasePointerCapture(e.pointerId);
    const p = contentPoint(e);
    const rect = rectFromPoints(drag.startX, drag.startY, p.x, p.y);
    const ids: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const item = items[i];
      if (!item || item.selectable === false) continue;
      if (rectsIntersect(rect, itemRect(i, win.columns, thumbPx))) {
        ids.push(item.id);
      }
    }
    ctx.commitMarquee(ids, drag.additive);
    store.clearMarquee();
  };

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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
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
