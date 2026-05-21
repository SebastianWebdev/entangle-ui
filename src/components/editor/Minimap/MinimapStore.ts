import type {
  ViewportSize,
  ViewportTransform,
  WorldRect,
} from '@/components/primitives/viewport';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { MinimapContextValue, MinimapHandle } from './Minimap.types';
import {
  computeMinimapOffset,
  computeMinimapScale,
  minimapToWorld as minimapToWorldFn,
  worldToMinimap as worldToMinimapFn,
} from './minimapCoords';

const IDENTITY_TRANSFORM: ViewportTransform = { x: 0, y: 0, zoom: 1 };
const ZERO_SIZE: ViewportSize = { width: 0, height: 0 };
const ZERO_RECT: WorldRect = { x: 0, y: 0, width: 0, height: 0 };

/** Snapshot of the geometry slice — the data needed to position anything. */
export interface MinimapGeometryState {
  transform: ViewportTransform;
  viewportSize: ViewportSize;
  worldBounds: WorldRect;
  minimapSize: ViewportSize;
}

/** Snapshot of the hover slice. */
export interface MinimapHoverState {
  hoverWorldPoint: Point2D | null;
  hoveredItemId: string | null;
}

/**
 * Single source of truth for Minimap runtime state — geometry, hover,
 * drag. Designed for React's `useSyncExternalStore`: each slice has its
 * own subscribe/get pair so subscribers re-render only when their slice
 * changes (not on every store mutation).
 *
 * Wzorowane 1:1 na `primitives/viewport/ViewportStore.ts`.
 */
export class MinimapStore {
  private geometry: MinimapGeometryState = {
    transform: IDENTITY_TRANSFORM,
    viewportSize: ZERO_SIZE,
    worldBounds: ZERO_RECT,
    minimapSize: ZERO_SIZE,
  };
  private hover: MinimapHoverState = {
    hoverWorldPoint: null,
    hoveredItemId: null,
  };
  private isDragging = false;
  private snapshot: MinimapContextValue = this.computeSnapshot();

  private allListeners = new Set<() => void>();
  private geometryListeners = new Set<() => void>();
  private hoverListeners = new Set<() => void>();
  private dragListeners = new Set<() => void>();

  // ── Public read API (arrow functions so they can be passed as callbacks) ──

  getSnapshot = (): MinimapContextValue => this.snapshot;
  getGeometry = (): MinimapGeometryState => this.geometry;
  getHover = (): MinimapHoverState => this.hover;
  getIsDragging = (): boolean => this.isDragging;

  // ── Subscriptions ──

  subscribe = (cb: () => void): (() => void) => {
    this.allListeners.add(cb);
    return () => {
      this.allListeners.delete(cb);
    };
  };

  subscribeGeometry = (cb: () => void): (() => void) => {
    this.geometryListeners.add(cb);
    return () => {
      this.geometryListeners.delete(cb);
    };
  };

  subscribeHover = (cb: () => void): (() => void) => {
    this.hoverListeners.add(cb);
    return () => {
      this.hoverListeners.delete(cb);
    };
  };

  subscribeDrag = (cb: () => void): (() => void) => {
    this.dragListeners.add(cb);
    return () => {
      this.dragListeners.delete(cb);
    };
  };

  // ── Mutators ──

  setGeometry(partial: Partial<MinimapGeometryState>): void {
    const next: MinimapGeometryState = {
      transform: partial.transform ?? this.geometry.transform,
      viewportSize: partial.viewportSize ?? this.geometry.viewportSize,
      worldBounds: partial.worldBounds ?? this.geometry.worldBounds,
      minimapSize: partial.minimapSize ?? this.geometry.minimapSize,
    };
    if (
      next.transform === this.geometry.transform &&
      sizeEqual(next.viewportSize, this.geometry.viewportSize) &&
      rectEqual(next.worldBounds, this.geometry.worldBounds) &&
      sizeEqual(next.minimapSize, this.geometry.minimapSize)
    ) {
      return;
    }
    this.geometry = next;
    this.snapshot = this.computeSnapshot();
    this.geometryListeners.forEach(cb => cb());
    this.allListeners.forEach(cb => cb());
  }

  setHover(next: MinimapHoverState): void {
    if (
      hoverPointEqual(next.hoverWorldPoint, this.hover.hoverWorldPoint) &&
      next.hoveredItemId === this.hover.hoveredItemId
    ) {
      return;
    }
    this.hover = next;
    this.snapshot = this.computeSnapshot();
    this.hoverListeners.forEach(cb => cb());
    this.allListeners.forEach(cb => cb());
  }

  setIsDragging(next: boolean): void {
    if (next === this.isDragging) return;
    this.isDragging = next;
    this.snapshot = this.computeSnapshot();
    this.dragListeners.forEach(cb => cb());
    this.allListeners.forEach(cb => cb());
  }

  // ── Imperative handle ──

  /**
   * Stable handle whose methods proxy to the current store state. The
   * handle reference is stable for the lifetime of the store.
   */
  readonly handle: MinimapHandle = {
    focus: (): void => {
      this.focusElement?.();
    },
    getElement: (): HTMLDivElement | null => this.elementGetter?.() ?? null,
    worldToMinimap: (p: Point2D): Point2D =>
      worldToMinimapFn(p, this.geometry.worldBounds, this.geometry.minimapSize),
    minimapToWorld: (p: Point2D): Point2D =>
      minimapToWorldFn(p, this.geometry.worldBounds, this.geometry.minimapSize),
  };

  /** Wired up by `Minimap.tsx` so the handle knows which element to act on. */
  configureHandle(config: {
    focus: () => void;
    getElement: () => HTMLDivElement | null;
  }): void {
    this.focusElement = config.focus;
    this.elementGetter = config.getElement;
  }

  private focusElement: (() => void) | null = null;
  private elementGetter: (() => HTMLDivElement | null) | null = null;

  private computeSnapshot(): MinimapContextValue {
    const { worldBounds, minimapSize, transform, viewportSize } = this.geometry;
    const scale = computeMinimapScale(worldBounds, minimapSize);
    const offset = computeMinimapOffset(worldBounds, minimapSize, scale);
    return {
      worldBounds,
      minimapSize,
      transform,
      viewportSize,
      hoverWorldPoint: this.hover.hoverWorldPoint,
      hoveredItemId: this.hover.hoveredItemId,
      isDragging: this.isDragging,
      scale,
      offset,
      worldToMinimap: (p: Point2D): Point2D =>
        worldToMinimapFn(p, worldBounds, minimapSize),
      minimapToWorld: (p: Point2D): Point2D =>
        minimapToWorldFn(p, worldBounds, minimapSize),
    };
  }
}

function sizeEqual(a: ViewportSize, b: ViewportSize): boolean {
  return a.width === b.width && a.height === b.height;
}

function rectEqual(a: WorldRect, b: WorldRect): boolean {
  return (
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  );
}

function hoverPointEqual(a: Point2D | null, b: Point2D | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}
