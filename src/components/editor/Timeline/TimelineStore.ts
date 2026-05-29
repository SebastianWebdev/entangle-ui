import {
  frameToX as frameToXFn,
  xToFrame as xToFrameFn,
} from './timelineCoords';
import { selectionKey } from './timelineSelection';

import type {
  TimelineContextValue,
  TimelineHandle,
  TimelineKeyframeRef,
  TimelineMode,
  TimelineSelection,
  TimelineView,
} from './Timeline.types';
import type { ViewportSize } from '@/components/primitives/viewport';

const ZERO_SIZE: ViewportSize = { width: 0, height: 0 };
const DEFAULT_VIEW: TimelineView = { startFrame: 0, endFrame: 1 };

/** Snapshot of the geometry slice — everything needed to position content. */
export interface TimelineGeometryState {
  /** Visible frame window. */
  view: TimelineView;
  /** Track-area size in CSS px (excludes the header column). */
  size: ViewportSize;
  /** Uniform row height in CSS px. */
  trackHeight: number;
  /** Vertical scroll offset of the track stack. */
  scrollTop: number;
  /** Global frame range. */
  startFrame: number;
  endFrame: number;
  /** Frames per second. */
  fps: number;
  /** Editor mode. */
  mode: TimelineMode;
}

/** Snapshot of the playhead slice. */
export interface TimelinePlayheadState {
  frame: number;
  playing: boolean;
}

/** The active pointer gesture. */
export type TimelineDragKind = 'none' | 'scrub' | 'move' | 'marquee' | 'pan';

/** Which part of the loop region the pointer is hovering (for highlight + cursor). */
export type TimelineLoopHover = 'start' | 'end' | 'body' | null;

/** Snapshot of the drag slice — active gesture + optional marquee rectangle. */
export interface TimelineDragState {
  kind: TimelineDragKind;
  /** Marquee rectangle in track-area CSS px (box-select), or null. */
  marquee: { x: number; y: number; width: number; height: number } | null;
}

/**
 * Callbacks the component wires (via `configureHandle`) so the imperative
 * handle and gestures can request state changes. The component owns the
 * controlled/uncontrolled props and fires the public `on*` callbacks.
 */
export interface TimelineRequestHandlers {
  focus: () => void;
  getElement: () => HTMLDivElement | null;
  seek: (frame: number) => void;
  setPlaying: (playing: boolean) => void;
  setView: (view: TimelineView) => void;
  zoomToFit: (paddingFrames?: number) => void;
  zoomToSelection: () => void;
}

/**
 * Single source of truth for Timeline runtime state — geometry, playhead,
 * selection. Designed for `useSyncExternalStore`: each slice has its own
 * subscribe/get pair so subscribers re-render only when their slice changes.
 * Controlled props are mirrored into the store by the component before paint.
 */
export class TimelineStore {
  private geometry: TimelineGeometryState = {
    view: DEFAULT_VIEW,
    size: ZERO_SIZE,
    trackHeight: 28,
    scrollTop: 0,
    startFrame: 0,
    endFrame: 1,
    fps: 30,
    mode: 'dope-sheet',
  };
  private playhead: TimelinePlayheadState = { frame: 0, playing: false };
  private selection: TimelineSelection = [];
  private selectionKeys = new Set<string>();
  private drag: TimelineDragState = { kind: 'none', marquee: null };
  private hover: TimelineKeyframeRef | null = null;
  private hoverPlayhead = false;
  private hoverLoop: TimelineLoopHover = null;
  private snapshot: TimelineContextValue = this.computeSnapshot();

  private allListeners = new Set<() => void>();
  private geometryListeners = new Set<() => void>();
  private playheadListeners = new Set<() => void>();
  private selectionListeners = new Set<() => void>();
  private dragListeners = new Set<() => void>();
  private hoverListeners = new Set<() => void>();
  private hoverPlayheadListeners = new Set<() => void>();
  private hoverLoopListeners = new Set<() => void>();

  // ── Public read API (arrow functions so they can be passed as callbacks) ──

