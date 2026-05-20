import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import { computeCenterTransform, computeFitTransform } from './viewportMath';
import type {
  ScreenRect,
  ViewportHandle,
  ViewportSize,
  ViewportTransform,
  WorldRect,
} from './Viewport.types';

/** Read-only snapshot of the viewport store state. */
export interface ViewportStoreSnapshot {
  transform: ViewportTransform;
  size: ViewportSize;
  isPanning: boolean;
  marqueeRect: ScreenRect | null;
}

interface ImperativeConfig {
  /** Pushes the new transform to React state (typically `useControlledState`'s setter). */
  setTransform: (next: ViewportTransform) => void;
  minZoom: number;
  maxZoom: number;
}

const IDENTITY_TRANSFORM: ViewportTransform = { x: 0, y: 0, zoom: 1 };

/**
 * Single source of truth for viewport runtime state — `transform`, `size`,
 * `isPanning`, `marqueeRect`, and per-layer invalidation events.
 *
 * Designed for React's `useSyncExternalStore`: each slice has its own
 * subscribe/get pair so subscribers re-render only when their slice
 * changes (not on every store mutation).
 *
 * `Viewport.tsx` configures the imperative methods (`fitToContent`,
 * `centerOn`, …) at mount via `configureImperative()` so the store knows
 * how to push transform updates back to React state. Until configured,
 * those methods are no-ops.
 */
export class ViewportStore {
  private transform: ViewportTransform = IDENTITY_TRANSFORM;
  private size: ViewportSize = { width: 0, height: 0 };
  private isPanning = false;
  private marqueeRect: ScreenRect | null = null;
  private snapshot: ViewportStoreSnapshot = this.computeSnapshot();

  private allListeners = new Set<() => void>();
  private transformListeners = new Set<() => void>();
  private sizeListeners = new Set<() => void>();
  private isPanningListeners = new Set<() => void>();
  private marqueeListeners = new Set<() => void>();
  private layerListeners = new Map<string, Set<() => void>>();

  private imperative: ImperativeConfig | null = null;

  // ── Public read API (arrow functions so they can be passed as callbacks) ──

  getSnapshot = (): ViewportStoreSnapshot => this.snapshot;
  getTransform = (): ViewportTransform => this.transform;
  getSize = (): ViewportSize => this.size;
  getIsPanning = (): boolean => this.isPanning;
  getMarqueeRect = (): ScreenRect | null => this.marqueeRect;

  // ── Subscriptions ──

  subscribe = (cb: () => void): (() => void) => {
    this.allListeners.add(cb);
    return () => {
      this.allListeners.delete(cb);
    };
  };

  subscribeTransform = (cb: () => void): (() => void) => {
    this.transformListeners.add(cb);
    return () => {
      this.transformListeners.delete(cb);
    };
  };

  subscribeSize = (cb: () => void): (() => void) => {
    this.sizeListeners.add(cb);
    return () => {
      this.sizeListeners.delete(cb);
    };
  };

  subscribeIsPanning = (cb: () => void): (() => void) => {
    this.isPanningListeners.add(cb);
    return () => {
      this.isPanningListeners.delete(cb);
    };
  };

  subscribeMarquee = (cb: () => void): (() => void) => {
    this.marqueeListeners.add(cb);
    return () => {
      this.marqueeListeners.delete(cb);
    };
  };

  subscribeLayer(name: string, cb: () => void): () => void {
    let set = this.layerListeners.get(name);
    if (!set) {
      set = new Set();
      this.layerListeners.set(name, set);
    }
    set.add(cb);
    return () => {
      const current = this.layerListeners.get(name);
      if (!current) return;
      current.delete(cb);
      if (current.size === 0) this.layerListeners.delete(name);
    };
  }

  // ── Mutators (called by Viewport / gestures) ──

  setTransform(next: ViewportTransform): void {
    if (next === this.transform) return;
    this.transform = next;
    this.snapshot = this.computeSnapshot();
    this.transformListeners.forEach(cb => cb());
    this.allListeners.forEach(cb => cb());
  }

  setSize(next: ViewportSize): void {
    if (next.width === this.size.width && next.height === this.size.height) {
      return;
    }
    this.size = next;
    this.snapshot = this.computeSnapshot();
    this.sizeListeners.forEach(cb => cb());
    this.allListeners.forEach(cb => cb());
  }

  setIsPanning(next: boolean): void {
    if (next === this.isPanning) return;
    this.isPanning = next;
    this.snapshot = this.computeSnapshot();
    this.isPanningListeners.forEach(cb => cb());
    this.allListeners.forEach(cb => cb());
  }

  setMarqueeRect(next: ScreenRect | null): void {
    if (next === this.marqueeRect) return;
    this.marqueeRect = next;
    this.snapshot = this.computeSnapshot();
    this.marqueeListeners.forEach(cb => cb());
    this.allListeners.forEach(cb => cb());
  }

  /**
   * Trigger a redraw of one layer (when `layerName` is provided) or all
   * layers (when omitted). Does not mutate snapshot state — fires only
   * the layer listeners.
   */
  invalidate(layerName?: string): void {
    if (layerName === undefined) {
      this.layerListeners.forEach(set => set.forEach(cb => cb()));
    } else {
      this.layerListeners.get(layerName)?.forEach(cb => cb());
    }
  }

  // ── Imperative handle wiring ──

  /**
   * Wire up the React-side bits the imperative methods need
   * (a `setTransform` that goes through React state + zoom limits).
   * Viewport calls this on mount and on dependency changes.
   */
  configureImperative(config: ImperativeConfig): void {
    this.imperative = config;
  }

  /**
   * Returns a stable handle object whose methods proxy to the store.
   * The store keeps its lifecycle, so this handle reference is stable
   * for the lifetime of the store.
   */
  readonly handle: ViewportHandle = {
    fitToContent: (bounds: WorldRect, padding = 0): void => {
      if (!this.imperative) return;
      this.imperative.setTransform(
        computeFitTransform(bounds, this.size, padding, {
          minZoom: this.imperative.minZoom,
          maxZoom: this.imperative.maxZoom,
        })
      );
    },
    zoomToRect: (rect: WorldRect, padding = 0): void => {
      if (!this.imperative) return;
      this.imperative.setTransform(
        computeFitTransform(rect, this.size, padding, {
          minZoom: this.imperative.minZoom,
          maxZoom: this.imperative.maxZoom,
        })
      );
    },
    centerOn: (point: Point2D, zoom?: number): void => {
      if (!this.imperative) return;
      this.imperative.setTransform(
        computeCenterTransform(
          point,
          this.size,
          this.transform,
          {
            minZoom: this.imperative.minZoom,
            maxZoom: this.imperative.maxZoom,
          },
          zoom
        )
      );
    },
    getTransform: (): ViewportTransform => this.transform,
    getSize: (): ViewportSize => this.size,
    invalidate: (layerName?: string): void => {
      this.invalidate(layerName);
    },
  };

  private computeSnapshot(): ViewportStoreSnapshot {
    return {
      transform: this.transform,
      size: this.size,
      isPanning: this.isPanning,
      marqueeRect: this.marqueeRect,
    };
  }
}
