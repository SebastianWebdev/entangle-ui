import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { WorldRect } from '@/components/primitives/viewport';
import type {
  NodeGraphEdge,
  NodeGraphNode,
  NodeGraphPort,
  NodeGraphPortRef,
  NodeGraphPortSide,
} from './NodeGraph.types';

/**
 * Default node dimensions used when a node omits `width` / `height`. These
 * are deliberately exported so the rendering layer (CSS) and the math
 * layer agree on the implicit size.
 */
export const DEFAULT_NODE_WIDTH = 180;
export const DEFAULT_NODE_HEIGHT = 80;

interface NodeBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Resolve a node's effective bounding box, applying default size when
 * `width` / `height` are unset.
 */
export function getNodeBox(
  node: NodeGraphNode,
  defaults: { width: number; height: number } = {
    width: DEFAULT_NODE_WIDTH,
    height: DEFAULT_NODE_HEIGHT,
  }
): NodeBox {
  return {
    x: node.position.x,
    y: node.position.y,
    width: node.width ?? defaults.width,
    height: node.height ?? defaults.height,
  };
}

/**
 * Compute the offset (in `[0, 1]`) for each port on the same side, mixing
 * explicit `offset` values with even distribution across the remainder.
 *
 * Behaviour:
 * - Ports with explicit `offset` keep their value (clamped to `[0, 1]`).
 * - Ports without an explicit offset are spaced evenly across the side,
 *   ignoring the explicitly-positioned siblings in the distribution.
 *
 * Returns offsets in the same order as the input.
 */
export function resolvePortOffsets(
  portsOnSide: ReadonlyArray<NodeGraphPort>
): number[] {
  const explicit = portsOnSide.map(p =>
    p.offset === undefined ? null : clamp01(p.offset)
  );
  const implicitIndices: number[] = [];
  explicit.forEach((value, i) => {
    if (value === null) implicitIndices.push(i);
  });

  if (implicitIndices.length === 0) {
    return explicit.map(v => v ?? 0.5);
  }

  // Single port without explicit offset → centre it on the side.
  // Multiple → distribute evenly with margins on both ends.
  const step = 1 / (implicitIndices.length + 1);
  const out = explicit.slice();
  implicitIndices.forEach((idx, i) => {
    out[idx] = step * (i + 1);
  });
  return out as number[];
}

/**
 * World-space position of a port. Ports without an explicit offset are
 * spaced evenly across their side (relative to siblings on the same side).
 */
export function getPortPosition(
  node: NodeGraphNode,
  port: NodeGraphPort,
  defaults: { width: number; height: number } = {
    width: DEFAULT_NODE_WIDTH,
    height: DEFAULT_NODE_HEIGHT,
  }
): Point2D {
  const box = getNodeBox(node, defaults);
  const siblings = (node.ports ?? []).filter(p => p.side === port.side);
  const offsets = resolvePortOffsets(siblings);
  const portIndex = siblings.findIndex(p => p.id === port.id);
  const offset =
    portIndex >= 0 ? (offsets[portIndex] ?? 0.5) : (port.offset ?? 0.5);

  switch (port.side) {
    case 'left':
      return { x: box.x, y: box.y + box.height * offset };
    case 'right':
      return { x: box.x + box.width, y: box.y + box.height * offset };
    case 'top':
      return { x: box.x + box.width * offset, y: box.y };
    case 'bottom':
      return { x: box.x + box.width * offset, y: box.y + box.height };
    default: {
      // Exhaustive — TypeScript guarantees this is unreachable.
      const _unreached: never = port.side;
      return _unreached;
    }
  }
}

/**
 * Unit vector pointing away from a port along its side. Used as the
 * tangent direction for the Bézier handle on that endpoint.
 */
export function sideVector(side: NodeGraphPortSide): Point2D {
  switch (side) {
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
    case 'top':
      return { x: 0, y: -1 };
    case 'bottom':
      return { x: 0, y: 1 };
    default: {
      const _unreached: never = side;
      return _unreached;
    }
  }
}

export interface BezierControlPoints {
  /** Source endpoint. */
  p0: Point2D;
  /** Source-side control point. */
  c1: Point2D;
  /** Target-side control point. */
  c2: Point2D;
  /** Target endpoint. */
  p3: Point2D;
}

/**
 * Compute control points for a Cubic Bézier connecting `source` (on side
 * `srcSide`) to `target` (on side `tgtSide`). The handle length scales
 * with the distance between the endpoints, with a floor so short edges
 * still curve visibly.
 */
export function getBezierControlPoints(
  source: Point2D,
  srcSide: NodeGraphPortSide,
  target: Point2D,
  tgtSide: NodeGraphPortSide
): BezierControlPoints {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.hypot(dx, dy);

  // Handle length: floor of 32 world units, scaling 0.5× the relevant
  // axis distance so the curve stays smooth for long edges.
  const srcHorizontal = srcSide === 'left' || srcSide === 'right';
  const tgtHorizontal = tgtSide === 'left' || tgtSide === 'right';
  const srcAxis = srcHorizontal ? Math.abs(dx) : Math.abs(dy);
  const tgtAxis = tgtHorizontal ? Math.abs(dx) : Math.abs(dy);
  const minHandle = 32;
  const srcLen = Math.max(minHandle, srcAxis * 0.5, dist * 0.25);
  const tgtLen = Math.max(minHandle, tgtAxis * 0.5, dist * 0.25);

  const srcVec = sideVector(srcSide);
  const tgtVec = sideVector(tgtSide);

  return {
    p0: source,
    c1: { x: source.x + srcVec.x * srcLen, y: source.y + srcVec.y * srcLen },
    c2: { x: target.x + tgtVec.x * tgtLen, y: target.y + tgtVec.y * tgtLen },
    p3: target,
  };
}