  getSnapshot = (): TimelineContextValue => this.snapshot;
  getGeometry = (): TimelineGeometryState => this.geometry;
  getPlayhead = (): TimelinePlayheadState => this.playhead;
  getSelection = (): TimelineSelection => this.selection;
  getDrag = (): TimelineDragState => this.drag;
  getHover = (): TimelineKeyframeRef | null => this.hover;
  getHoverPlayhead = (): boolean => this.hoverPlayhead;
  getHoverLoop = (): TimelineLoopHover => this.hoverLoop;
  isSelected = (ref: TimelineKeyframeRef): boolean =>
    this.selectionKeys.has(selectionKey(ref));
  isHovered = (ref: TimelineKeyframeRef): boolean =>
    this.hover !== null &&
    this.hover.trackId === ref.trackId &&
    this.hover.keyframeId === ref.keyframeId;

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

  subscribePlayhead = (cb: () => void): (() => void) => {
    this.playheadListeners.add(cb);
    return () => {
      this.playheadListeners.delete(cb);
    };
  };

  subscribeSelection = (cb: () => void): (() => void) => {
    this.selectionListeners.add(cb);
    return () => {
      this.selectionListeners.delete(cb);
    };
  };

  subscribeDrag = (cb: () => void): (() => void) => {
    this.dragListeners.add(cb);
    return () => {
      this.dragListeners.delete(cb);
    };
  };

  subscribeHover = (cb: () => void): (() => void) => {
    this.hoverListeners.add(cb);
    return () => {
      this.hoverListeners.delete(cb);
    };
  };

  subscribeHoverPlayhead = (cb: () => void): (() => void) => {
    this.hoverPlayheadListeners.add(cb);
    return () => {
      this.hoverPlayheadListeners.delete(cb);
    };
  };

  subscribeHoverLoop = (cb: () => void): (() => void) => {
    this.hoverLoopListeners.add(cb);
    return () => {
      this.hoverLoopListeners.delete(cb);
    };
  };

  // ── Mutators ──

  setGeometry(partial: Partial<TimelineGeometryState>): void {
    const next: TimelineGeometryState = {
      view: partial.view ?? this.geometry.view,
      size: partial.size ?? this.geometry.size,
      trackHeight: partial.trackHeight ?? this.geometry.trackHeight,
      scrollTop: partial.scrollTop ?? this.geometry.scrollTop,
      startFrame: partial.startFrame ?? this.geometry.startFrame,
      endFrame: partial.endFrame ?? this.geometry.endFrame,
      fps: partial.fps ?? this.geometry.fps,
      mode: partial.mode ?? this.geometry.mode,
    };
    if (geometryEqual(next, this.geometry)) return;
    this.geometry = next;
    this.snapshot = this.computeSnapshot();
    this.geometryListeners.forEach(cb => {
      cb();
    });
    this.allListeners.forEach(cb => {
      cb();
    });
  }

  setPlayhead(partial: Partial<TimelinePlayheadState>): void {
    const next: TimelinePlayheadState = {
      frame: partial.frame ?? this.playhead.frame,
      playing: partial.playing ?? this.playhead.playing,
    };
    if (
      next.frame === this.playhead.frame &&
      next.playing === this.playhead.playing
    ) {
      return;
    }
    this.playhead = next;
    this.snapshot = this.computeSnapshot();
    this.playheadListeners.forEach(cb => {
      cb();
    });
    this.allListeners.forEach(cb => {
      cb();
    });
  }

  setSelection(next: TimelineSelection): void {
    const nextKeys = new Set(next.map(selectionKey));
    if (setsEqual(nextKeys, this.selectionKeys)) return;
    this.selection = next;
    this.selectionKeys = nextKeys;
    this.snapshot = this.computeSnapshot();
    this.selectionListeners.forEach(cb => {
      cb();
    });
    this.allListeners.forEach(cb => {
      cb();
    });
  }

