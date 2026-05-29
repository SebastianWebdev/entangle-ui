import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type {
  ViewportTransform,
  ViewportSize,
  WorldRect,
} from '@/components/primitives/viewport';

/** Axis-aligned rectangle in minimap (CSS-pixel) coordinates. */
export interface MinimapScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Derive minimap height from a width + `worldBounds` aspect ratio,
 * clamped to `[minHeight, maxHeight]`.
 *
 * When `worldBounds` is zero-area, falls back to `minHeight` (the minimap
 * still renders a usable surface so users see the viewport rect).
 */
export function computeMinimapHeight(
  width: number,
  worldBounds: WorldRect,
  minHeight: number,
  maxHeight: number
): number {
  if (worldBounds.width <= 0 || worldBounds.height <= 0) {
    return minHeight;
  }
  const ratio = worldBounds.height / worldBounds.width;
  const raw = width * ratio;
  return Math.min(maxHeight, Math.max(minHeight, raw));
}

/**
 * Uniform scale that fits `worldBounds` inside `minimapSize`, preserving
 * the world aspect ratio. If the minimap was clamped (e.g. height hit
 * `maxHeight`), the resulting content is letterboxed.
 */
export function computeMinimapScale(
  worldBounds: WorldRect,
  minimapSize: ViewportSize
): number {
  if (worldBounds.width <= 0 || worldBounds.height <= 0) {
    return 1;
  }
  return Math.min(
    minimapSize.width / worldBounds.width,
    minimapSize.height / worldBounds.height
  );
}

/** Letterbox offset (each side) when world and minimap aspect ratios differ. */
export function computeMinimapOffset(
  worldBounds: WorldRect,
  minimapSize: ViewportSize,
  scale: number
): Point2D {
  const usedW = worldBounds.width * scale;
  const usedH = worldBounds.height * scale;
  return {
    x: (minimapSize.width - usedW) / 2,
    y: (minimapSize.height - usedH) / 2,
  };
}

/** Map a world point to minimap CSS pixel coordinates. */
export function worldToMinimap(
  point: Point2D,
  worldBounds: WorldRect,
  minimapSize: ViewportSize
): Point2D {
  const scale = computeMinimapScale(worldBounds, minimapSize);
  const offset = computeMinimapOffset(worldBounds, minimapSize, scale);
  return {
    x: offset.x + (point.x - worldBounds.x) * scale,
    y: offset.y + (point.y - worldBounds.y) * scale,
  };
}

/** Inverse of `worldToMinimap`: minimap CSS point → world point. */
export function minimapToWorld(
  point: Point2D,
  worldBounds: WorldRect,
  minimapSize: ViewportSize
): Point2D {
  // Zero-area bounds have no meaningful inverse mapping — collapse everything
  // to the bounds origin so navigation still emits a stable point.
  if (worldBounds.width <= 0 || worldBounds.height <= 0) {
    return { x: worldBounds.x, y: worldBounds.y };
  }
  const scale = computeMinimapScale(worldBounds, minimapSize);
  const offset = computeMinimapOffset(worldBounds, minimapSize, scale);
  return {
    x: worldBounds.x + (point.x - offset.x) / scale,
    y: worldBounds.y + (point.y - offset.y) / scale,
  };
}

/**
 * Viewport rect (in minimap CSS px) for a given main-viewport transform
 * and size. The world-space region visible in the main viewport is at
 * `(-tx / zoom, -ty / zoom)` with size `viewportSize / zoom`.
 */
export function getViewportRectOnMinimap(
  transform: ViewportTransform,
  viewportSize: ViewportSize,
  worldBounds: WorldRect,
  minimapSize: ViewportSize
): MinimapScreenRect {
  const scale = computeMinimapScale(worldBounds, minimapSize);
  const offset = computeMinimapOffset(worldBounds, minimapSize, scale);
  const zoom = transform.zoom === 0 ? 1 : transform.zoom;

  const worldX = -transform.x / zoom;
  const worldY = -transform.y / zoom;
  const worldW = viewportSize.width / zoom;
  const worldH = viewportSize.height / zoom;

  return {
    x: offset.x + (worldX - worldBounds.x) * scale,
    y: offset.y + (worldY - worldBounds.y) * scale,
    width: worldW * scale,
    height: worldH * scale,
  };
}

/** Current world-space center of the main viewport. */
export function getViewportCenterWorld(
  transform: ViewportTransform,
  viewportSize: ViewportSize
): Point2D {
  const zoom = transform.zoom === 0 ? 1 : transform.zoom;
  return {
    x: (-transform.x + viewportSize.width / 2) / zoom,
    y: (-transform.y + viewportSize.height / 2) / zoom,
  };
}

/**
 * Build the shared coordinate helpers used by built-in drawing,
 * `renderOverlay`, and custom items. `transform`/`viewportSize` are not
 * needed by the helpers themselves but are passed downstream alongside
 * this bundle to form the public `MinimapDrawInfo`.
 */
export function buildDrawInfo(
  worldBounds: WorldRect,
  minimapSize: ViewportSize
): {
  scale: number;
  offset: Point2D;
  worldToMinimap: (point: Point2D) => Point2D;
  minimapToWorld: (point: Point2D) => Point2D;
} {
  const scale = computeMinimapScale(worldBounds, minimapSize);
  const offset = computeMinimapOffset(worldBounds, minimapSize, scale);
  return {
    scale,
    offset,
    worldToMinimap: (p: Point2D) => worldToMinimap(p, worldBounds, minimapSize),
    minimapToWorld: (p: Point2D) => minimapToWorld(p, worldBounds, minimapSize),
  };
}
