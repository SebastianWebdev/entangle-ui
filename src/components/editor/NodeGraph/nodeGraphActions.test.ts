import { describe, expect, it } from 'vitest';
import { duplicateNodes, edgesConnectedToPort } from './nodeGraphActions';
import type { NodeGraphEdge, NodeGraphNode } from './NodeGraph.types';

const NODES: NodeGraphNode[] = [
  { id: 'a', position: { x: 0, y: 0 }, data: { kind: 'x' }, width: 120 },
  { id: 'b', position: { x: 100, y: 50 } },
  { id: 'c', position: { x: 200, y: 200 } },
];

describe('duplicateNodes', () => {
  it('clones only the requested ids', () => {
    const copies = duplicateNodes(NODES, ['a', 'c']);
    expect(copies).toHaveLength(2);
    expect(
      copies.map(n => n.id.startsWith('a') || n.id.startsWith('c'))
    ).toEqual([true, true]);
    expect(copies.map(n => n.data)).toEqual([{ kind: 'x' }, undefined]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(duplicateNodes(NODES, ['missing'])).toEqual([]);
    expect(duplicateNodes(NODES, [])).toEqual([]);
  });

  it('applies the default offset of {32,32}', () => {
    const [copy] = duplicateNodes(NODES, ['b']);
    expect(copy?.position).toEqual({ x: 132, y: 82 });
  });

  it('applies a custom offset', () => {
    const [copy] = duplicateNodes(NODES, ['a'], { offset: { x: 10, y: -5 } });
    expect(copy?.position).toEqual({ x: 10, y: -5 });
  });

  it('assigns new unique ids that differ from the source', () => {
    const copies = duplicateNodes(NODES, ['a', 'b']);
    const ids = copies.map(n => n.id);
    expect(ids[0]).not.toBe('a');
    expect(ids[1]).not.toBe('b');
    expect(new Set(ids).size).toBe(2);
  });

  it('uses a custom idFactory', () => {
    const copies = duplicateNodes(NODES, ['a'], {
      idFactory: sid => `${sid}-2`,
    });
    expect(copies[0]?.id).toBe('a-2');
  });

  it('preserves non-position fields (data, width)', () => {
    const [copy] = duplicateNodes(NODES, ['a']);
    expect(copy?.data).toEqual({ kind: 'x' });
    expect(copy?.width).toBe(120);
  });

  it('does not mutate the source nodes', () => {
    const snapshot = JSON.stringify(NODES);
    duplicateNodes(NODES, ['a', 'b', 'c']);
    expect(JSON.stringify(NODES)).toBe(snapshot);
  });
});

describe('edgesConnectedToPort', () => {
  const EDGES: NodeGraphEdge[] = [
    {
      id: 'e1',
      source: { node: 'a', port: 'out' },
      target: { node: 'b', port: 'in' },
    },
    {
      id: 'e2',
      source: { node: 'a', port: 'out' },
      target: { node: 'c', port: 'in' },
    },
    {
      id: 'e3',
      source: { node: 'b', port: 'out' },
      target: { node: 'c', port: 'in' },
    },
  ];

  it('finds edges where the port is the source', () => {
    expect(edgesConnectedToPort(EDGES, { node: 'a', port: 'out' })).toEqual([
      'e1',
      'e2',
    ]);
  });

  it('finds edges where the port is the target', () => {
    expect(edgesConnectedToPort(EDGES, { node: 'c', port: 'in' })).toEqual([
      'e2',
      'e3',
    ]);
  });

  it('returns an empty array for an unconnected port', () => {
    expect(edgesConnectedToPort(EDGES, { node: 'a', port: 'in' })).toEqual([]);
    expect(edgesConnectedToPort([], { node: 'a', port: 'out' })).toEqual([]);
  });
});
