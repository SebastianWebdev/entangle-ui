import { describe, it, expect } from 'vitest';
import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  computeNodesBounds,
  evaluateBezier,
  getBezierControlPoints,
  getNodeBox,
  getPortPosition,
  isPointInNode,
  isPointInRect,
  isPointNearBezier,
  rectsIntersect,
  resolveEdgeEndpoints,
  resolvePortOffsets,
  resolvePortRef,
  sideVector,
  snapDelta,
} from './nodeGraphMath';
import type {
  NodeGraphEdge,
  NodeGraphNode,
  NodeGraphPort,
} from './NodeGraph.types';

const makeNode = (overrides: Partial<NodeGraphNode> = {}): NodeGraphNode => ({
  id: 'n1',
  position: { x: 0, y: 0 },
  width: 100,
  height: 60,
  ...overrides,
});

const port = (
  overrides: Partial<NodeGraphPort> & Pick<NodeGraphPort, 'id' | 'side'>
): NodeGraphPort => ({
  ...overrides,
});

describe('getNodeBox', () => {
  it('uses explicit width/height when present', () => {
    expect(getNodeBox(makeNode({ width: 200, height: 120 }))).toEqual({
      x: 0,
      y: 0,
      width: 200,
      height: 120,
    });
  });

  it('falls back to default size when omitted', () => {
    const node: NodeGraphNode = { id: 'n', position: { x: 5, y: 7 } };
    const box = getNodeBox(node);
    expect(box).toEqual({
      x: 5,
      y: 7,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
    });
  });

  it('accepts custom defaults', () => {
    const node: NodeGraphNode = { id: 'n', position: { x: 0, y: 0 } };
    expect(getNodeBox(node, { width: 50, height: 25 })).toEqual({
      x: 0,
      y: 0,
      width: 50,
      height: 25,
    });
  });
});

describe('resolvePortOffsets', () => {
  it('returns 0.5 for a single implicit port', () => {
    expect(resolvePortOffsets([port({ id: 'a', side: 'left' })])).toEqual([
      0.5,
    ]);
  });

  it('distributes implicit ports evenly across the side', () => {
    const offsets = resolvePortOffsets([
      port({ id: 'a', side: 'right' }),
      port({ id: 'b', side: 'right' }),
      port({ id: 'c', side: 'right' }),
    ]);
    expect(offsets).toEqual([0.25, 0.5, 0.75]);
  });

  it('keeps explicit offsets verbatim and ignores them when distributing', () => {
    const offsets = resolvePortOffsets([
      port({ id: 'a', side: 'right', offset: 0.1 }),
      port({ id: 'b', side: 'right' }),
      port({ id: 'c', side: 'right' }),
      port({ id: 'd', side: 'right', offset: 0.9 }),
    ]);
    expect(offsets[0]).toBe(0.1);
    expect(offsets[3]).toBe(0.9);
    // Two implicit ports between → distributed across [0,1] with margins.
    expect(offsets[1]).toBeCloseTo(1 / 3);
    expect(offsets[2]).toBeCloseTo(2 / 3);
  });

  it('clamps explicit offsets to [0, 1]', () => {
    expect(
      resolvePortOffsets([
        port({ id: 'a', side: 'left', offset: -0.5 }),
        port({ id: 'b', side: 'left', offset: 1.5 }),
      ])
    ).toEqual([0, 1]);
  });
});

describe('getPortPosition', () => {
  const node = makeNode({
    position: { x: 100, y: 200 },
    width: 100,
    height: 60,
  });

  it('positions a left port on the left edge at the given offset', () => {
    const p = port({ id: 'in', side: 'left' });
    const withPorts = { ...node, ports: [p] };
    expect(getPortPosition(withPorts, p)).toEqual({ x: 100, y: 230 });
  });

  it('positions a right port on the right edge', () => {
    const p = port({ id: 'out', side: 'right' });
    const withPorts = { ...node, ports: [p] };
    expect(getPortPosition(withPorts, p)).toEqual({ x: 200, y: 230 });
  });

  it('positions a top port on the top edge', () => {
    const p = port({ id: 'top', side: 'top' });
    const withPorts = { ...node, ports: [p] };
    expect(getPortPosition(withPorts, p)).toEqual({ x: 150, y: 200 });
  });

  it('positions a bottom port on the bottom edge', () => {
    const p = port({ id: 'bot', side: 'bottom' });
    const withPorts = { ...node, ports: [p] };
    expect(getPortPosition(withPorts, p)).toEqual({ x: 150, y: 260 });
  });

  it('distributes multiple ports on the same side evenly', () => {
    const p1 = port({ id: 'a', side: 'right' });
    const p2 = port({ id: 'b', side: 'right' });
    const p3 = port({ id: 'c', side: 'right' });
    const withPorts = { ...node, ports: [p1, p2, p3] };
    expect(getPortPosition(withPorts, p1).y).toBeCloseTo(200 + 60 * 0.25);
    expect(getPortPosition(withPorts, p2).y).toBeCloseTo(200 + 60 * 0.5);
    expect(getPortPosition(withPorts, p3).y).toBeCloseTo(200 + 60 * 0.75);
  });

  it('respects explicit offset over even distribution', () => {
    const p1 = port({ id: 'a', side: 'right', offset: 0.1 });
    const p2 = port({ id: 'b', side: 'right', offset: 0.9 });
    const withPorts = { ...node, ports: [p1, p2] };
    expect(getPortPosition(withPorts, p1).y).toBe(200 + 60 * 0.1);
    expect(getPortPosition(withPorts, p2).y).toBe(200 + 60 * 0.9);
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
    // c1 is to the right of p0
    expect(cp.c1.x).toBeGreaterThan(cp.p0.x);
    expect(cp.c1.y).toBe(cp.p0.y);
    // c2 is to the left of p3
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
    // c1 should be at least 32 world units from p0
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

  it('respects default size for unsized nodes', () => {
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

describe('resolvePortRef / resolveEdgeEndpoints', () => {
  const nodes: NodeGraphNode[] = [
    {
      id: 'a',
      position: { x: 0, y: 0 },
      width: 100,
      height: 50,
      ports: [{ id: 'out', side: 'right' }],
    },
    {
      id: 'b',
      position: { x: 300, y: 0 },
      width: 100,
      height: 50,
      ports: [{ id: 'in', side: 'left' }],
    },
  ];

  it('resolves a port reference to its world position', () => {
    const ref = resolvePortRef({ node: 'a', port: 'out' }, nodes);
    expect(ref).not.toBeNull();
    expect(ref?.position).toEqual({ x: 100, y: 25 });
  });

  it('returns null for an unknown node', () => {
    expect(resolvePortRef({ node: 'x', port: 'out' }, nodes)).toBeNull();
  });

  it('returns null for an unknown port on a known node', () => {
    expect(resolvePortRef({ node: 'a', port: 'zzz' }, nodes)).toBeNull();
  });

  it('resolves both endpoints of an edge', () => {
    const edge: NodeGraphEdge = {
      id: 'e1',
      source: { node: 'a', port: 'out' },
      target: { node: 'b', port: 'in' },
    };
    const endpoints = resolveEdgeEndpoints(edge, nodes);
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
    expect(resolveEdgeEndpoints(edge, nodes)).toBeNull();
  });
});
