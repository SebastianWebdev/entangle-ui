import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { ViewportTransform } from './Viewport.types';

/**
 * Convert a world-space point to a screen-space (CSS-pixel) point.
 *
 * Uses the canonical transform: `screenPos = worldPos * zoom + (x, y)`.
 */
export function worldToScreen(
  point: Point2D,
  transform: ViewportTransform
): Point2D {
  return {
    x: point.x * transform.zoom + transform.x,
    y: point.y * transform.zoom + transform.y,
  };
}

/**
 * Convert a screen-space (CSS-pixel) point to a world-space point.
 *
 * Inverse of `worldToScreen`.
 */
export function screenToWorld(
  point: Point2D,
  transform: ViewportTransform
): Point2D {
  const z = transform.zoom || 1;
  return {
    x: (point.x - transform.x) / z,
    y: (point.y - transform.y) / z,
  };
}

/**
 * Compute the screen-space (CSS-pixel) position of a pointer event relative
 * to a viewport element.
 */
export function getViewportPointerPosition(
  event: { clientX: number; clientY: number },
  viewport: HTMLElement
): Point2D {
  const rect = viewport.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