  setDrag(next: TimelineDragState): void {
    if (
      next.kind === this.drag.kind &&
      marqueeEqual(next.marquee, this.drag.marquee)
    ) {
      return;
    }
    this.drag = next;
    this.dragListeners.forEach(cb => {
      cb();
    });
  }

  setHover(next: TimelineKeyframeRef | null): void {
    if (
      (next === null && this.hover === null) ||
      (next !== null &&
        this.hover !== null &&
        next.trackId === this.hover.trackId &&
        next.keyframeId === this.hover.keyframeId)
    ) {
      return;
    }
    this.hover = next;
    this.hoverListeners.forEach(cb => {
      cb();
    });
  }

  setHoverPlayhead(next: boolean): void {
    if (next === this.hoverPlayhead) return;
    this.hoverPlayhead = next;
    this.hoverPlayheadListeners.forEach(cb => {
      cb();
    });
  }

  setHoverLoop(next: TimelineLoopHover): void {
    if (next === this.hoverLoop) return;
    this.hoverLoop = next;
    this.hoverLoopListeners.forEach(cb => {
      cb();
    });
  }

  // ── Imperative handle ──

  /**
   * Stable handle whose methods proxy to the current store state and to the
   * request handlers wired by the component. Stable for the store's lifetime.
   */
  readonly handle: TimelineHandle = {
    focus: (): void => {
      this.handlers?.focus();
    },
    getElement: (): HTMLDivElement | null =>
      this.handlers?.getElement() ?? null,
    seek: (frame: number): void => {
      this.handlers?.seek(frame);
    },
    play: (): void => {
      this.handlers?.setPlaying(true);
    },
    pause: (): void => {
      this.handlers?.setPlaying(false);
    },
    toggle: (): void => {
      this.handlers?.setPlaying(!this.playhead.playing);
    },
    getFrame: (): number => this.playhead.frame,
    zoomToFit: (paddingFrames?: number): void => {
      this.handlers?.zoomToFit(paddingFrames);
    },
    zoomToSelection: (): void => {
      this.handlers?.zoomToSelection();
    },
    getView: (): TimelineView => this.geometry.view,
    setView: (view: TimelineView): void => {
      this.handlers?.setView(view);
    },
    frameToX: (frame: number): number =>
      frameToXFn(frame, this.geometry.view, this.geometry.size.width),
    xToFrame: (x: number): number =>
      xToFrameFn(x, this.geometry.view, this.geometry.size.width),
  };

  /** Wired up by `Timeline.tsx` so the handle/gestures can request changes. */
  configureHandle(handlers: TimelineRequestHandlers): void {
    this.handlers = handlers;
  }

  private handlers: TimelineRequestHandlers | null = null;

  private computeSnapshot(): TimelineContextValue {
    const { view, size, startFrame, endFrame, fps, mode } = this.geometry;
    return {
      view,
      size,
      startFrame,
      endFrame,
      fps,
      mode,
      frame: this.playhead.frame,
      playing: this.playhead.playing,
      selection: this.selection,
      frameToX: (f: number): number => frameToXFn(f, view, size.width),
      xToFrame: (x: number): number => xToFrameFn(x, view, size.width),
    };
  }
}

function viewEqual(a: TimelineView, b: TimelineView): boolean {
  return a.startFrame === b.startFrame && a.endFrame === b.endFrame;
}

function sizeEqual(a: ViewportSize, b: ViewportSize): boolean {
  return a.width === b.width && a.height === b.height;
}

function geometryEqual(
  a: TimelineGeometryState,
  b: TimelineGeometryState
): boolean {
  return (
    viewEqual(a.view, b.view) &&
    sizeEqual(a.size, b.size) &&
    a.trackHeight === b.trackHeight &&
    a.scrollTop === b.scrollTop &&
    a.startFrame === b.startFrame &&
    a.endFrame === b.endFrame &&
    a.fps === b.fps &&
    a.mode === b.mode
  );
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const key of a) {
    if (!b.has(key)) return false;
  }
  return true;
}

function marqueeEqual(
  a: TimelineDragState['marquee'],
  b: TimelineDragState['marquee']
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  );
}
