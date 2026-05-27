import type { AssetThumbnailSize } from './AssetBrowser.types';
import type { MarqueeRect } from './AssetBrowserStore';

/** Thumbnail edge length (px) for the named scales. */
export const THUMB_PX: Record<'sm' | 'md' | 'lg', number> = {
  sm: 72,
  md: 104,
  lg: 144,
};

export const CELL_PADDING = 6;
export const LABEL_HEIGHT = 32;
export const GRID_GAP = 8;

export function resolveThumbPx(size: AssetThumbnailSize): number {
  if (typeof size === 'number') return Math.max(32, size);
  return THUMB_PX[size];
}

export function cellWidth(thumbPx: number): number {
  return thumbPx + CELL_PADDING * 2 + 2; // + border
}

export function cellHeight(thumbPx: number): number {
  return thumbPx + CELL_PADDING * 2 + LABEL_HEIGHT + 2;
}

export function rowHeight(thumbPx: number): number {
  return cellHeight(thumbPx) + GRID_GAP;
}

/** How many columns fit in `width` px of usable (padding-excluded) space. */
export function columnsFor(width: number, thumbPx: number): number {
  if (width <= 0) return 1;
  const stride = cellWidth(thumbPx) + GRID_GAP;
  return Math.max(1, Math.floor((width + GRID_GAP) / stride));
}

/** Content-space rectangle of the item at `index` for a given column count. */
export function itemRect(
  index: number,
  columns: number,
  thumbPx: number
): MarqueeRect {
  const cols = Math.max(1, columns);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const stride = cellWidth(thumbPx) + GRID_GAP;
  return {
    x: col * stride,
    y: row * rowHeight(thumbPx),
    width: cellWidth(thumbPx),
    height: cellHeight(thumbPx),
  };
}

export function rectsIntersect(a: MarqueeRect, b: MarqueeRect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** Normalize two content-space points into a positive-size rectangle. */
export function rectFromPoints(
  ax: number,
  ay: number,
  bx: number,
  by: number
): MarqueeRect {
  return {
    x: Math.min(ax, bx),
    y: Math.min(ay, by),
    width: Math.abs(ax - bx),
    height: Math.abs(ay - by),
  };
}
