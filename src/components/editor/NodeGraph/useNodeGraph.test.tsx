import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useNodeGraph } from './useNodeGraph';
import type { NodeGraphEdge, NodeGraphNode } from './NodeGraph.types';

const NODES: NodeGraphNode[] = [
  { id: 'a', position: { x: 0, y: 0 } },
  { id: 'b', position: { x: 100, y: 0 } },
];

const EDGES: NodeGraphEdge[] = [
  {
    id: 'e1',
    source: { node: 'a', port: 'out' },
    target: { node: 'b', port: 'in' },
  },
];

describe('useNodeGraph', () => {
  it('defaults to empty state', () => {
    const { result } = renderHook(() => useNodeGraph());
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
    expect(result.current.groups).toEqual([]);
    expect(result.current.selection).toEqual({
      nodes: [],
      edges: [],
      groups: [],
    });
  });

  it('seeds state from options', () => {
    const { result } = renderHook(() =>
      useNodeGraph({ nodes: NODES, edges: EDGES })
    );
    expect(result.current.nodes).toHaveLength(2);
    expect(result.current.edges).toHaveLength(1);
  });

  describe('addNode', () => {
    it('appends a node and returns its id, generating one when omitted', () => {
      const { result } = renderHook(() => useNodeGraph());
      let id = '';
      act(() => {
        id = result.current.addNode({ position: { x: 5, y: 5 } });
      });
      expect(id).not.toBe('');
      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0]?.id).toBe(id);
    });

    it('uses a provided id', () => {
      const { result } = renderHook(() => useNodeGraph());
      act(() => {
        result.current.addNode({ id: 'custom', position: { x: 0, y: 0 } });
      });
      expect(result.current.nodes[0]?.id).toBe('custom');
    });
  });

  describe('connect', () => {
    it('adds an edge and returns its id', () => {
      const { result } = renderHook(() => useNodeGraph({ nodes: NODES }));
      let id = '';
      act(() => {
        id = result.current.connect(
          { node: 'a', port: 'out' },
          { node: 'b', port: 'in' }
        );
      });
      expect(result.current.edges).toHaveLength(1);
      expect(result.current.edges[0]?.id).toBe(id);
    });

    it('de-duplicates identical endpoints', () => {
      const { result } = renderHook(() => useNodeGraph({ nodes: NODES }));
      let first = '';
      let second = '';
      act(() => {
        first = result.current.connect(
          { node: 'a', port: 'out' },
          { node: 'b', port: 'in' }
        );
      });
      act(() => {
        second = result.current.connect(
          { node: 'a', port: 'out' },
          { node: 'b', port: 'in' }
        );
      });
      expect(result.current.edges).toHaveLength(1);
      expect(second).toBe(first);
    });
  });

  describe('removeNodes', () => {
    it('cascades edges and prunes the selection', () => {
      const { result } = renderHook(() =>
        useNodeGraph({
          nodes: NODES,
          edges: EDGES,
          selection: { nodes: ['a', 'b'], edges: ['e1'], groups: [] },
        })
      );
      act(() => {
        result.current.removeNodes(['a']);
      });
      expect(result.current.nodes.map(n => n.id)).toEqual(['b']);
      expect(result.current.edges).toEqual([]);
      expect(result.current.selection.nodes).toEqual(['b']);
      expect(result.current.selection.edges).toEqual([]);
    });
  });

  describe('removeEdges', () => {
    it('removes edges and prunes them from the selection', () => {
      const { result } = renderHook(() =>
        useNodeGraph({
          nodes: NODES,
          edges: EDGES,
          selection: { nodes: [], edges: ['e1'], groups: [] },
        })
      );
      act(() => {
        result.current.removeEdges(['e1']);
      });
      expect(result.current.edges).toEqual([]);
      expect(result.current.selection.edges).toEqual([]);
    });

    it('leaves nodes untouched', () => {
      const { result } = renderHook(() =>
        useNodeGraph({ nodes: NODES, edges: EDGES })
      );
      act(() => {
        result.current.removeEdges(['e1']);
      });
      expect(result.current.nodes).toHaveLength(2);
    });
  });

  describe('removeSelection', () => {
    it('cascade-deletes the selection and clears it', () => {
      const { result } = renderHook(() =>
        useNodeGraph({
          nodes: NODES,
          edges: EDGES,
          selection: { nodes: ['a'], edges: [], groups: [] },
        })
      );
      act(() => {
        result.current.removeSelection();
      });
      expect(result.current.nodes.map(n => n.id)).toEqual(['b']);
      expect(result.current.edges).toEqual([]);
      expect(result.current.selection).toEqual({
        nodes: [],
        edges: [],
        groups: [],
      });
    });

    it('is a no-op on an empty selection', () => {
      const { result } = renderHook(() => useNodeGraph({ nodes: NODES }));
      const before = result.current.nodes;
      act(() => {
        result.current.removeSelection();
      });
      expect(result.current.nodes).toBe(before);
    });
  });

  describe('duplicateNodes', () => {
    it('duplicates the current selection, appends, and selects the copies', () => {
      const { result } = renderHook(() =>
        useNodeGraph({
          nodes: NODES,
          selection: { nodes: ['a'], edges: [], groups: [] },
        })
      );
      let ids: string[] = [];
      act(() => {
        ids = result.current.duplicateNodes();
      });
      expect(ids).toHaveLength(1);
      expect(result.current.nodes).toHaveLength(3);
      expect(result.current.selection.nodes).toEqual(ids);
    });

    it('duplicates an explicit id list', () => {
      const { result } = renderHook(() => useNodeGraph({ nodes: NODES }));
      let ids: string[] = [];
      act(() => {
        ids = result.current.duplicateNodes(['b']);
      });
      expect(ids).toHaveLength(1);
      expect(result.current.nodes).toHaveLength(3);
    });
  });

  describe('groups', () => {
    it('addGroup appends and returns the id', () => {
      const { result } = renderHook(() => useNodeGraph());
      let id = '';
      act(() => {
        id = result.current.addGroup(
          { x: 0, y: 0, width: 100, height: 80 },
          { label: 'G' }
        );
      });
      expect(result.current.groups).toHaveLength(1);
      expect(result.current.groups[0]?.id).toBe(id);
      expect(result.current.groups[0]?.label).toBe('G');
    });

    it('removeGroups removes and prunes the selection', () => {
      const { result } = renderHook(() =>
        useNodeGraph({
          groups: [
            { id: 'g1', bounds: { x: 0, y: 0, width: 10, height: 10 } },
            { id: 'g2', bounds: { x: 0, y: 0, width: 10, height: 10 } },
          ],
          selection: { nodes: [], edges: [], groups: ['g1'] },
        })
      );
      act(() => {
        result.current.removeGroups(['g1']);
      });
      expect(result.current.groups.map(g => g.id)).toEqual(['g2']);
      expect(result.current.selection.groups).toEqual([]);
    });
  });

  it('clearSelection empties the selection', () => {
    const { result } = renderHook(() =>
      useNodeGraph({
        nodes: NODES,
        selection: { nodes: ['a'], edges: [], groups: [] },
      })
    );
    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selection.nodes).toEqual([]);
  });

  describe('bind', () => {
    it('exposes the four values and change handlers that update state', () => {
      const { result } = renderHook(() => useNodeGraph({ nodes: NODES }));
      expect(result.current.bind.nodes).toBe(result.current.nodes);
      act(() => {
        result.current.bind.onSelectionChange({
          nodes: ['a'],
          edges: [],
          groups: [],
        });
      });
      expect(result.current.selection.nodes).toEqual(['a']);
    });
  });
});
