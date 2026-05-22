import type {
  CanvasThemeColors,
  Point2D,
} from '@/components/primitives/canvas/canvas.types';
import type { ViewportLayerDrawInfo } from '@/components/primitives/viewport';
import type { BezierControlPoints } from './nodeGraphMath';
import { getBezierControlPoints, resolveEdgeEndpoints } from './nodeGraphMath';
import type {
  NodeGraphDataState,
  NodeGraphInteractionState,
} from './NodeGraphStore';
import type {
  NodeGraphPortRef,
  NodeGraphPortSide,
  NodeGraphSelection,
} from './NodeGraph.types';

export interface NodeGraphDrawTheme extends CanvasThemeColors {
  /** Colour of an unselected, non-hovered edge. */
  edgeStroke: string;
  /** Colour of a selected edge. */
  edgeStrokeSelected: string;
  /** Colour of the hovered edge. */
  edgeStrokeHovered: string;
  /** Colour of the in-flight connection preview. */
  previewStroke: string;
  /** Colour of an in-flight connection rejected by `isValidConnection`. */
  previewStrokeInvalid: string;
  /** Group backdrop fill. */
  groupFill: string;
  /** Group backdrop fill when selected. */
  groupFillSelected: string;
  /** Group outline colour. */
  groupStroke: string;
  /** Group label colour. */
  groupLabel: string;
}

/** Stroke widths in *screen* pixels — independent of zoom. */
const EDGE_STROKE_WIDTH = 1.5;
const EDGE_STROKE_WIDTH_SELECTED = 2.5;
const EDGE_STROKE_WIDTH_HOVERED = 2;
const PREVIEW_STROKE_WIDTH = 2;
const GROUP_STROKE_WIDTH = 1;

/**
 * Stroke a cubic Bézier to the given context. The control points are in
 * screen coordinates (already transformed by the caller).
 */
function strokeBezier(
  ctx: CanvasRenderingContext2D,
  cp: BezierControlPoints
): void {
  ctx.beginPath();
  ctx.moveTo(cp.p0.x, cp.p0.y);
  ctx.bezierCurveTo(cp.c1.x, cp.c1.y, cp.c2.x, cp.c2.y, cp.p3.x, cp.p3.y);
  ctx.stroke();
}

function toScreenCp(
  cp: BezierControlPoints,
  worldToScreen: (p: Point2D) => Point2D
): BezierControlPoints {
  return {
    p0: worldToScreen(cp.p0),
    c1: worldToScreen(cp.c1),
    c2: worldToScreen(cp.c2),
    p3: worldToScreen(cp.p3),
  };
}

/** Draw all edges in the graph. */
export function drawEdges(
  ctx: CanvasRenderingContext2D,
  info: ViewportLayerDrawInfo,
  data: NodeGraphDataState,
  selection: NodeGraphSelection,
  hoveredEdgeId: string | null,
  interaction: NodeGraphInteractionState,
  theme: NodeGraphDrawTheme
): void {
  const dragSet =
    interaction.kind === 'drag-nodes'
      ? { ids: new Set(interaction.nodeIds), delta: interaction.delta }
      : null;
  for (const edge of data.edges) {
    const endpoints = resolveEdgeEndpoints(
      edge,
      data.nodes,
      data.defaultNodeSize
    );
    if (!endpoints) continue;

    // Apply the in-flight drag delta so edges follow nodes 1:1 during a drag,
    // instead of snapping to the new position on pointerup.
    const source = dragSet?.ids.has(edge.source.node)
      ? {
          x: endpoints.source.x + dragSet.delta.x,
          y: endpoints.source.y + dragSet.delta.y,
        }
      : endpoints.source;
    const target = dragSet?.ids.has(edge.target.node)
      ? {
          x: endpoints.target.x + dragSet.delta.x,
          y: endpoints.target.y + dragSet.delta.y,
        }
      : endpoints.target;

    const cpWorld = getBezierControlPoints(
      source,
      endpoints.srcSide,
      target,
      endpoints.tgtSide
    );
    const cpScreen = toScreenCp(cpWorld, p => info.worldToScreen(p));

    const isSelected = selection.edges.includes(edge.id);
    const isHovered = hoveredEdgeId === edge.id;

    ctx.strokeStyle = isSelected
      ? theme.edgeStrokeSelected
      : isHovered
        ? theme.edgeStrokeHovered
        : theme.edgeStroke;
    ctx.lineWidth = isSelected
      ? EDGE_STROKE_WIDTH_SELECTED
      : isHovered
        ? EDGE_STROKE_WIDTH_HOVERED
        : EDGE_STROKE_WIDTH;
    ctx.lineCap = 'round';

    strokeBezier(ctx, cpScreen);
  }
}

