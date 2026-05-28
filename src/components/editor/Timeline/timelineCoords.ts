import type { TimelineLoop, TimelineView } from './Timeline.types';

/** Resolve a loop prop to a concrete `{ startFrame, endFrame }` region, or null. */
export function resolveLoop(
  loop: TimelineLoop | undefined,
  startFrame: number,
  endFrame: number
): { startFrame: number; endFrame: number } | null {
  if (loop === true) return { startFrame, endFrame };
  if (loop && typeof loop === 'object') return loop;
  return null;
}

/** Visible frame span of a view window. Guards against a zero/negative span. */
function viewSpan(view: TimelineView): number {
  return Math.max(1e-6, view.endFrame - view.startFrame);
}

/** Map a frame to a CSS-pixel X within the track area `[0, width]`. */
export function frameToX(
  frame: number,
  view: TimelineView,
  width: number
): number {
  return ((frame - view.startFrame) / viewSpan(view)) * width;
}

/** Inverse of `frameToX`: a CSS-pixel X to a frame. */
export function xToFrame(x: number, view: TimelineView, width: number): number {
  if (width <= 0) return view.startFrame;
  return view.startFrame + (x / width) * viewSpan(view);
}

/** Snap a frame to the nearest increment. `true` = 1 frame, `false` = no snap. */
export function snapFrame(frame: number, snap: boolean | number): number {
  if (snap === false) return frame;
  const step = snap === true ? 1 : Math.max(1e-6, snap);
  return Math.round(frame / step) * step;
}

/** Clamp a value to `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Format a frame number as `HH:MM:SS:FF` timecode at the given fps.
 * Negative frames clamp to zero; fps is rounded to whole frames-per-second.
 */
export function framesToTimecode(frame: number, fps: number): string {
  const safeFps = fps > 0 ? Math.round(fps) : 30;
  const total = Math.max(0, Math.floor(frame));
  const ff = total % safeFps;
  const totalSeconds = Math.floor(total / safeFps);
  const ss = totalSeconds % 60;
  const mm = Math.floor(totalSeconds / 60) % 60;
  const hh = Math.floor(totalSeconds / 3600);
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

// ─── Graph-mode value axis ───

/** Vertical inset (CSS px) inside a graph row so curves don't touch the edges. */
function valueInset(rowHeight: number): number {
  return Math.min(8, rowHeight * 0.2);
}

/** Map a value to a CSS-pixel Y inside a graph-mode row (higher value → higher up). */
export function valueToY(
  value: number,
  range: readonly [number, number],
  rowTop: number,
  rowHeight: number
): number {
  const span = Math.max(1e-6, range[1] - range[0]);
  const inset = valueInset(rowHeight);
  const usable = Math.max(1e-6, rowHeight - inset * 2);
  const t = (value - range[0]) / span;
  return rowTop + inset + (1 - t) * usable;
}

/** Inverse of `valueToY`: a CSS-pixel Y inside a row to a value. */
export function yToValue(
  y: number,
  range: readonly [number, number],
  rowTop: number,
  rowHeight: number
): number {
  const span = range[1] - range[0];
  const inset = valueInset(rowHeight);
  const usable = Math.max(1e-6, rowHeight - inset * 2);
  const t = 1 - (y - rowTop - inset) / usable;
  return range[0] + t * span;
}

/** Auto-fit a value range to a set of keyframes, with 10% padding. */
export function autoValueRange(
  keyframes: ReadonlyArray<{ y: number }>
): [number, number] {
  if (keyframes.length === 0) return [0, 1];
  let lo = Infinity;
  let hi = -Infinity;
  for (const k of keyframes) {
    if (k.y < lo) lo = k.y;
    if (k.y > hi) hi = k.y;
  }
  if (lo === hi) return [lo - 1, hi + 1];
  const pad = (hi - lo) * 0.1;
  return [lo - pad, hi + pad];
}

/**
 * Compute the next view that should follow the playhead during playback,
 * or `null` when no change is needed.
 *
 * - `'smooth'` — the view's `startFrame` is `frame - span/2`, clamped to
 *   `[startFrame, endFrame - span]`. Called every frame tick → continuous
 *   tracking with the playhead pinned to the centre.
 * - `'paged'` — return a new view only when the playhead has left the
 *   current view; the new view starts at the playhead, clamped to bounds.
 * - `'off'` — always returns `null`.
 */
export function nextFollowView(
  mode: 'smooth' | 'paged' | 'off',
  view: TimelineView,
  frame: number,
  startFrame: number,
  endFrame: number
): TimelineView | null {
  if (mode === 'off') return null;
  const span = view.endFrame - view.startFrame;
  if (span <= 0) return null;
  const maxStart = endFrame - span;
  let nextStart: number;
  if (mode === 'paged') {
    if (frame >= view.startFrame && frame <= view.endFrame) return null;
    nextStart = clamp(frame, startFrame, maxStart);
  } else {
    nextStart = clamp(frame - span / 2, startFrame, maxStart);
  }
  if (nextStart === view.startFrame) return null;
  return { startFrame: nextStart, endFrame: nextStart + span };
}
