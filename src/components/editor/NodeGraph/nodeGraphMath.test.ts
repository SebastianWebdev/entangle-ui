import { describe, it, expect } from 'vitest';
import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  MIN_GROUP_SIZE,
  applyGroupResize,
  computeNodesBounds,
  evaluateBezier,
  getBezierControlPoints,
  getNodeBox,
  isPointInNode,
  isPointInRect,
  isPointNearBezier,
  rectsIntersect,
  resolveEdgeEndpoints,
  resolvePortRef,
  sideVector,
  snapDelta,
  type PortPositionLookup,
} from './nodeGraphMath';
import type { NodeGraphEdge, NodeGraphNode } from './NodeGraph.types';
import type { NodeGraphPortPosition } from './NodeGraphStore';

const makeNode = (overrides: Partial<NodeGraphNode> = {}): NodeGraphNode => ({
  id: 'n1',
  position: { x: 0, y: 0 },
  width: 100,
  height: 60,
  ...overrides,
});

/**
 * Build a `PortPositionLookup` from a per-node port table. Lets each test
 * pre-register the ports it cares about without touching a real store.
 */
function makeLookup(
  table: Record<string, Record<string, NodeGraphPortPosition>>
): PortPositionLookup {
  return (nodeId, portId) => table[nodeId]?.[portId] ?? null;
}

describe('getNodeBox', () => {
  it('uses explicit width/height when present', () => {
    expect(getNodeBox(makeNode({ width: 200, height: 120 }))).toEqual({
      x: 0,
      y: 0,
      width: 200,
      height: 120,
    });
  });

  it('prefers the measured DOM size when node.width/height are absent', () => {
    const node: NodeGraphNode = { id: 'n', position: { x: 5, y: 7 } };
    const box = getNodeBox(node, { width: 220, height: 140 });
    expect(box).toEqual({ x: 5, y: 7, width: 220, height: 140 });
  });

  it('falls back to default size when neither override nor measurement is available', () => {
    const node: NodeGraphNode = { id: 'n', position: { x: 5, y: 7 } };
    const box = getNodeBox(node, null);
    expect(box).toEqual({
      x: 5,
      y: 7,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
    });
  });

  it('keeps the explicit override even when a measured size exists', () => {
    const node = makeNode({ width: 50, height: 25 });
    expect(getNodeBox(node, { width: 999, height: 999 })).toEqual({
      x: 0,
      y: 0,
      width: 50,
      height: 25,
    });
  });

  it('accepts a custom defaults object', () => {
    const node: NodeGraphNode = { id: 'n', position: { x: 0, y: 0 } };
    expect(getNodeBox(node, null, { width: 50, height: 25 })).toEqual({
      x: 0,
      y: 0,
      width: 50,
      height: 25,
    });
  });
});

describe('sideVector', () => {
  it('points outward perpendicular to the side', () => {
    expect(sideVector('left')).toEqual({ x: -1, y: 0 });
    expect(sideVector('right')).toEqual({ x: 1, y: 0 });
    expect(sideVector('top')).toEqual({ x: 0, y: -1 });
    expect(sideVector('bottom')).toEqual({ x: 0, y: 1 });
  });
});

describe('getBezierControlPoints', () => {
  it('orients the source handle along sideVector(srcSide)', () => {
    const cp = getBezierControlPoints(
      { x: 0, y: 0 },
      'right',
      { x: 200, y: 0 },
      'left'
    );
    expect(cp.c1.x).toBeGreaterThan(cp.p0.x);
    expect(cp.c1.y).toBe(cp.p0.y);
    expect(cp.c2.x).toBeLessThan(cp.p3.x);
    expect(cp.c2.y).toBe(cp.p3.y);
  });

  it('uses a minimum handle length even for very short edges', () => {
    const cp = getBezierControlPoints(
      { x: 0, y: 0 },
      'right',
      { x: 5, y: 0 },
      'left'
    );
    expect(cp.c1.x - cp.p0.x).toBeGreaterThanOrEqual(32);
  });

  it('scales handle length with edge distance', () => {
    const shortCp = getBezierControlPoints(
      { x: 0, y: 0 },
      'right',
      { x: 100, y: 0 },
      'left'
    );
    const longCp = getBezierControlPoints(
      { x: 0, y: 0 },
      'right',
      { x: 1000, y: 0 },
      'left'
    );
    expect(longCp.c1.x - longCp.p0.x).toBeGreaterThan(
      shortCp.c1.x - shortCp.p0.x
    );
  });
});