/** Draw group backdrops (under nodes, under edges). */
export function drawGroups(
  ctx: CanvasRenderingContext2D,
  info: ViewportLayerDrawInfo,
  data: NodeGraphDataState,
  selection: NodeGraphSelection,
  interaction: NodeGraphInteractionState,
  theme: NodeGraphDrawTheme
): void {
  // Live drag / resize support — mirror what the HTML overlay shows so the
  // canvas backdrop stays glued to the user's cursor during gestures.
  const dragSet =
    interaction.kind === 'drag-groups'
      ? { ids: new Set(interaction.groupIds), delta: interaction.delta }
      : null;
  const resizing = interaction.kind === 'resize-group' ? interaction : null;

  for (const group of data.groups) {
    let bx = group.bounds.x;
    let by = group.bounds.y;
    let bw = group.bounds.width;
    let bh = group.bounds.height;
    if (dragSet?.ids.has(group.id)) {
      bx += dragSet.delta.x;
      by += dragSet.delta.y;
    } else if (resizing?.groupId === group.id) {
      const next = applyResizeForDraw(
        resizing.startBounds,
        resizing.handle,
        resizing.delta
      );
      bx = next.x;
      by = next.y;
      bw = next.width;
      bh = next.height;
    }

    const tl = info.worldToScreen({ x: bx, y: by });
    const br = info.worldToScreen({ x: bx + bw, y: by + bh });
    const width = br.x - tl.x;
    const height = br.y - tl.y;
    if (width <= 0 || height <= 0) continue;

    const isSelected = selection.groups.includes(group.id);

    ctx.fillStyle =
      group.color ?? (isSelected ? theme.groupFillSelected : theme.groupFill);
    ctx.fillRect(tl.x, tl.y, width, height);

    ctx.strokeStyle = group.color ?? theme.groupStroke;
    ctx.lineWidth = GROUP_STROKE_WIDTH;
    ctx.strokeRect(tl.x + 0.5, tl.y + 0.5, width - 1, height - 1);

    if (group.label) {
      ctx.fillStyle = theme.groupLabel;
      ctx.font = `${theme.fontSizeXs}px ${getFontFamily(ctx)}`;
      ctx.textBaseline = 'bottom';
      ctx.fillText(group.label, tl.x + 6, tl.y - 4);
    }
  }
}

/**
 * Mirror of `applyGroupResize` from `nodeGraphMath.ts` — inlined here to
 * avoid a circular import (the drawing module is the leaf of the
 * dependency graph and shouldn't pull in math.ts's full surface). Keep
 * the two in sync.
 */
function applyResizeForDraw(
  start: { x: number; y: number; width: number; height: number },
  handle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w',
  delta: { x: number; y: number }
): { x: number; y: number; width: number; height: number } {
  const MIN_SIZE = 32;
  let { x, y, width, height } = start;
  const movesLeft = handle === 'nw' || handle === 'w' || handle === 'sw';
  const movesRight = handle === 'ne' || handle === 'e' || handle === 'se';
  const movesTop = handle === 'nw' || handle === 'n' || handle === 'ne';
  const movesBottom = handle === 'sw' || handle === 's' || handle === 'se';
  if (movesLeft) {
    const dx = Math.min(delta.x, start.width - MIN_SIZE);
    x = start.x + dx;
    width = start.width - dx;
  } else if (movesRight) {
    width = Math.max(MIN_SIZE, start.width + delta.x);
  }
  if (movesTop) {
    const dy = Math.min(delta.y, start.height - MIN_SIZE);
    y = start.y + dy;
    height = start.height - dy;
  } else if (movesBottom) {
    height = Math.max(MIN_SIZE, start.height + delta.y);
  }
  return { x, y, width, height };
}

function getFontFamily(ctx: CanvasRenderingContext2D): string {
  // Read current font, but if blank fall back to a sensible UI stack so the
  // group label stays legible regardless of canvas state.
  const current = ctx.font;
  if (!current || current === '10px sans-serif') {
    return 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  }
  const parts = current.split(' ');
  return parts.slice(1).join(' ') || 'system-ui, sans-serif';
}

/**
 * Draw the in-flight connection preview — a Bézier from the source port to
 * the current pointer position, styled to indicate validity.
 */
