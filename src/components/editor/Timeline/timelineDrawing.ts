import type { ViewportSize } from '@/components/primitives/viewport';
import type {
  TimelineDrawInfo,
  TimelineTrack,
  TimelineView,
} from './Timeline.types';
import { frameToX, trackTop, xToFrame } from './timelineCoords';

export interface TimelineDrawColors {
  background: string;
  gridLine: string;
  rulerText: string;
  rowSeparator: string;
  keyframe: string;
  keyframeSelected: string;
  keyframeStroke: string;
  playhead: string;
}

export interface TimelineDrawInput {
  ctx: CanvasRenderingContext2D;
  /** Track-area size in CSS pixels (caller has already DPR-scaled the ctx). */
  size: ViewportSize;
  view: TimelineView;
  startFrame: number;
  endFrame: number;
  fps: number;
  frame: number;
  tracks: ReadonlyArray<TimelineTrack>;
  trackHeight: number;
  scrollTop: number;
  /** Height of the top ruler band in CSS px (0 when hidden). */
  rulerHeight: number;
  showPlayhead: boolean;
  colors: TimelineDrawColors;
  /** Canvas font string for ruler labels, e.g. `10px Inter, sans-serif`. */
  font: string;
  formatTime: (frame: number, fps: number) => string;
  isSelected: (trackId: string, keyframeId: string) => boolean;
  renderOverlay?: (
    ctx: CanvasRenderingContext2D,
    info: TimelineDrawInfo
  ) => void;
  /** Active marquee rectangle (box-select) in track-area px, or null. */
  marquee?: { x: number; y: number; width: number; height: number } | null;
}

const KEYFRAME_RADIUS = 4;
const MIN_LABEL_PX = 72;

/** Smallest "nice" step (1/2/5 × 10ⁿ, ≥ 1) at least as large as `value`. */
function niceFrameStep(value: number): number {
  if (value <= 1) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const f = value / base;
  const m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return Math.max(1, m * base);
}

function diamondPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
}

/**
 * Render a full dope-sheet frame: background → gridlines → ruler → track rows
 * → keyframes → caller `renderOverlay` → playhead. The caller is responsible
 * for DPR scaling on `ctx` before invoking.
 */
export function drawTimeline(input: TimelineDrawInput): void {
  const {
    ctx,
    size,
    view,
    startFrame,
    endFrame,
    fps,
    frame,
    tracks,
    trackHeight,
    scrollTop,
    rulerHeight,
    showPlayhead,
    colors,
    font,
    formatTime,
    isSelected,
    renderOverlay,
    marquee,
  } = input;

  const toX = (f: number): number => frameToX(f, view, size.width);

  ctx.clearRect(0, 0, size.width, size.height);
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, size.width, size.height);

  // ── Gridlines + ruler ticks ──
  const span = Math.max(1e-6, view.endFrame - view.startFrame);
  const framesPerPixel = span / Math.max(1, size.width);
  const step = niceFrameStep(framesPerPixel * MIN_LABEL_PX);
  const firstTick = Math.ceil(view.startFrame / step) * step;

  ctx.lineWidth = 1;
  ctx.strokeStyle = colors.gridLine;
  ctx.beginPath();
  for (let f = firstTick; f <= view.endFrame; f += step) {
    const x = Math.round(toX(f)) + 0.5;
    ctx.moveTo(x, rulerHeight);
    ctx.lineTo(x, size.height);
  }
  ctx.stroke();

  if (rulerHeight > 0) {
    ctx.fillStyle = colors.rulerText;
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    for (let f = firstTick; f <= view.endFrame; f += step) {
      const x = Math.round(toX(f));
      ctx.fillStyle = colors.gridLine;
      ctx.fillRect(x, rulerHeight - 5, 1, 5);
      ctx.fillStyle = colors.rulerText;
      ctx.fillText(formatTime(f, fps), x + 3, rulerHeight / 2);
    }
    ctx.fillStyle = colors.rowSeparator;
    ctx.fillRect(0, rulerHeight - 1, size.width, 1);
  }

  // ── Track rows + keyframes (clipped to the area below the ruler) ──
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, rulerHeight, size.width, Math.max(0, size.height - rulerHeight));
  ctx.clip();

  const visible = tracks.filter(t => !t.hidden);
  visible.forEach((track, index) => {
    const rowH = track.height ?? trackHeight;
    const top = rulerHeight + trackTop(index, trackHeight, scrollTop);
    const centerY = top + rowH / 2;

    ctx.fillStyle = colors.rowSeparator;
    ctx.fillRect(0, top + rowH - 1, size.width, 1);

    const fill = track.color ?? colors.keyframe;
    for (const kf of track.keyframes) {
      const x = toX(kf.x);
      if (x < -KEYFRAME_RADIUS || x > size.width + KEYFRAME_RADIUS) continue;
      const selected = kf.id !== undefined && isSelected(track.id, kf.id);
      diamondPath(ctx, x, centerY, KEYFRAME_RADIUS);
      ctx.fillStyle = selected ? colors.keyframeSelected : fill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.keyframeStroke;
      ctx.stroke();
    }
  });

  if (renderOverlay) {
    const info: TimelineDrawInfo = {
      size,
      view,
      startFrame,
      endFrame,
      fps,
      frame,
      frameToX: toX,
      xToFrame: (x: number): number => xToFrame(x, view, size.width),
    };
    ctx.save();
    renderOverlay(ctx, info);
    ctx.restore();
  }

  ctx.restore();

  // ── Playhead ──
  if (showPlayhead) {
    const x = Math.round(toX(frame)) + 0.5;
    ctx.strokeStyle = colors.playhead;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size.height);
    ctx.stroke();

    // Top handle (downward triangle in the ruler band).
    const head = Math.max(4, Math.min(7, rulerHeight - 2)) || 6;
    ctx.fillStyle = colors.playhead;
    ctx.beginPath();
    ctx.moveTo(x - head, 0);
    ctx.lineTo(x + head, 0);
    ctx.lineTo(x, head);
    ctx.closePath();
    ctx.fill();
  }

  // ── Marquee (box-select) ──
  if (marquee && (marquee.width > 0 || marquee.height > 0)) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = colors.keyframeSelected;
    ctx.fillRect(marquee.x, marquee.y, marquee.width, marquee.height);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.keyframeSelected;
    ctx.lineWidth = 1;
    ctx.strokeRect(
      marquee.x + 0.5,
      marquee.y + 0.5,
      Math.max(0, marquee.width - 1),
      Math.max(0, marquee.height - 1)
    );
    ctx.restore();
  }
}
