import type { MinimapItem } from './Minimap.types';
import type { WorldRect } from '@/components/primitives/viewport';

/**
 * Compute the tight axis-aligned bounding box of a set of minimap items,
 * with optional uniform padding (in world units) on every side.
 *
 * An empty input returns a zero-area rect at the origin so the minimap
 * can still render a meaningful surface.
 */
export function computeBoundsFromItems(
  items: ReadonlyArray<MinimapItem>,
  padding: number = 0
): WorldRect {
  if (items.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const item of items) {
    let l = 0;
    let t = 0;
    let r = 0;
    let b = 0;
    switch (item.type) {
      case 'rect':
        l = item.x;
        t = item.y;
        r = item.x + item.width;
        b = item.y + item.height;
        break;
      case 'circle':
        l = item.cx - item.r;
        t = item.cy - item.r;
        r = item.cx + item.r;
        b = item.cy + item.r;
        break;
      case 'line':
        l = Math.min(item.x1, item.x2);
        t = Math.min(item.y1, item.y2);
        r = Math.max(item.x1, item.x2);
        b = Math.max(item.y1, item.y2);
        break;
      case 'custom':
        l = item.bounds.x;
        t = item.bounds.y;
        r = item.bounds.x + item.bounds.width;
        b = item.bounds.y + item.bounds.height;
        break;
    }
    if (l < minX) minX = l;
    if (t < minY) minY = t;
    if (r > maxX) maxX = r;
    if (b > maxY) maxY = b;
  }

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + 2 * padding,
    height: maxY - minY + 2 * padding,
  };
}
