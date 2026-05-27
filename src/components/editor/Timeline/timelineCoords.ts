import type { TimelineView } from './Timeline.types';

/** Visible frame span of a view window. Guards against a zero/negative span. */
export function viewSpan(view: TimelineView): number {
  return Math.max(1e-6, view.endFrame - view.startFrame);
}

/** Frames represented by one CSS pixel of the track area. */
export function framesPerPixel(view: TimelineView, width: number): number {
  if (width <= 0) return viewSpan(view);
  return viewSpan(view) / width;
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

/** Top Y (CSS px) of a track row, given a uniform row height + scroll offset. */
export function trackTop(
  index: number,
  trackHeight: number,
  scrollTop: number
): number {
  return index * trackHeight - scrollTop;
}

/** Track row index at a CSS-pixel Y (may be out of range — caller validates). */
export function yToTrackIndex(
  y: number,
  trackHeight: number,
  scrollTop: number
): number {
  if (trackHeight <= 0) return 0;
  return Math.floor((y + scrollTop) / trackHeight);
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