describe('evaluateBezier', () => {
  const cp = {
    p0: { x: 0, y: 0 },
    c1: { x: 0, y: 100 },
    c2: { x: 100, y: 100 },
    p3: { x: 100, y: 0 },
  };

  it('returns p0 at t=0', () => {
    expect(evaluateBezier(cp, 0)).toEqual({ x: 0, y: 0 });
  });

  it('returns p3 at t=1', () => {
    expect(evaluateBezier(cp, 1)).toEqual({ x: 100, y: 0 });
  });

  it('produces an arc that bulges away from the chord at t=0.5', () => {
    const mid = evaluateBezier(cp, 0.5);
    expect(mid.x).toBeCloseTo(50);
    expect(mid.y).toBeGreaterThan(0);
  });
});

describe('isPointNearBezier', () => {
  const cp = getBezierControlPoints(
    { x: 0, y: 0 },
    'right',
    { x: 100, y: 100 },
    'left'
  );

  it('returns true for points on the curve', () => {
    const mid = evaluateBezier(cp, 0.5);
    expect(isPointNearBezier(mid, cp, 1)).toBe(true);
  });

  it('returns false for points well away from the curve', () => {
    expect(isPointNearBezier({ x: -100, y: -100 }, cp, 5)).toBe(false);
  });

  it('uses the threshold to grow the hit area', () => {
    const offCurve = { x: 50, y: 30 };
    expect(isPointNearBezier(offCurve, cp, 1)).toBe(false);
    expect(isPointNearBezier(offCurve, cp, 60)).toBe(true);
  });
});

describe('hit-testing helpers', () => {
  const node = makeNode({
    position: { x: 10, y: 10 },
    width: 100,
    height: 50,
  });

  it('isPointInNode returns true for points inside the bounding box', () => {
    expect(isPointInNode({ x: 50, y: 30 }, node)).toBe(true);
  });

  it('isPointInNode returns true on the edges', () => {
    expect(isPointInNode({ x: 10, y: 10 }, node)).toBe(true);
    expect(isPointInNode({ x: 110, y: 60 }, node)).toBe(true);
  });

  it('isPointInNode returns false for outside points', () => {
    expect(isPointInNode({ x: 0, y: 0 }, node)).toBe(false);
    expect(isPointInNode({ x: 200, y: 200 }, node)).toBe(false);
  });

  it('isPointInNode uses the measured size when node has no width/height', () => {
    const auto: NodeGraphNode = { id: 'auto', position: { x: 0, y: 0 } };
    expect(
      isPointInNode({ x: 30, y: 30 }, auto, { width: 50, height: 50 })
    ).toBe(true);
    expect(
      isPointInNode({ x: 80, y: 30 }, auto, { width: 50, height: 50 })
    ).toBe(false);
  });

  it('isPointInRect detects containment', () => {
    expect(
      isPointInRect({ x: 5, y: 5 }, { x: 0, y: 0, width: 10, height: 10 })
    ).toBe(true);
    expect(
      isPointInRect({ x: 20, y: 5 }, { x: 0, y: 0, width: 10, height: 10 })
    ).toBe(false);
  });

  it('rectsIntersect detects overlap', () => {
    expect(
      rectsIntersect(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 }
      )
    ).toBe(true);
    expect(
      rectsIntersect(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 20, y: 20, width: 5, height: 5 }
      )
    ).toBe(false);
  });
});