export function drawConnectionPreview(
  ctx: CanvasRenderingContext2D,
  info: ViewportLayerDrawInfo,
  interaction: NodeGraphInteractionState,
  resolveSourcePort: (
    ref: NodeGraphPortRef
  ) => { position: Point2D; side: NodeGraphPortSide } | null,
  theme: NodeGraphDrawTheme
): void {
  if (interaction.kind !== 'connect') return;
  const src = resolveSourcePort(interaction.source);
  if (!src) return;

  // The "target" side for the preview curve mirrors the source so the curve
  // pulls toward the cursor naturally even when the cursor is free-floating.
  const tgtSide = oppositeSide(src.side);
  const cpWorld = getBezierControlPoints(
    src.position,
    src.side,
    interaction.currentWorld,
    tgtSide
  );
  const cpScreen = toScreenCp(cpWorld, p => info.worldToScreen(p));

  ctx.strokeStyle = interaction.invalid
    ? theme.previewStrokeInvalid
    : theme.previewStroke;
  ctx.lineWidth = PREVIEW_STROKE_WIDTH;
  ctx.lineCap = 'round';
  ctx.setLineDash(interaction.invalid ? [6, 4] : []);

  strokeBezier(ctx, cpScreen);

  ctx.setLineDash([]);

  // Endpoint marker at the cursor — small circle so the user sees the
  // pointer-snap target.
  const cursorScreen = info.worldToScreen(interaction.currentWorld);
  ctx.beginPath();
  ctx.arc(cursorScreen.x, cursorScreen.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = interaction.invalid
    ? theme.previewStrokeInvalid
    : theme.previewStroke;
  ctx.fill();
}

function oppositeSide(side: NodeGraphPortSide): NodeGraphPortSide {
  switch (side) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    default: {
      const _unreached: never = side;
      return _unreached;
    }
  }
}

/** Resolved canvas-drawing theme assembled from the base theme + overrides. */
export function buildDrawTheme(base: CanvasThemeColors): NodeGraphDrawTheme {
  return {
    ...base,
    edgeStroke: base.textMuted,
    edgeStrokeSelected: base.accentPrimary,
    edgeStrokeHovered: base.textSecondary,
    previewStroke: base.accentPrimary,
    previewStrokeInvalid: 'rgba(220, 38, 38, 0.9)',
    groupFill: 'rgba(255, 255, 255, 0.03)',
    groupFillSelected: 'rgba(255, 255, 255, 0.05)',
    groupStroke: base.borderDefault,
    groupLabel: base.textSecondary,
  };
}

// ─── Background pattern (dots / grid) ───

export interface BackgroundDrawOptions {
  variant: 'dots' | 'grid' | 'none';
  /** Grid spacing in world units. */
  gap: number;
  /** Override pattern colour (defaults to theme.borderDefault). */
  color?: string;
  /** Override background fill (defaults to theme.backgroundSecondary). */
  background?: string;
}

/**
 * Draw a uniform background pattern across the entire visible viewport.
 * Used by `NodeGraph.Background`. The pattern density adapts to the zoom
 * level: when dots/lines would become too dense to be legible, the pattern
 * is skipped for the current frame.
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  info: ViewportLayerDrawInfo,
  theme: NodeGraphDrawTheme,
  options: BackgroundDrawOptions
): void {
  const background = options.background ?? theme.backgroundSecondary;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, info.size.width, info.size.height);

  if (options.variant === 'none' || options.gap <= 0) return;

  const screenGap = options.gap * info.transform.zoom;
  if (screenGap < 4) return; // too dense to be useful

  const color = options.color ?? theme.borderDefault;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;

  // Top-left world point that's just outside the viewport.
  const worldTL = info.screenToWorld({ x: 0, y: 0 });
  const worldBR = info.screenToWorld({
    x: info.size.width,
    y: info.size.height,
  });
  const startX = Math.floor(worldTL.x / options.gap) * options.gap;
  const startY = Math.floor(worldTL.y / options.gap) * options.gap;

  if (options.variant === 'dots') {
    const dotRadius = Math.max(0.5, Math.min(1.5, screenGap / 30));
    for (let x = startX; x <= worldBR.x; x += options.gap) {
      for (let y = startY; y <= worldBR.y; y += options.gap) {
        const screen = info.worldToScreen({ x, y });
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    // Grid lines: full screen span for each grid intersection.
    ctx.globalAlpha = 0.6;
    for (let x = startX; x <= worldBR.x; x += options.gap) {
      const screen = info.worldToScreen({ x, y: 0 });
      ctx.beginPath();
      ctx.moveTo(screen.x + 0.5, 0);
      ctx.lineTo(screen.x + 0.5, info.size.height);
      ctx.stroke();
    }
    for (let y = startY; y <= worldBR.y; y += options.gap) {
      const screen = info.worldToScreen({ x: 0, y });
      ctx.beginPath();
      ctx.moveTo(0, screen.y + 0.5);
      ctx.lineTo(info.size.width, screen.y + 0.5);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
