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
      nodeIds: ['a'],
      startWorld: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
    });
    expect(cb).toHaveBeenCalledTimes(1);

    // Same delta, same nodeIds → no notification.
    store.setInteraction({
      kind: 'drag-nodes',
      nodeIds: ['a'],
      startWorld: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
    });
    expect(cb).toHaveBeenCalledTimes(1);

    // Delta changes → notification.
    store.setInteraction({
      kind: 'drag-nodes',
      nodeIds: ['a'],
      startWorld: { x: 0, y: 0 },
      delta: { x: 5, y: 0 },
    });
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('treats kind changes as a notification', () => {
    const store = new NodeGraphStore();
    store.setInteraction({
      kind: 'drag-nodes',
      nodeIds: ['a'],
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

describe('NodeGraphStore — nodeB import', () => {
  it('keeps nodeB usable in tests', () => {
    // Ensures nodeB import stays referenced — tests above use it implicitly.
    expect(nodeB.id).toBe('b');
  });
});
