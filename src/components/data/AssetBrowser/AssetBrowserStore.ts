/** Screen-space rectangle (px, relative to the grid scroll container). */
export interface MarqueeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MarqueeState {
  active: boolean;
  rect: MarqueeRect | null;
  /** Whether the marquee adds to (Ctrl/Cmd) or replaces the selection. */
  additive: boolean;
}

export interface DragState {
  active: boolean;
  draggingIds: string[];
  /** Folder id currently hovered as a drop target, or `'root'`/null for the surface. */
  dropTargetId: string | null;
  /** An external OS-file drag is hovering the surface. */
  externalOver: boolean;
}

const INITIAL_MARQUEE: MarqueeState = {
  active: false,
  rect: null,
  additive: false,
};
const INITIAL_DRAG: DragState = {
  active: false,
  draggingIds: [],
  dropTargetId: null,
  externalOver: false,
};

function sameDrag(a: DragState, b: DragState): boolean {
  return (
    a.active === b.active &&
    a.dropTargetId === b.dropTargetId &&
    a.externalOver === b.externalOver &&
    a.draggingIds.length === b.draggingIds.length &&
    a.draggingIds.every((id, i) => id === b.draggingIds[i])
  );
}

function sameMarquee(a: MarqueeState, b: MarqueeState): boolean {
  if (a.active !== b.active || a.additive !== b.additive) return false;
  if (a.rect === b.rect) return true;
  if (!a.rect || !b.rect) return false;
  return (
    a.rect.x === b.rect.x &&
    a.rect.y === b.rect.y &&
    a.rect.width === b.rect.width &&
    a.rect.height === b.rect.height
  );
}

/**
 * Per-instance hot-path store for AssetBrowser. Holds only state that updates
 * faster than a click — roving focus, the marquee rectangle, and drag state.
 *
 * Selection, view, search, filters, and sort are low-frequency and live in
 * React state (via `useControlledState`), not here. Each slice exposes its own
 * `subscribe`/`get` pair for `useSyncExternalStore` so a marquee drag does not
 * re-render the toolbar.
 */
export class AssetBrowserStore {
  #focusedId: string | null = null;
  #marquee: MarqueeState = INITIAL_MARQUEE;
  #drag: DragState = INITIAL_DRAG;

  #focusListeners = new Set<() => void>();
  #marqueeListeners = new Set<() => void>();
  #dragListeners = new Set<() => void>();

  // ── Reads (arrow fns so they pass straight to useSyncExternalStore) ──
  getFocusedId = (): string | null => this.#focusedId;
  getMarquee = (): MarqueeState => this.#marquee;
  getDrag = (): DragState => this.#drag;

  // ── Subscriptions ──
  subscribeFocus = (cb: () => void): (() => void) => {
    this.#focusListeners.add(cb);
    return () => {
      this.#focusListeners.delete(cb);
    };
  };
  subscribeMarquee = (cb: () => void): (() => void) => {
    this.#marqueeListeners.add(cb);
    return () => {
      this.#marqueeListeners.delete(cb);
    };
  };
  subscribeDrag = (cb: () => void): (() => void) => {
    this.#dragListeners.add(cb);
    return () => {
      this.#dragListeners.delete(cb);
    };
  };

  // ── Mutations (no-op when unchanged to keep snapshots stable) ──
  setFocusedId(next: string | null): void {
    if (next === this.#focusedId) return;
    this.#focusedId = next;
    this.#focusListeners.forEach(cb => cb());
  }

  setMarquee(next: MarqueeState): void {
    if (sameMarquee(this.#marquee, next)) return;
    this.#marquee = next;
    this.#marqueeListeners.forEach(cb => cb());
  }

  clearMarquee(): void {
    this.setMarquee(INITIAL_MARQUEE);
  }

  setDrag(next: DragState): void {
    if (sameDrag(this.#drag, next)) return;
    this.#drag = next;
    this.#dragListeners.forEach(cb => cb());
  }

  clearDrag(): void {
    this.setDrag(INITIAL_DRAG);
  }
}
