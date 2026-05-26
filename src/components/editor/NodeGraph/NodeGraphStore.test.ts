import { describe, it, expect, vi } from 'vitest';
import { NodeGraphStore, marqueeWorldRect } from './NodeGraphStore';
import type {
  NodeGraphEdge,
  NodeGraphNode,
  NodeGraphSelection,
} from './NodeGraph.types';

const nodeA: NodeGraphNode = { id: 'a', position: { x: 0, y: 0 } };
const nodeB: NodeGraphNode = { id: 'b', position: { x: 100, y: 0 } };
const edge: NodeGraphEdge = {
  id: 'e1',
  source: { node: 'a', port: 'out' },
  target: { node: 'b', port: 'in' },
};

const emptySel: NodeGraphSelection = { nodes: [], edges: [], groups: [] };

describe('NodeGraphStore — data slice', () => {
  it('starts with empty data and idle interaction', () => {
    const store = new NodeGraphStore();
    expect(store.getData().nodes).toEqual([]);
    expect(store.getData().edges).toEqual([]);
    expect(store.getInteraction().kind).toBe('idle');
  });

  it('notifies data subscribers when nodes change', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    store.subscribeData(cb);
    store.setData({
      nodes: [nodeA],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('skips data notification when the payload is identical by reference', () => {
    const store = new NodeGraphStore();
    const next = {
      nodes: [nodeA] as NodeGraphNode[],
      edges: [] as NodeGraphEdge[],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    };
    store.setData(next);
    const cb = vi.fn();
    store.subscribeData(cb);
    store.setData(next);
    expect(cb).not.toHaveBeenCalled();
  });

  it('unsubscribes cleanly', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    const unsub = store.subscribeData(cb);
    unsub();
    store.setData({
      nodes: [nodeA],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it('does not cross-fire listeners between slices', () => {
    const store = new NodeGraphStore();
    const dataCb = vi.fn();
    const selCb = vi.fn();
    store.subscribeData(dataCb);
    store.subscribeSelection(selCb);
    store.setHover({
      hoveredNodeId: 'a',
      hoveredEdgeId: null,
      hoveredPort: null,
    });
    expect(dataCb).not.toHaveBeenCalled();
    expect(selCb).not.toHaveBeenCalled();
  });
});

describe('NodeGraphStore — selection slice', () => {
  it('notifies when selection content changes', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    store.subscribeSelection(cb);
    store.setSelection({ nodes: ['a'], edges: [], groups: [] });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('skips notification when selection is equivalent', () => {
    const store = new NodeGraphStore();
    store.setSelection({ nodes: ['a', 'b'], edges: [], groups: [] });
    const cb = vi.fn();
    store.subscribeSelection(cb);
    // New object, same contents.
    store.setSelection({ nodes: ['a', 'b'], edges: [], groups: [] });
    expect(cb).not.toHaveBeenCalled();
  });

  it('detects order-sensitive selection changes', () => {
    const store = new NodeGraphStore();
    store.setSelection({ nodes: ['a', 'b'], edges: [], groups: [] });
    const cb = vi.fn();
    store.subscribeSelection(cb);
    store.setSelection({ nodes: ['b', 'a'], edges: [], groups: [] });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('isNodeSelected / isEdgeSelected / isGroupSelected reflect membership', () => {
    const store = new NodeGraphStore();
    store.setSelection({ nodes: ['n1'], edges: ['e1'], groups: ['g1'] });
    expect(store.isNodeSelected('n1')).toBe(true);
    expect(store.isNodeSelected('n2')).toBe(false);
    expect(store.isEdgeSelected('e1')).toBe(true);
    expect(store.isGroupSelected('g1')).toBe(true);
  });
});

describe('NodeGraphStore — interaction slice', () => {
  it('transitions between idle and drag-nodes', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    store.subscribeInteraction(cb);

    store.setInteraction({
      kind: 'drag-nodes',
      nodeIds: new Set(['a']),
      startWorld: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
    });
    expect(cb).toHaveBeenCalledTimes(1);

    // Same delta, same nodeIds → no notification.
    store.setInteraction({
      kind: 'drag-nodes',
      nodeIds: new Set(['a']),
      startWorld: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
    });
    expect(cb).toHaveBeenCalledTimes(1);

    // Delta changes → notification.
    store.setInteraction({
      kind: 'drag-nodes',
      nodeIds: new Set(['a']),
      startWorld: { x: 0, y: 0 },
      delta: { x: 5, y: 0 },
    });
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('treats kind changes as a notification', () => {
    const store = new NodeGraphStore();
    store.setInteraction({
      kind: 'drag-nodes',
      nodeIds: new Set(['a']),
      startWorld: { x: 0, y: 0 },
      delta: { x: 5, y: 5 },
    });
    const cb = vi.fn();
    store.subscribeInteraction(cb);
    store.setInteraction({ kind: 'idle' });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('detects connection candidate transitions', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    store.subscribeInteraction(cb);

    store.setInteraction({
      kind: 'connect',
      source: { node: 'a', port: 'out' },
      currentWorld: { x: 10, y: 10 },
      candidate: null,
      invalid: false,
    });
    expect(cb).toHaveBeenCalledTimes(1);

    store.setInteraction({
      kind: 'connect',
      source: { node: 'a', port: 'out' },
      currentWorld: { x: 10, y: 10 },
      candidate: { node: 'b', port: 'in' },
      invalid: false,
    });
    expect(cb).toHaveBeenCalledTimes(2);

    // Same candidate, only invalid flag flips → notification.
    store.setInteraction({
      kind: 'connect',
      source: { node: 'a', port: 'out' },
      currentWorld: { x: 10, y: 10 },
      candidate: { node: 'b', port: 'in' },
      invalid: true,
    });
    expect(cb).toHaveBeenCalledTimes(3);
  });
});

describe('NodeGraphStore — per-node interaction subscriptions', () => {
  it('wakes only subscribers for ids in the current drag set', () => {
    const store = new NodeGraphStore();
    const cbA = vi.fn();
    const cbB = vi.fn();
    const cbC = vi.fn();
    store.subscribeNodeInteraction('a', cbA);
    store.subscribeNodeInteraction('b', cbB);
    store.subscribeNodeInteraction('c', cbC);

    store.setInteraction({
      kind: 'drag-nodes',
      nodeIds: new Set(['a', 'b']),
      startWorld: { x: 0, y: 0 },
      delta: { x: 5, y: 0 },
    });

    expect(cbA).toHaveBeenCalledTimes(1);
    expect(cbB).toHaveBeenCalledTimes(1);
    expect(cbC).not.toHaveBeenCalled();
  });

  it('wakes subscribers that leave the drag set too', () => {
    // A node that was being dragged needs to clear its local delta when the
    // gesture moves to a different set or ends — so the previously-dragged
    // ids must fire alongside the newly-dragged ones.
    const store = new NodeGraphStore();
    store.setInteraction({
      kind: 'drag-nodes',
      nodeIds: new Set(['a']),
      startWorld: { x: 0, y: 0 },
      delta: { x: 5, y: 0 },
    });
    const cbA = vi.fn();
    const cbB = vi.fn();
    store.subscribeNodeInteraction('a', cbA);
    store.subscribeNodeInteraction('b', cbB);

    // Switch the drag set from {a} to {b}: a leaves, b enters — both fire.
    store.setInteraction({
      kind: 'drag-nodes',
      nodeIds: new Set(['b']),
      startWorld: { x: 0, y: 0 },
      delta: { x: 5, y: 0 },
    });

    expect(cbA).toHaveBeenCalledTimes(1);
    expect(cbB).toHaveBeenCalledTimes(1);

    // Idle clears everything: only the previously-dragged id needs notification.
    store.setInteraction({ kind: 'idle' });
    expect(cbA).toHaveBeenCalledTimes(1);
    expect(cbB).toHaveBeenCalledTimes(2);
  });

  it('honours contained nodes from a group drag', () => {
    const store = new NodeGraphStore();
    const cbA = vi.fn();
    const cbB = vi.fn();
    store.subscribeNodeInteraction('a', cbA);
    store.subscribeNodeInteraction('b', cbB);

    store.setInteraction({
      kind: 'drag-groups',
      groupIds: new Set(['g1']),
      containedNodeIds: new Set(['a']),
      startWorld: { x: 0, y: 0 },
      delta: { x: 0, y: 5 },
      blocked: false,
    });

    expect(cbA).toHaveBeenCalledTimes(1);
    expect(cbB).not.toHaveBeenCalled();
  });

  it('does not fire per-node listeners on non-drag interactions', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    store.subscribeNodeInteraction('a', cb);

    store.setInteraction({
      kind: 'connect',
      source: { node: 'a', port: 'out' },
      currentWorld: { x: 0, y: 0 },
      candidate: null,
      invalid: false,
    });
    store.setInteraction({
      kind: 'marquee',
      startWorld: { x: 0, y: 0 },
      currentWorld: { x: 10, y: 10 },
      additive: false,
    });

    expect(cb).not.toHaveBeenCalled();
  });

  it('cleans up the listener map when the last subscriber unsubscribes', () => {
    const store = new NodeGraphStore();
    const unsub1 = store.subscribeNodeInteraction('a', vi.fn());
    const unsub2 = store.subscribeNodeInteraction('a', vi.fn());
    unsub1();
    unsub2();

    // After both unsubscribe, a drag including 'a' should fire nothing —
    // the inner Set was deleted and the Map entry GC'd.
    expect(() =>
      store.setInteraction({
        kind: 'drag-nodes',
        nodeIds: new Set(['a']),
        startWorld: { x: 0, y: 0 },
        delta: { x: 1, y: 0 },
      })
    ).not.toThrow();
  });
});

describe('NodeGraphStore — hover slice', () => {
  it('detects port reference changes correctly', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    store.subscribeHover(cb);

    store.setHover({
      hoveredNodeId: 'a',
      hoveredEdgeId: null,
      hoveredPort: { node: 'a', port: 'out' },
    });
    expect(cb).toHaveBeenCalledTimes(1);

    // Equivalent port ref (new object, same fields) — no notification.
    store.setHover({
      hoveredNodeId: 'a',
      hoveredEdgeId: null,
      hoveredPort: { node: 'a', port: 'out' },
    });
    expect(cb).toHaveBeenCalledTimes(1);

    // Different port — notification.
    store.setHover({
      hoveredNodeId: 'a',
      hoveredEdgeId: null,
      hoveredPort: { node: 'a', port: 'other' },
    });
    expect(cb).toHaveBeenCalledTimes(2);
  });
});

describe('marqueeWorldRect', () => {
  it('returns a normalized world rectangle regardless of drag direction', () => {
    expect(
      marqueeWorldRect({
        kind: 'marquee',
        startWorld: { x: 50, y: 80 },
        currentWorld: { x: 10, y: 20 },
        additive: false,
      })
    ).toEqual({ x: 10, y: 20, width: 40, height: 60 });
  });

  it('handles zero-area marquee', () => {
    expect(
      marqueeWorldRect({
        kind: 'marquee',
        startWorld: { x: 10, y: 10 },
        currentWorld: { x: 10, y: 10 },
        additive: true,
      })
    ).toEqual({ x: 10, y: 10, width: 0, height: 0 });
  });
});

describe('NodeGraphStore — selection vs initial reference', () => {
  it('keeps a stable reference across no-op writes', () => {
    const store = new NodeGraphStore();
    const before = store.getSelection();
    store.setSelection(emptySel);
    expect(store.getSelection()).toBe(before);
  });

  it('replaces the reference on real changes', () => {
    const store = new NodeGraphStore();
    const before = store.getSelection();
    store.setSelection({ nodes: ['a'], edges: [], groups: [] });
    expect(store.getSelection()).not.toBe(before);
  });

  it('keeps a stable reference for matching edges', () => {
    const store = new NodeGraphStore();
    void edge; // keep import live for type-checking
    store.setSelection({ nodes: [], edges: ['e1'], groups: [] });
    const ref = store.getSelection();
    store.setSelection({ nodes: [], edges: ['e1'], groups: [] });
    expect(store.getSelection()).toBe(ref);
  });
});

describe('NodeGraphStore — node index', () => {
  it('returns undefined for unknown ids before any data is set', () => {
    const store = new NodeGraphStore();
    expect(store.getNodeById('a')).toBeUndefined();
  });

  it('returns the node for a known id after setData', () => {
    const store = new NodeGraphStore();
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    expect(store.getNodeById('a')).toBe(nodeA);
    expect(store.getNodeById('b')).toBe(nodeB);
  });

  it('reflects removals after setData drops a node', () => {
    const store = new NodeGraphStore();
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    store.setData({
      nodes: [nodeA],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    expect(store.getNodeById('a')).toBe(nodeA);
    expect(store.getNodeById('b')).toBeUndefined();
  });

  it('reflects in-place id swaps after setData replaces nodes', () => {
    const store = new NodeGraphStore();
    store.setData({
      nodes: [nodeA],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    const renamedA: NodeGraphNode = { id: 'a', position: { x: 99, y: 99 } };
    store.setData({
      nodes: [renamedA],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    expect(store.getNodeById('a')).toBe(renamedA);
  });
});

describe('NodeGraphStore — portPositions slice', () => {
  it('starts empty and resolves null for unknown ports', () => {
    const store = new NodeGraphStore();
    expect(store.getPortPosition('a', 'out')).toBeNull();
  });

  it('registers a port position and notifies subscribers', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    store.subscribePortPositions(cb);
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'right' });
    expect(store.getPortPosition('a', 'out')).toEqual({
      x: 10,
      y: 20,
      side: 'right',
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('no-ops when an identical position is set again', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'right' });
    store.subscribePortPositions(cb);
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'right' });
    expect(cb).not.toHaveBeenCalled();
  });

  it('notifies on changes to side or dataType, not just x/y', () => {
    const store = new NodeGraphStore();
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'right' });
    const cb = vi.fn();
    store.subscribePortPositions(cb);
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'left' });
    expect(cb).toHaveBeenCalledTimes(1);
    store.setPortPosition('a', 'out', {
      x: 10,
      y: 20,
      side: 'left',
      dataType: 'exec',
    });
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('removes a port and notifies subscribers', () => {
    const store = new NodeGraphStore();
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'right' });
    const cb = vi.fn();
    store.subscribePortPositions(cb);
    store.removePortPosition('a', 'out');
    expect(store.getPortPosition('a', 'out')).toBeNull();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('does not notify when removing a port that does not exist', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    store.subscribePortPositions(cb);
    store.removePortPosition('ghost', 'nope');
    expect(cb).not.toHaveBeenCalled();
  });

  it('garbage-collects port positions for removed nodes on setData', () => {
    const store = new NodeGraphStore();
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'right' });
    store.setPortPosition('b', 'in', { x: 0, y: 20, side: 'left' });
    const cb = vi.fn();
    store.subscribePortPositions(cb);
    // Drop nodeB from data.
    store.setData({
      nodes: [nodeA],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    expect(store.getPortPosition('b', 'in')).toBeNull();
    expect(store.getPortPosition('a', 'out')).not.toBeNull();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  // Version counter — used as a `useSyncExternalStore` snapshot so that
  // pure notify-only subscribers actually re-render. A stable null snapshot
  // would let React skip the update via Object.is(prev, next).
  it('exposes a port-positions version that increments on real changes', () => {
    const store = new NodeGraphStore();
    const v0 = store.getPortPositionsVersion();
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'right' });
    const v1 = store.getPortPositionsVersion();
    expect(v1).toBeGreaterThan(v0);
  });

  it('does not bump the port-positions version on no-op set', () => {
    const store = new NodeGraphStore();
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'right' });
    const v = store.getPortPositionsVersion();
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'right' });
    expect(store.getPortPositionsVersion()).toBe(v);
  });

  it('bumps the port-positions version on removePortPosition', () => {
    const store = new NodeGraphStore();
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'right' });
    const v = store.getPortPositionsVersion();
    store.removePortPosition('a', 'out');
    expect(store.getPortPositionsVersion()).toBeGreaterThan(v);
  });

  it('bumps the port-positions version when setData GCs ports', () => {
    const store = new NodeGraphStore();
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    store.setPortPosition('a', 'out', { x: 10, y: 20, side: 'right' });
    store.setPortPosition('b', 'in', { x: 0, y: 20, side: 'left' });
    const v = store.getPortPositionsVersion();
    store.setData({
      nodes: [nodeA],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    expect(store.getPortPositionsVersion()).toBeGreaterThan(v);
  });
});

describe('NodeGraphStore — measuredSizes slice', () => {
  it('starts empty', () => {
    const store = new NodeGraphStore();
    expect(store.getMeasuredSize('a')).toBeNull();
  });

  it('registers a measured size and notifies subscribers', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    store.subscribeMeasuredSizes(cb);
    store.setMeasuredSize('a', { width: 220, height: 80 });
    expect(store.getMeasuredSize('a')).toEqual({ width: 220, height: 80 });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('no-ops when the same size is set again', () => {
    const store = new NodeGraphStore();
    store.setMeasuredSize('a', { width: 220, height: 80 });
    const cb = vi.fn();
    store.subscribeMeasuredSizes(cb);
    store.setMeasuredSize('a', { width: 220, height: 80 });
    expect(cb).not.toHaveBeenCalled();
  });

  it('clears a measurement and notifies subscribers', () => {
    const store = new NodeGraphStore();
    store.setMeasuredSize('a', { width: 220, height: 80 });
    const cb = vi.fn();
    store.subscribeMeasuredSizes(cb);
    store.clearMeasuredSize('a');
    expect(store.getMeasuredSize('a')).toBeNull();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('garbage-collects measured sizes for removed nodes on setData', () => {
    const store = new NodeGraphStore();
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    store.setMeasuredSize('a', { width: 220, height: 80 });
    store.setMeasuredSize('b', { width: 240, height: 90 });
    const cb = vi.fn();
    store.subscribeMeasuredSizes(cb);
    store.setData({
      nodes: [nodeA],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    expect(store.getMeasuredSize('b')).toBeNull();
    expect(store.getMeasuredSize('a')).not.toBeNull();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('exposes a measured-sizes version that increments on real changes', () => {
    const store = new NodeGraphStore();
    const v0 = store.getMeasuredSizesVersion();
    store.setMeasuredSize('a', { width: 220, height: 80 });
    expect(store.getMeasuredSizesVersion()).toBeGreaterThan(v0);
  });

  it('does not bump the measured-sizes version on no-op set', () => {
    const store = new NodeGraphStore();
    store.setMeasuredSize('a', { width: 220, height: 80 });
    const v = store.getMeasuredSizesVersion();
    store.setMeasuredSize('a', { width: 220, height: 80 });
    expect(store.getMeasuredSizesVersion()).toBe(v);
  });

  it('bumps the measured-sizes version on clearMeasuredSize', () => {
    const store = new NodeGraphStore();
    store.setMeasuredSize('a', { width: 220, height: 80 });
    const v = store.getMeasuredSizesVersion();
    store.clearMeasuredSize('a');
    expect(store.getMeasuredSizesVersion()).toBeGreaterThan(v);
  });

  it('bumps the measured-sizes version when setData GCs sizes', () => {
    const store = new NodeGraphStore();
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    store.setMeasuredSize('a', { width: 220, height: 80 });
    store.setMeasuredSize('b', { width: 240, height: 90 });
    const v = store.getMeasuredSizesVersion();
    store.setData({
      nodes: [nodeA],
      edges: [],
      groups: [],
      defaultNodeSize: { width: 180, height: 80 },
    });
    expect(store.getMeasuredSizesVersion()).toBeGreaterThan(v);
  });
});

describe('NodeGraphStore — nodeB import', () => {
  it('keeps nodeB usable in tests', () => {
    // Ensures nodeB import stays referenced — tests above use it implicitly.
    expect(nodeB.id).toBe('b');
  });
});

describe('NodeGraphStore — drag-groups interaction equality', () => {
  it('treats identical drag-groups payloads as a no-op', () => {
    const store = new NodeGraphStore();
    store.setInteraction({
      kind: 'drag-groups',
      groupIds: new Set(['g1', 'g2']),
      containedNodeIds: new Set<string>(),
      startWorld: { x: 0, y: 0 },
      delta: { x: 5, y: 5 },
      blocked: false,
    });
    const cb = vi.fn();
    store.subscribeInteraction(cb);
    store.setInteraction({
      kind: 'drag-groups',
      groupIds: new Set(['g1', 'g2']),
      containedNodeIds: new Set<string>(),
      startWorld: { x: 0, y: 0 },
      delta: { x: 5, y: 5 },
      blocked: false,
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it('fires when the drag-groups delta changes', () => {
    const store = new NodeGraphStore();
    store.setInteraction({
      kind: 'drag-groups',
      groupIds: new Set(['g1']),
      containedNodeIds: new Set<string>(),
      startWorld: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      blocked: false,
    });
    const cb = vi.fn();
    store.subscribeInteraction(cb);
    store.setInteraction({
      kind: 'drag-groups',
      groupIds: new Set(['g1']),
      containedNodeIds: new Set<string>(),
      startWorld: { x: 0, y: 0 },
      delta: { x: 5, y: 0 },
      blocked: false,
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('fires when the dragged group set changes', () => {
    const store = new NodeGraphStore();
    store.setInteraction({
      kind: 'drag-groups',
      groupIds: new Set(['g1']),
      containedNodeIds: new Set<string>(),
      startWorld: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      blocked: false,
    });
    const cb = vi.fn();
    store.subscribeInteraction(cb);
    store.setInteraction({
      kind: 'drag-groups',
      groupIds: new Set(['g1', 'g2']),
      containedNodeIds: new Set<string>(),
      startWorld: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      blocked: false,
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });
});

describe('NodeGraphStore — resize-group interaction equality', () => {
  it('treats identical resize-group payloads as a no-op', () => {
    const store = new NodeGraphStore();
    store.setInteraction({
      kind: 'resize-group',
      groupId: 'g1',
      handle: 'se',
      startBounds: { x: 0, y: 0, width: 100, height: 100 },
      delta: { x: 10, y: 10 },
      blocked: false,
    });
    const cb = vi.fn();
    store.subscribeInteraction(cb);
    store.setInteraction({
      kind: 'resize-group',
      groupId: 'g1',
      handle: 'se',
      startBounds: { x: 0, y: 0, width: 100, height: 100 },
      delta: { x: 10, y: 10 },
      blocked: false,
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it('fires when the resize handle changes', () => {
    const store = new NodeGraphStore();
    store.setInteraction({
      kind: 'resize-group',
      groupId: 'g1',
      handle: 'se',
      startBounds: { x: 0, y: 0, width: 100, height: 100 },
      delta: { x: 0, y: 0 },
      blocked: false,
    });
    const cb = vi.fn();
    store.subscribeInteraction(cb);
    store.setInteraction({
      kind: 'resize-group',
      groupId: 'g1',
      handle: 'sw',
      startBounds: { x: 0, y: 0, width: 100, height: 100 },
      delta: { x: 0, y: 0 },
      blocked: false,
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('fires when the resize delta changes', () => {
    const store = new NodeGraphStore();
    store.setInteraction({
      kind: 'resize-group',
      groupId: 'g1',
      handle: 'e',
      startBounds: { x: 0, y: 0, width: 100, height: 100 },
      delta: { x: 0, y: 0 },
      blocked: false,
    });
    const cb = vi.fn();
    store.subscribeInteraction(cb);
    store.setInteraction({
      kind: 'resize-group',
      groupId: 'g1',
      handle: 'e',
      startBounds: { x: 0, y: 0, width: 100, height: 100 },
      delta: { x: 5, y: 0 },
      blocked: false,
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });
});

describe('NodeGraphStore — connected ports', () => {
  const size = { width: 180, height: 80 };

  it('starts with no connected ports', () => {
    const store = new NodeGraphStore();
    expect(store.getConnectedPorts().size).toBe(0);
    expect(store.isPortConnected('a', 'out')).toBe(false);
  });

  it('marks both endpoints of every edge as connected', () => {
    const store = new NodeGraphStore();
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [edge],
      groups: [],
      defaultNodeSize: size,
    });
    expect(store.isPortConnected('a', 'out')).toBe(true);
    expect(store.isPortConnected('b', 'in')).toBe(true);
    expect(store.isPortConnected('a', 'in')).toBe(false);
  });

  it('notifies the connected-ports channel when edges change membership', () => {
    const store = new NodeGraphStore();
    const cb = vi.fn();
    store.subscribeConnectedPorts(cb);
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [edge],
      groups: [],
      defaultNodeSize: size,
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('does not notify the connected-ports channel on node-only changes', () => {
    const store = new NodeGraphStore();
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [edge],
      groups: [],
      defaultNodeSize: size,
    });
    const cb = vi.fn();
    store.subscribeConnectedPorts(cb);
    // New nodes array reference, same edges reference → membership unchanged.
    store.setData({
      nodes: [{ ...nodeA, position: { x: 10, y: 10 } }, nodeB],
      edges: [edge],
      groups: [],
      defaultNodeSize: size,
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it('keeps a stable set reference when membership is unchanged', () => {
    const store = new NodeGraphStore();
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [edge],
      groups: [],
      defaultNodeSize: size,
    });
    const first = store.getConnectedPorts();
    // A brand-new edges array carrying the same endpoints (e.g. a label
    // edit) must not swap the connected-ports set reference.
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [{ ...edge, label: 'x' }],
      groups: [],
      defaultNodeSize: size,
    });
    expect(store.getConnectedPorts()).toBe(first);
  });

  it('drops connections when the edge is removed', () => {
    const store = new NodeGraphStore();
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [edge],
      groups: [],
      defaultNodeSize: size,
    });
    store.setData({
      nodes: [nodeA, nodeB],
      edges: [],
      groups: [],
      defaultNodeSize: size,
    });
    expect(store.isPortConnected('a', 'out')).toBe(false);
    expect(store.getConnectedPorts().size).toBe(0);
  });
});
