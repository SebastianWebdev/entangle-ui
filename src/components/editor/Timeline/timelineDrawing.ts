import type { ViewportSize } from '@/components/primitives/viewport';
import { evaluateCurve } from '@/components/controls/CurveEditor';
import type { CurveData } from '@/types/keyframe';
import type {
  TimelineDrawInfo,
  TimelineTrack,
  TimelineView,
} from './Timeline.types';
import type { TimelineRow } from './timelineLayout';
import { autoValueRange, frameToX, valueToY, xToFrame } from './timelineCoords';

export interface TimelineDrawColors {
  background: string;
  gridLine: string;
  rulerText: string;
  rowSeparator: string;
  keyframe: string;
  keyframeSelected: string;
  keyframeStroke: string;
  playhead: string;
  groupHeader: string;
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
  /** Pre-computed rows (group headers + track lanes), in draw order. */
  rows: ReadonlyArray<TimelineRow>;
  scrollTop: number;
  /** Height of the top ruler band in CSS px (0 when hidden). */
  rulerHeight: number;
  showPlayhead: boolean;
  colors: TimelineDrawColors;
  /** Canvas font string for ruler labels, e.g. `10px Inter, sans-serif`. */
  font: string;
  formatTime: (frame: number, fps: number) => string;
  isSelected: (trackId: string, keyframeId: string) => boolean;
  /** Whether a given keyframe is hovered (pointer-over, no active drag). */
  isHovered?: (trackId: string, keyframeId: string) => boolean;
  /** Whether the playhead is currently pointer-hovered (renders a glow). */
  playheadHovered?: boolean;
  /**
   * When provided, draws min / max value labels at the start (or end) of
   * each graph / expanded lane. Used by the `<Timeline.TrackScale />` slot.
   */
  trackScale?: {
    position: 'start' | 'end';
    format: (value: number) => string;
    color?: string;
  };
  renderOverlay?: (
    ctx: CanvasRenderingContext2D,
    info: TimelineDrawInfo
  ) => void;
  /** Active marquee rectangle (box-select) in track-area px, or null. */
  marquee?: { x: number; y: number; width: number; height: number } | null;
  /** Resolved loop region highlighted on the ruler + track area, or null. */
  loopRegion?: { startFrame: number; endFrame: number } | null;
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

/** Graph-mode lane: the track's value curve + keyframe points (+ tangents when selected). */
function drawGraphLane(
  input: TimelineDrawInput,
  track: TimelineTrack,
  top: number,
  rowH: number,
  accent: string
): void {
  const { ctx, size, view, startFrame, endFrame, colors, isSelected } = input;
  const isHovered = input.isHovered ?? ((): boolean => false);
  const range = track.valueRange ?? autoValueRange(track.keyframes);

  // ── Track scale (min / max labels inside the lane)
  if (input.trackScale) {
    const { position, format } = input.trackScale;
    const scaleColor = input.trackScale.color ?? colors.rulerText;
    const minLabel = format(range[0]);
    const maxLabel = format(range[1]);
    ctx.save();
    ctx.fillStyle = scaleColor;
    ctx.font = input.font;
    ctx.textBaseline = 'top';
    ctx.textAlign = position === 'start' ? 'left' : 'right';
    const x = position === 'start' ? 4 : size.width - 4;
    ctx.fillText(maxLabel, x, top + 2);
    ctx.textBaseline = 'bottom';
    ctx.fillText(minLabel, x, top + rowH - 2);
    ctx.restore();
  }
  const curve: CurveData = {
    keyframes: track.keyframes,
    domainX: [startFrame, endFrame],
    domainY: range,
    ...(track.infinity?.pre ? { preInfinity: track.infinity.pre } : {}),
    ...(track.infinity?.post ? { postInfinity: track.infinity.post } : {}),
  };
  const toX = (f: number): number => frameToX(f, view, size.width);

  if (track.keyframes.length > 0) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const samples = Math.max(2, Math.ceil(size.width / 3));
    // Visual safety net: clamp every sampled curve value to the track's
    // range so the line cannot escape the lane even if the data was loaded
    // with control points outside the range (the canonical guarantee comes
    // from clamping handles in `setKeyframeTangent`, but we still clip here
    // so legacy / unconstrained data renders cleanly).
    const lo = range[0];
    const hi = range[1];
    for (let s = 0; s <= samples; s += 1) {
      const px = (s / samples) * size.width;
      const raw = evaluateCurve(curve, xToFrame(px, view, size.width));
      const value = raw < lo ? lo : raw > hi ? hi : raw;
      const py = valueToY(value, range, top, rowH);
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // ── Tangent handles on the selected keyframe (CurveEditor-parity styling)
  for (const kf of track.keyframes) {
    if (kf.id === undefined || !isSelected(track.id, kf.id)) continue;
    if (kf.tangentMode === 'linear' || kf.tangentMode === 'step') continue;
    const x = toX(kf.x);
    if (x < -KEYFRAME_RADIUS * 4 || x > size.width + KEYFRAME_RADIUS * 4)
      continue;
    const y = valueToY(kf.y, range, top, rowH);
    const isAuto = kf.tangentMode === 'auto';
    const lineAlpha = isAuto ? 0.4 : 0.7;
    const dotRadius = isAuto ? 3 : 4;

    const drawHandle = (hx: number, hy: number): void => {
      ctx.save();
      ctx.globalAlpha = lineAlpha;
      ctx.strokeStyle = colors.rulerText;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.rulerText;
      ctx.beginPath();
      ctx.arc(hx, hy, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawHandle(
      toX(kf.x + kf.handleIn.x),
      valueToY(kf.y + kf.handleIn.y, range, top, rowH)
    );
    drawHandle(
      toX(kf.x + kf.handleOut.x),
      valueToY(kf.y + kf.handleOut.y, range, top, rowH)
    );
  }

  // ── Keyframe points (sized by selected / hovered state)
  for (const kf of track.keyframes) {
    const x = toX(kf.x);
    if (x < -KEYFRAME_RADIUS * 2 || x > size.width + KEYFRAME_RADIUS * 2)
      continue;
    const y = valueToY(kf.y, range, top, rowH);
    const selected = kf.id !== undefined && isSelected(track.id, kf.id);
    const hovered = kf.id !== undefined && isHovered(track.id, kf.id);
    const radius = hovered
      ? KEYFRAME_RADIUS + 2
      : selected
        ? KEYFRAME_RADIUS + 1
        : KEYFRAME_RADIUS - 0.5;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = selected ? colors.keyframeSelected : accent;
    ctx.fill();
    ctx.lineWidth = selected ? 1.5 : 1;
    ctx.strokeStyle = colors.keyframeStroke;
    ctx.stroke();
  }
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
    rows,
    scrollTop,
    rulerHeight,
    showPlayhead,
    colors,
    font,
    formatTime,
    isSelected,
    renderOverlay,
    marquee,
    loopRegion,
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

  // ── Loop region ──
  if (loopRegion) {
    const lx = toX(loopRegion.startFrame);
    const rx = toX(loopRegion.endFrame);
    ctx.save();
    ctx.fillStyle = colors.keyframeSelected;
    ctx.globalAlpha = 0.06;
    ctx.fillRect(
      lx,
      rulerHeight,
      rx - lx,
      Math.max(0, size.height - rulerHeight)
    );
    if (rulerHeight > 0) {
      ctx.globalAlpha = 0.22;
      ctx.fillRect(lx, 0, rx - lx, rulerHeight);
    }
    ctx.globalAlpha = 1;
    ctx.fillRect(lx, 0, 2, size.height);
    ctx.fillRect(rx - 2, 0, 2, size.height);
    ctx.restore();
  }

  // ── Track rows + keyframes (clipped to the area below the ruler) ──
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, rulerHeight, size.width, Math.max(0, size.height - rulerHeight));
  ctx.clip();

  for (const row of rows) {
    const top = rulerHeight + row.top - scrollTop;
    // Virtualize: skip rows scrolled out of the track area.
    if (top + row.height < rulerHeight || top > size.height) continue;

    if (row.kind === 'group') {
      ctx.fillStyle = colors.groupHeader;
      ctx.fillRect(0, top, size.width, row.height);
      ctx.fillStyle = colors.rowSeparator;
      ctx.fillRect(0, top + row.height - 1, size.width, 1);
      continue;
    }

    const track = row.track;
    const rowH = row.height;
    ctx.fillStyle = colors.rowSeparator;
    ctx.fillRect(0, top + rowH - 1, size.width, 1);

    const accent = track.color ?? colors.keyframe;
    if (row.graph) {
      drawGraphLane(input, track, top, rowH, accent);
      continue;
    }

    const centerY = top + rowH / 2;
    const hoveredAt = input.isHovered ?? ((): boolean => false);
    for (const kf of track.keyframes) {
      const x = toX(kf.x);
      if (x < -KEYFRAME_RADIUS * 2 || x > size.width + KEYFRAME_RADIUS * 2)
        continue;
      const selected = kf.id !== undefined && isSelected(track.id, kf.id);
      const hovered = kf.id !== undefined && hoveredAt(track.id, kf.id);
      const radius = hovered
        ? KEYFRAME_RADIUS + 2
        : selected
          ? KEYFRAME_RADIUS + 1
          : KEYFRAME_RADIUS;
      diamondPath(ctx, x, centerY, radius);
      ctx.fillStyle = selected ? colors.keyframeSelected : accent;
      ctx.fill();
      ctx.lineWidth = selected ? 1.5 : 1;
      ctx.strokeStyle = colors.keyframeStroke;
      ctx.stroke();
    }
  }

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
    const hovered = input.playheadHovered === true;
    ctx.save();
    if (hovered) {
      ctx.shadowColor = colors.playhead;
      ctx.shadowBlur = 6;
    }
    ctx.strokeStyle = colors.playhead;
    ctx.lineWidth = hovered ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size.height);
    ctx.stroke();
    ctx.restore();

    // Top handle (downward triangle in the ruler band) — bigger on hover so
    // the user can clearly see the grabbable head.
    const baseHead = Math.max(4, Math.min(7, rulerHeight - 2)) || 6;
    const head = hovered ? baseHead + 2 : baseHead;
    ctx.save();
    if (hovered) {
      ctx.shadowColor = colors.playhead;
      ctx.shadowBlur = 6;
    }
    ctx.fillStyle = colors.playhead;
    ctx.beginPath();
    ctx.moveTo(x - head, 0);
    ctx.lineTo(x + head, 0);
    ctx.lineTo(x, head);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
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
