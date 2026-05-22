import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type { WorldRect } from '@/components/primitives/viewport';
import type {
  NodeGraphEdge,
  NodeGraphNode,
  NodeGraphPortRef,
  NodeGraphPortSide,
} from './NodeGraph.types';
import type {
  NodeGraphMeasuredSize,
  NodeGraphPortPosition,
} from './NodeGraphStore';

/**
 * Fallback size used when a node has no measured DOM size yet (first paint
 * before `ResizeObserver` has fired) and no explicit `node.width`/`height`.
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
 * Read the function used to look up the registered port position. Pure
 * resolver — the math module takes this as an argument so it stays free
 * of a store dependency.
 */
export type PortPositionLookup = (
  nodeId: string,
  portId: string
) => NodeGraphPortPosition | null;

/** Read the measured size of a node wrapper (or null if not measured yet). */
export type MeasuredSizeLookup = (
  nodeId: string
) => NodeGraphMeasuredSize | null;

/**
 * Resolve a node's effective bounding box.
 *
 * Priority: explicit `node.width`/`node.height` > measured DOM size >
 * `defaults`. This keeps consumer-controlled fixed-size nodes deterministic
 * while letting auto-sized nodes pick up their real dimensions for
 * hit-testing, marquee selection, and `fitToContent`.
 */
export function getNodeBox(
  node: NodeGraphNode,
  measuredSize?: NodeGraphMeasuredSize | null,
  defaults: { width: number; height: number } = {
    width: DEFAULT_NODE_WIDTH,
    height: DEFAULT_NODE_HEIGHT,
  }
): NodeBox {
  return {
    x: node.position.x,
    y: node.position.y,
    width: node.width ?? measuredSize?.width ?? defaults.width,
    height: node.height ?? measuredSize?.height ?? defaults.height,
  };
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
  measuredSize?: NodeGraphMeasuredSize | null,
  defaults?: { width: number; height: number }
): boolean {
  const box = getNodeBox(node, measuredSize, defaults);
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
 * Compute the tight bounding box of a node list, factoring in measured /
 * default sizes. Returns a zero-width rect at the origin when the list
 * is empty.
 */
export function computeNodesBounds(
  nodes: ReadonlyArray<NodeGraphNode>,
  measuredSizes?: MeasuredSizeLookup,
  defaults?: { width: number; height: number }
): WorldRect {
  if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const node of nodes) {
    const box = getNodeBox(node, measuredSizes?.(node.id), defaults);
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
 * Resolve a port reference to its **world-space** position + side using
 * the slot-registered port position lookup. Returns `null` when the node
 * is missing or the port hasn't been measured yet (the slot's
 * `useLayoutEffect` hasn't run).
 */
export function resolvePortRef(
  ref: NodeGraphPortRef,
  nodes: ReadonlyArray<NodeGraphNode>,
  getPortPosition: PortPositionLookup
): {
  node: NodeGraphNode;
  position: Point2D;
  side: NodeGraphPortSide;
  dataType?: string;
} | null {
  const node = nodes.find(n => n.id === ref.node);
  if (!node) return null;
  const portPos = getPortPosition(ref.node, ref.port);
  if (!portPos) return null;
  return {
    node,
    position: {
      x: node.position.x + portPos.x,
      y: node.position.y + portPos.y,
    },
    side: portPos.side,
    ...(portPos.dataType !== undefined ? { dataType: portPos.dataType } : {}),
  };
}

/**
 * Resolve both endpoints of an edge to world-space positions + sides.
 * Returns `null` when either endpoint can't be resolved (missing node or
 * not-yet-measured port).
 */
export function resolveEdgeEndpoints(
  edge: NodeGraphEdge,
  nodes: ReadonlyArray<NodeGraphNode>,
  getPortPosition: PortPositionLookup
): {
  source: Point2D;
  srcSide: NodeGraphPortSide;
  target: Point2D;
  tgtSide: NodeGraphPortSide;
} | null {
  const src = resolvePortRef(edge.source, nodes, getPortPosition);
  if (!src) return null;
  const tgt = resolvePortRef(edge.target, nodes, getPortPosition);
  if (!tgt) return null;
  return {
    source: src.position,
    srcSide: src.side,
    target: tgt.position,
    tgtSide: tgt.side,
  };
}

// ─── Internals ───

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
