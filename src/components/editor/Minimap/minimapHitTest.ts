import type { MinimapItem } from './Minimap.types';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { WorldRect } from '@/components/primitives/viewport';

/** Distance from point P to line segment A-B (in world units). */
function distancePointToSegment(p: Point2D, a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const ex = p.x - a.x;
    const ey = p.y - a.y;
    return Math.hypot(ex, ey);
  }
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}

/**
 * Hit-test a world point against the item list, returning the topmost
 * (last-drawn) match. `lineToleranceWorld` is the picking radius (world
 * units) used for line items.
 */
export function hitTestItems(
  worldPoint: Point2D,
  items: ReadonlyArray<MinimapItem>,
  lineToleranceWorld: number
): string | null {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    const item = items[i];
    if (!item) continue;
    if (pointHitsItem(worldPoint, item, lineToleranceWorld)) {
      return item.id;
    }
  }
  return null;
}

function pointHitsItem(
  p: Point2D,
  item: MinimapItem,
  lineToleranceWorld: number
): boolean {
  switch (item.type) {
    case 'rect':
      return (
        p.x >= item.x &&
        p.x <= item.x + item.width &&
        p.y >= item.y &&
        p.y <= item.y + item.height
      );
    case 'circle': {
      const dx = p.x - item.cx;
      const dy = p.y - item.cy;
      return dx * dx + dy * dy <= item.r * item.r;
    }
    case 'line':
      return (
        distancePointToSegment(
          p,
          { x: item.x1, y: item.y1 },
          { x: item.x2, y: item.y2 }
        ) <= lineToleranceWorld
      );
    case 'custom':
      return inWorldRect(p, item.bounds);
  }
}

function inWorldRect(p: Point2D, rect: WorldRect): boolean {
  return (
    p.x >= rect.x &&
    p.x <= rect.x + rect.width &&
    p.y >= rect.y &&
    p.y <= rect.y + rect.height
  );
}