describe('computeNodesBounds', () => {
  it('returns a zero rect for an empty list', () => {
    expect(computeNodesBounds([])).toEqual({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  });

  it('returns the tight box around all nodes', () => {
    const bounds = computeNodesBounds([
      makeNode({ id: 'a', position: { x: 0, y: 0 }, width: 100, height: 50 }),
      makeNode({
        id: 'b',
        position: { x: 200, y: 100 },
        width: 80,
        height: 40,
      }),
    ]);
    expect(bounds).toEqual({ x: 0, y: 0, width: 280, height: 140 });
  });

  it('uses measured sizes for auto-sized nodes', () => {
    const nodes: NodeGraphNode[] = [
      { id: 'a', position: { x: 0, y: 0 } },
      { id: 'b', position: { x: 100, y: 100 } },
    ];
    const sizes: Record<string, { width: number; height: number }> = {
      a: { width: 120, height: 40 },
      b: { width: 60, height: 30 },
    };
    const bounds = computeNodesBounds(nodes, id => sizes[id] ?? null);
    expect(bounds).toEqual({ x: 0, y: 0, width: 160, height: 130 });
  });

  it('falls back to default size when a node has no measurement', () => {
    const bounds = computeNodesBounds([{ id: 'a', position: { x: 0, y: 0 } }]);
    expect(bounds).toEqual({
      x: 0,
      y: 0,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
    });
  });
});

describe('snapDelta', () => {
  it('returns the delta unchanged when grid is false', () => {
    expect(snapDelta({ x: 3.5, y: 4.7 }, false)).toEqual({ x: 3.5, y: 4.7 });
  });

  it('rounds to the nearest grid step', () => {
    expect(snapDelta({ x: 13, y: -27 }, 10)).toEqual({ x: 10, y: -30 });
  });

  it('treats non-positive grid sizes as disabled', () => {
    expect(snapDelta({ x: 1.5, y: 2.5 }, 0)).toEqual({ x: 1.5, y: 2.5 });
  });
});

describe('applyGroupResize', () => {
  const start = { x: 100, y: 100, width: 200, height: 100 };

  it('grows from the east handle along +x', () => {
    expect(applyGroupResize(start, 'e', { x: 30, y: 0 })).toEqual({
      x: 100,
      y: 100,
      width: 230,
      height: 100,
    });
  });

  it('shrinks from the west handle by moving x and reducing width', () => {
    expect(applyGroupResize(start, 'w', { x: 30, y: 0 })).toEqual({
      x: 130,
      y: 100,
      width: 170,
      height: 100,
    });
  });

  it('enforces MIN_GROUP_SIZE in both directions', () => {
    const tiny = applyGroupResize(start, 'e', { x: -1000, y: 0 });
    expect(tiny.width).toBe(MIN_GROUP_SIZE);
    const tinyW = applyGroupResize(start, 'w', { x: 1000, y: 0 });
    expect(tinyW.width).toBe(MIN_GROUP_SIZE);
    expect(tinyW.x).toBe(start.x + start.width - MIN_GROUP_SIZE);
  });

  it('handles compound corner handles', () => {
    expect(applyGroupResize(start, 'se', { x: 20, y: 10 })).toEqual({
      x: 100,
      y: 100,
      width: 220,
      height: 110,
    });
    expect(applyGroupResize(start, 'nw', { x: 20, y: 10 })).toEqual({
      x: 120,
      y: 110,
      width: 180,
      height: 90,
    });
  });
});

describe('resolvePortRef / resolveEdgeEndpoints', () => {
  const nodes: NodeGraphNode[] = [
    { id: 'a', position: { x: 0, y: 0 }, width: 100, height: 50 },
    { id: 'b', position: { x: 300, y: 0 }, width: 100, height: 50 },
  ];
  const nodeIndex = new Map(nodes.map(n => [n.id, n]));
  const getNodeById = (id: string): NodeGraphNode | undefined =>
    nodeIndex.get(id);

  const lookup = makeLookup({
    a: { out: { x: 100, y: 25, side: 'right', dataType: 'exec' } },
    b: { in: { x: 0, y: 25, side: 'left', dataType: 'exec' } },
  });

  it('resolves a port reference to its world position', () => {
    const ref = resolvePortRef({ node: 'a', port: 'out' }, getNodeById, lookup);
    expect(ref).not.toBeNull();
    expect(ref?.position).toEqual({ x: 100, y: 25 });
    expect(ref?.side).toBe('right');
    expect(ref?.dataType).toBe('exec');
  });

  it('returns null for an unknown node', () => {
    expect(
      resolvePortRef({ node: 'x', port: 'out' }, getNodeById, lookup)
    ).toBeNull();
  });

  it('returns null for a port that has not been measured yet', () => {
    expect(
      resolvePortRef({ node: 'a', port: 'unmeasured' }, getNodeById, lookup)
    ).toBeNull();
  });

  it('resolves both endpoints of an edge', () => {
    const edge: NodeGraphEdge = {
      id: 'e1',
      source: { node: 'a', port: 'out' },
      target: { node: 'b', port: 'in' },
    };
    const endpoints = resolveEdgeEndpoints(edge, getNodeById, lookup);
    expect(endpoints).toEqual({
      source: { x: 100, y: 25 },
      srcSide: 'right',
      target: { x: 300, y: 25 },
      tgtSide: 'left',
    });
  });

  it('returns null when either endpoint is missing', () => {
    const edge: NodeGraphEdge = {
      id: 'e1',
      source: { node: 'a', port: 'out' },
      target: { node: 'x', port: 'in' },
    };
    expect(resolveEdgeEndpoints(edge, getNodeById, lookup)).toBeNull();
  });

  it('omits dataType from the resolved ref when not set on the port position', () => {
    const noTypeLookup = makeLookup({
      a: { out: { x: 100, y: 25, side: 'right' } },
    });
    const ref = resolvePortRef(
      { node: 'a', port: 'out' },
      getNodeById,
      noTypeLookup
    );
    expect(ref?.dataType).toBeUndefined();
  });
});

describe('applyGroupResize', () => {
  const start = { x: 100, y: 100, width: 200, height: 120 };

  it('moves only width when dragging the east handle', () => {
    expect(applyGroupResize(start, 'e', { x: 30, y: 0 })).toEqual({
      x: 100,
      y: 100,
      width: 230,
      height: 120,
    });
  });

  it('moves only height when dragging the south handle', () => {
    expect(applyGroupResize(start, 's', { x: 0, y: 40 })).toEqual({
      x: 100,
      y: 100,
      width: 200,
      height: 160,
    });
  });

  it('shifts origin and shrinks width when dragging the west handle', () => {
    expect(applyGroupResize(start, 'w', { x: 30, y: 0 })).toEqual({
      x: 130,
      y: 100,
      width: 170,
      height: 120,
    });
  });

  it('shifts origin and shrinks height when dragging the north handle', () => {
    expect(applyGroupResize(start, 'n', { x: 0, y: 20 })).toEqual({
      x: 100,
      y: 120,
      width: 200,
      height: 100,
    });
  });

  it('resizes both axes for the south-east handle', () => {
    expect(applyGroupResize(start, 'se', { x: 10, y: 20 })).toEqual({
      x: 100,
      y: 100,
      width: 210,
      height: 140,
    });
  });

  it('shifts origin on both axes for the north-west handle', () => {
    expect(applyGroupResize(start, 'nw', { x: 20, y: 10 })).toEqual({
      x: 120,
      y: 110,
      width: 180,
      height: 110,
    });
  });

  it('shifts x for the north-east handle but keeps origin x', () => {
    expect(applyGroupResize(start, 'ne', { x: 30, y: 10 })).toEqual({
      x: 100,
      y: 110,
      width: 230,
      height: 110,
    });
  });

  it('shifts y for the south-west handle but keeps origin y', () => {
    expect(applyGroupResize(start, 'sw', { x: 20, y: 30 })).toEqual({
      x: 120,
      y: 100,
      width: 180,
      height: 150,
    });
  });

  it('clamps width to MIN_GROUP_SIZE when collapsing from the east', () => {
    const next = applyGroupResize(start, 'e', { x: -10000, y: 0 });
    expect(next.width).toBe(MIN_GROUP_SIZE);
    expect(next.x).toBe(100); // east handle doesn't move origin
  });

  it('clamps width to MIN_GROUP_SIZE when collapsing from the west', () => {
    const next = applyGroupResize(start, 'w', { x: 10000, y: 0 });
    expect(next.width).toBe(MIN_GROUP_SIZE);
    // origin shifted by (start.width - MIN_GROUP_SIZE)
    expect(next.x).toBe(start.x + (start.width - MIN_GROUP_SIZE));
  });

  it('clamps height to MIN_GROUP_SIZE when collapsing from the south', () => {
    const next = applyGroupResize(start, 's', { x: 0, y: -10000 });
    expect(next.height).toBe(MIN_GROUP_SIZE);
    expect(next.y).toBe(100);
  });

  it('clamps height to MIN_GROUP_SIZE when collapsing from the north', () => {
    const next = applyGroupResize(start, 'n', { x: 0, y: 10000 });
    expect(next.height).toBe(MIN_GROUP_SIZE);
    expect(next.y).toBe(start.y + (start.height - MIN_GROUP_SIZE));
  });

  it('honours an explicit minSize override', () => {
    const next = applyGroupResize(start, 'e', { x: -10000, y: 0 }, 80);
    expect(next.width).toBe(80);
  });
});
