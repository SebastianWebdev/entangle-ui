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

const EMPTY_SELECTION: ReadonlySet<string> = new Set<string>();

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
 * View, search, filters, and sort are low-frequency and live in React state
 * (via `useControlledState`), not here. Selection is owned by React state too
 * (for the controlled API) but mirrored into this store so each grid item can
 * subscribe to its own "am I selected?" slice via `useAssetSelected(id)` rather
 * than re-rendering every cell on every selection change. Each slice exposes
 * its own `subscribe`/`get` pair for `useSyncExternalStore` so a marquee drag
 * does not re-render the toolbar.
 */
export class AssetBrowserStore {
  #focusedId: string | null = null;
  #editingId: string | null = null;
  #marquee: MarqueeState = INITIAL_MARQUEE;
  #drag: DragState = INITIAL_DRAG;
  #selection: ReadonlySet<string> = EMPTY_SELECTION;

  #focusListeners = new Set<() => void>();
  #editingListeners = new Set<() => void>();
  #marqueeListeners = new Set<() => void>();
  #dragListeners = new Set<() => void>();
  #selectionListeners = new Set<() => void>();

  /** Set by the grid so the imperative `scrollToItem` works under windowing. */
  #scrollToIndex: ((index: number) => void) | null = null;

  // ── Reads (arrow fns so they pass straight to useSyncExternalStore) ──
  getFocusedId = (): string | null => this.#focusedId;
  getEditingId = (): string | null => this.#editingId;
  getMarquee = (): MarqueeState => this.#marquee;
  getDrag = (): DragState => this.#drag;
  getSelection = (): ReadonlySet<string> => this.#selection;

  // ── Subscriptions ──
  subscribeFocus = (cb: () => void): (() => void) => {
    this.#focusListeners.add(cb);
    return () => {
      this.#focusListeners.delete(cb);
    };
  };
  subscribeEditing = (cb: () => void): (() => void) => {
    this.#editingListeners.add(cb);
    return () => {
      this.#editingListeners.delete(cb);
    };
  };
  subscribeSelection = (cb: () => void): (() => void) => {
    this.#selectionListeners.add(cb);
    return () => {
      this.#selectionListeners.delete(cb);
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
    this.#focusListeners.forEach(cb => {
      cb();
    });
  }

  /**
   * Id of the item whose label is being renamed inline, or `null`. Lives here
   * (not in React state) so rename can be triggered from outside the cell —
   * the F2 keyboard handler, a context-menu action, or the imperative
   * `beginRename` handle — and only the affected cell re-renders via its own
   * `useAssetEditing(id)` slice.
   */
  setEditingId(next: string | null): void {
    if (next === this.#editingId) return;
    this.#editingId = next;
    this.#editingListeners.forEach(cb => {
      cb();
    });
  }

  setMarquee(next: MarqueeState): void {
    if (sameMarquee(this.#marquee, next)) return;
    this.#marquee = next;
    this.#marqueeListeners.forEach(cb => {
      cb();
    });
  }

  clearMarquee(): void {
    this.setMarquee(INITIAL_MARQUEE);
  }

  setDrag(next: DragState): void {
    if (sameDrag(this.#drag, next)) return;
    this.#drag = next;
    this.#dragListeners.forEach(cb => {
      cb();
    });
  }

  clearDrag(): void {
    this.setDrag(INITIAL_DRAG);
  }

  /**
   * Mirror the React-owned selection. Callers pass a memoized Set, so a cheap
   * reference check keeps the snapshot stable when nothing changed.
   */
  setSelection(next: ReadonlySet<string>): void {
    if (next === this.#selection) return;
    this.#selection = next;
    this.#selectionListeners.forEach(cb => {
      cb();
    });
  }

  // ── Imperative scroll bridge ──
  registerScrollToIndex(fn: (index: number) => void): () => void {
    this.#scrollToIndex = fn;
    return () => {
      if (this.#scrollToIndex === fn) this.#scrollToIndex = null;
    };
  }

  /** Returns true when a grid was mounted to handle the scroll. */
  scrollToIndex(index: number): boolean {
    if (!this.#scrollToIndex) return false;
    this.#scrollToIndex(index);
    return true;
  }
}