/**
 * Evaluate a Cubic Bézier at parameter `t` in `[0, 1]`.
 */
export function evaluateBezier(cp: BezierControlPoints, t: number): Point2D {
  const it = 1 - t;
  const it2 = it * it;
  const t2 = t * t;
  const w0 = it2 * it;
  const w1 = 3 * it2 * t;
  const w2 = 3 * it * t2;
  const w3 = t2 * t;
  return {
    x: cp.p0.x * w0 + cp.c1.x * w1 + cp.c2.x * w2 + cp.p3.x * w3,
    y: cp.p0.y * w0 + cp.c1.y * w1 + cp.c2.y * w2 + cp.p3.y * w3,
  };
}

/**
 * Test whether a world point is within `threshold` world units of the
 * Bézier curve. Samples the curve at fixed intervals and measures
 * point-to-segment distance.
 */
export function isPointNearBezier(
  point: Point2D,
  cp: BezierControlPoints,
  threshold: number,
  samples = 24
): boolean {
  let prev = cp.p0;
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const curr = evaluateBezier(cp, t);
    if (pointToSegmentDistance(point, prev, curr) <= threshold) return true;
    prev = curr;
  }
  return false;
}

/**
 * Test whether a world point is inside (or on the edge of) a node box.
 */
export function isPointInNode(
  point: Point2D,
  node: NodeGraphNode,
  defaults?: { width: number; height: number }
): boolean {
  const box = getNodeBox(node, defaults);
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

/** True when a rectangle contains a point. */
export function isPointInRect(point: Point2D, rect: WorldRect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/** True when two axis-aligned rectangles overlap (non-strict). */
export function rectsIntersect(a: WorldRect, b: WorldRect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Compute the tight bounding box of a node list, factoring in default
 * sizes. Returns a zero-width rect at the origin when the list is empty.
 */
export function computeNodesBounds(
  nodes: ReadonlyArray<NodeGraphNode>,
  defaults?: { width: number; height: number }
): WorldRect {
  if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const node of nodes) {
    const box = getNodeBox(node, defaults);
    if (box.x < minX) minX = box.x;
    if (box.y < minY) minY = box.y;
    if (box.x + box.width > maxX) maxX = box.x + box.width;
    if (box.y + box.height > maxY) maxY = box.y + box.height;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Snap a world-space delta to the nearest grid increment. Pass `false`
 * for `grid` to return the delta unchanged.
 */
export function snapDelta(delta: Point2D, grid: number | false): Point2D {
  if (grid === false || grid <= 0) return delta;
  return {
    x: Math.round(delta.x / grid) * grid,
    y: Math.round(delta.y / grid) * grid,
  };
}

/** Minimum size (in world units) a group can be resized down to. */
export const MIN_GROUP_SIZE = 32;

/**
 * Compute the new group bounds during a resize gesture, given the
 * original bounds, the cumulative drag delta, and which handle is being
 * dragged. Enforces a minimum size on each axis so the group doesn't
 * collapse to zero.
 */
export function applyGroupResize(
  start: WorldRect,
  handle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w',
  delta: Point2D,
  minSize = MIN_GROUP_SIZE
): WorldRect {
  let { x, y, width, height } = start;

  const movesLeft = handle === 'nw' || handle === 'w' || handle === 'sw';
  const movesRight = handle === 'ne' || handle === 'e' || handle === 'se';
  const movesTop = handle === 'nw' || handle === 'n' || handle === 'ne';
  const movesBottom = handle === 'sw' || handle === 's' || handle === 'se';

  if (movesLeft) {
    const dx = Math.min(delta.x, start.width - minSize);
    x = start.x + dx;
    width = start.width - dx;
  } else if (movesRight) {
    width = Math.max(minSize, start.width + delta.x);
  }
  if (movesTop) {
    const dy = Math.min(delta.y, start.height - minSize);
    y = start.y + dy;
    height = start.height - dy;
  } else if (movesBottom) {
    height = Math.max(minSize, start.height + delta.y);
  }
  return { x, y, width, height };
}

/**
 * Look up a port's world position via its `NodeGraphPortRef`. Returns
 * `null` when the node or port doesn't exist.
 */
export function resolvePortRef(
  ref: NodeGraphPortRef,
  nodes: ReadonlyArray<NodeGraphNode>,
  defaults?: { width: number; height: number }
): { node: NodeGraphNode; port: NodeGraphPort; position: Point2D } | null {
  const node = nodes.find(n => n.id === ref.node);
  if (!node) return null;
  const port = node.ports?.find(p => p.id === ref.port);
  if (!port) return null;
  return { node, port, position: getPortPosition(node, port, defaults) };
}

/**
 * Resolve a port reference plus side, useful for edge-drawing code that
 * needs both the position and the originating side without recomputing.
 */
export function resolveEdgeEndpoints(
  edge: NodeGraphEdge,
  nodes: ReadonlyArray<NodeGraphNode>,
  defaults?: { width: number; height: number }
): {
  source: Point2D;
  srcSide: NodeGraphPortSide;
  target: Point2D;
  tgtSide: NodeGraphPortSide;
} | null {
  const src = resolvePortRef(edge.source, nodes, defaults);
  if (!src) return null;
  const tgt = resolvePortRef(edge.target, nodes, defaults);
  if (!tgt) return null;
  return {
    source: src.position,
    srcSide: src.port.side,
    target: tgt.position,
    tgtSide: tgt.port.side,
  };
}

// ─── Internals ───

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function pointToSegmentDistance(p: Point2D, a: Point2D, b: Point2D): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lenSq = abx * abx + aby * aby;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
}
