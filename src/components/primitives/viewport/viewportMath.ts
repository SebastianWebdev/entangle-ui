import { clamp } from '@/utils/mathUtils';

import type {
  ViewportSize,
  ViewportTransform,
  WorldRect,
} from './Viewport.types';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';

interface ZoomLimits {
  minZoom: number;
  maxZoom: number;
}

/**
 * Compute a transform that fits `bounds` (in world coordinates) into the
 * viewport `size`, with optional uniform inner `padding` in screen pixels.
 *
 * The resulting transform preserves aspect ratio (uniform zoom on both axes)
 * and centers the content within the viewport.
 */
export function computeFitTransform(
  bounds: WorldRect,
  size: ViewportSize,
  padding: number,
  limits: ZoomLimits
): ViewportTransform {
  const innerW = Math.max(1, size.width - padding * 2);
  const innerH = Math.max(1, size.height - padding * 2);

  // Degenerate bounds — fall back to identity scale, center on bounds origin
  const w = bounds.width > 0 ? bounds.width : 1;
  const h = bounds.height > 0 ? bounds.height : 1;

  const zoomX = innerW / w;
  const zoomY = innerH / h;
  const zoom = clamp(Math.min(zoomX, zoomY), limits.minZoom, limits.maxZoom);

  // Center of world bounds maps to center of viewport
  const worldCx = bounds.x + bounds.width / 2;
  const worldCy = bounds.y + bounds.height / 2;
  const screenCx = size.width / 2;
  const screenCy = size.height / 2;

  return {
    x: screenCx - worldCx * zoom,
    y: screenCy - worldCy * zoom,
    zoom,
  };
}

/**
 * Compute a transform that centers `point` (world coordinates) in the
 * viewport, optionally setting a new zoom.
 */
export function computeCenterTransform(
  point: Point2D,
  size: ViewportSize,
  current: ViewportTransform,
  limits: ZoomLimits,
  nextZoom?: number
): ViewportTransform {
  const zoom = clamp(nextZoom ?? current.zoom, limits.minZoom, limits.maxZoom);
  return {
    x: size.width / 2 - point.x * zoom,
    y: size.height / 2 - point.y * zoom,
    zoom,
  };
}

/**
 * Compute the new transform for a "zoom toward pivot" gesture.
 *
 * The world point currently under `pivot` (screen pixels) stays under
 * the pivot after the zoom change.
 */
export function computeZoomTowardPivot(
  pivot: Point2D,
  factor: number,
  current: ViewportTransform,
  limits: ZoomLimits
): ViewportTransform {
  const nextZoom = clamp(current.zoom * factor, limits.minZoom, limits.maxZoom);
  // World position under pivot before zoom
  const worldX = (pivot.x - current.x) / (current.zoom || 1);
  const worldY = (pivot.y - current.y) / (current.zoom || 1);
  // Keep world point under pivot after zoom
  return {
    x: pivot.x - worldX * nextZoom,
    y: pivot.y - worldY * nextZoom,
    zoom: nextZoom,
  };
}

/**
 * Normalize a rectangle so that width and height are non-negative,
 * adjusting the origin accordingly. Useful for marquee selection
 * where the user may drag in any direction.
 */
export function normalizeRect(rect: WorldRect): WorldRect {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x;
  const y = rect.height < 0 ? rect.y + rect.height : rect.y;
  return {
    x,
    y,
    width: Math.abs(rect.width),
    height: Math.abs(rect.height),
  };
}
