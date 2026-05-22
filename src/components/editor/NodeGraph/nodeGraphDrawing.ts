import type {
  CanvasThemeColors,
  Point2D,
} from '@/components/primitives/canvas/canvas.types';
import type { ViewportLayerDrawInfo } from '@/components/primitives/viewport';
import type { BezierControlPoints, PortPositionLookup } from './nodeGraphMath';
import {
  applyGroupResize,
  getBezierControlPoints,
  resolveEdgeEndpoints,
} from './nodeGraphMath';
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
  getPortPosition: PortPositionLookup,
  theme: NodeGraphDrawTheme
): void {
  // Either a node-drag (`drag-nodes`) or a group-drag carrying contained
  // nodes (`drag-groups.containedNodeIds`) shifts edge endpoints live —
  // resolve to a single (ids, delta) shape so the loop below stays simple.
  let dragSet: { ids: Set<string>; delta: Point2D } | null = null;
  if (interaction.kind === 'drag-nodes') {
    dragSet = {
      ids: new Set(interaction.nodeIds),
      delta: interaction.delta,
    };
  } else if (interaction.kind === 'drag-groups') {
    dragSet = {
      ids: new Set(interaction.containedNodeIds),
      delta: interaction.delta,
    };
  }
  for (const edge of data.edges) {
    const endpoints = resolveEdgeEndpoints(edge, data.nodes, getPortPosition);
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
        : (edge.color ?? theme.edgeStroke);
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
      const next = applyGroupResize(
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
    // The label is rendered by the HTML overlay (`NodeGraphGroupView`) so
    // it stays editable on click and scales with the world transform like
    // the rest of the group body. Canvas no longer paints it — avoids the
    // duplicate-title artefact where a screen-space canvas label and a
    // world-space HTML label drifted apart at non-1 zoom.
  }
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
 * Minimum on-screen distance (in CSS pixels) between adjacent dots / grid
 * lines. When the base `gap × zoom` falls below this, the renderer drops
 * down to a coarser LOD level (effective gap × 2, × 4, …) so the screen
 * never carries more than `viewportArea / (TARGET_SCREEN_GAP²)` elements.
 *
 * Acts like a mip-map level for the background pattern — keeps perf
 * constant under zoom-out instead of scaling quadratically with the world
 * area exposed.
 */
const TARGET_SCREEN_GAP = 18;

/**
 * Lower hard cutoff: when even the coarsest pattern would be denser than
 * this on screen, skip the pattern entirely. Without this, an
 * extreme-zoom-out (e.g. fitting a 100k-node graph in 800px) would still
 * fire pattern-fill operations that the GPU can't sample meaningfully.
 */
const MIN_VISIBLE_SCREEN_GAP = 3;

/**
 * Draw a uniform background pattern across the entire visible viewport.
 * Used by `NodeGraph.Background`.
 *
 * Performance strategy:
 *
 *  1. **LOD** — when zoomed out the world gap is multiplied by the
 *     smallest power-of-two that keeps the on-screen spacing ≥
 *     `TARGET_SCREEN_GAP`. The number of dots/lines drawn per frame is
 *     therefore bounded by `viewportArea / TARGET_SCREEN_GAP²` regardless
 *     of how far the user zooms out.
 *  2. **Pattern fill** — a single off-screen tile is built (one dot or
 *     one crosshair of lines) and used as `ctx.createPattern(…, 'repeat')`.
 *     A single `fillRect` covers the whole viewport, replacing what was
 *     previously O(n) `arc()`/`stroke()` calls. The pattern's origin is
 *     translated so the tile aligns with the world grid.
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

  // Resolve the on-screen spacing the user-supplied world gap would yield
  // at the current zoom, then step up the world gap in powers of two
  // until each cell is at least TARGET_SCREEN_GAP pixels apart on screen.
  const baseScreenGap = options.gap * info.transform.zoom;
  if (baseScreenGap <= 0) return;
  let lodMultiplier = 1;
  while (baseScreenGap * lodMultiplier < TARGET_SCREEN_GAP) {
    lodMultiplier *= 2;
    // Safety: cap LOD at a sensible upper bound so a pathological zoom
    // (e.g. 1e-12) doesn't spin here forever.
    if (lodMultiplier > 1 << 20) break;
  }
  const screenGap = baseScreenGap * lodMultiplier;
  if (screenGap < MIN_VISIBLE_SCREEN_GAP) return;
  const worldGap = options.gap * lodMultiplier;

  const color = options.color ?? theme.borderDefault;

  // World-space origin in screen pixels — the pattern's tile (0,0) must
  // land here so the dots/lines line up with the world grid. Modulo by
  // the tile size to keep the translation in `[0, tileSize)`.
  const origin = info.worldToScreen({ x: 0, y: 0 });
  const alignedTileSize = screenGap;
  const offsetX =
    ((origin.x % alignedTileSize) + alignedTileSize) % alignedTileSize;
  const offsetY =
    ((origin.y % alignedTileSize) + alignedTileSize) % alignedTileSize;

  // Snap the world origin offset to keep dots crisply pixel-aligned at
  // pan time. Sub-pixel pattern positions blur the rendered tile.
  const tx = Math.round(offsetX);
  const ty = Math.round(offsetY);

  if (options.variant === 'dots') {
    const dotRadius = Math.max(0.75, Math.min(1.75, screenGap / 24));
    const tile = buildDotTile(alignedTileSize, dotRadius, color);
    if (!tile) return;
    fillWithPattern(ctx, tile, info.size.width, info.size.height, tx, ty);
  } else {
    const tile = buildGridTile(alignedTileSize, color);
    if (!tile) return;
    ctx.globalAlpha = 0.6;
    fillWithPattern(ctx, tile, info.size.width, info.size.height, tx, ty);
    ctx.globalAlpha = 1;

    // Adapt world gap label exposure via `_` (kept for future LOD label
    // overlays).
    void worldGap;
  }
}

/**
 * Build a single-cell repeating tile with one dot centred inside it.
 * Returns `null` when the environment has no `OffscreenCanvas`/`<canvas>`
 * (e.g. some SSR test runners) so the caller can bail without throwing.
 */
function buildDotTile(
  tileSize: number,
  dotRadius: number,
  color: string
): HTMLCanvasElement | OffscreenCanvas | null {
  const c = createTileCanvas(tileSize);
  if (!c) return null;
  const tctx = c.getContext('2d');
  if (!tctx) return null;
  tctx.clearRect(0, 0, tileSize, tileSize);
  tctx.fillStyle = color;
  tctx.beginPath();
  tctx.arc(tileSize / 2, tileSize / 2, dotRadius, 0, Math.PI * 2);
  tctx.fill();
  return c;
}

/**
 * Build a single-cell repeating tile carrying one vertical + one
 * horizontal line at the right/bottom edge — when tiled this forms a
 * full grid without overlap. Lines are at `tileSize - 0.5` so they fall
 * on whole pixels after the integer-snapped `setTransform` below.
 */
function buildGridTile(
  tileSize: number,
  color: string
): HTMLCanvasElement | OffscreenCanvas | null {
  const c = createTileCanvas(tileSize);
  if (!c) return null;
  const tctx = c.getContext('2d');
  if (!tctx) return null;
  tctx.clearRect(0, 0, tileSize, tileSize);
  tctx.strokeStyle = color;
  tctx.lineWidth = 1;
  // Right edge → vertical line; bottom edge → horizontal line.
  tctx.beginPath();
  tctx.moveTo(tileSize - 0.5, 0);
  tctx.lineTo(tileSize - 0.5, tileSize);
  tctx.moveTo(0, tileSize - 0.5);
  tctx.lineTo(tileSize, tileSize - 0.5);
  tctx.stroke();
  return c;
}

function createTileCanvas(
  size: number
): HTMLCanvasElement | OffscreenCanvas | null {
  const rounded = Math.max(1, Math.round(size));
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(rounded, rounded);
  }
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = rounded;
  c.height = rounded;
  return c;
}

/**
 * Fill the entire viewport with a repeating pattern, translating the
 * pattern origin to `(tx, ty)` so the tile aligns with the world grid.
 * Single canvas call — independent of the number of dots/lines drawn.
 */
function fillWithPattern(
  ctx: CanvasRenderingContext2D,
  tile: HTMLCanvasElement | OffscreenCanvas,
  width: number,
  height: number,
  tx: number,
  ty: number
): void {
  const pattern = ctx.createPattern(
    tile as unknown as CanvasImageSource,
    'repeat'
  );
  if (!pattern) return;
  ctx.save();
  // Move the pattern origin so the first tile starts at (tx, ty) instead
  // of (0, 0). The canvas tracks pattern origin via the current transform.
  ctx.translate(tx, ty);
  ctx.fillStyle = pattern;
  ctx.fillRect(-tx, -ty, width, height);
  ctx.restore();
}
