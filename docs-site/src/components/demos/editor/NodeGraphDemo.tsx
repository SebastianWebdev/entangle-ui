import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  type NodeGraphEdge,
  type NodeGraphNode,
  type NodeGraphSelection,
} from '@/components/editor/NodeGraph';

interface NodePayload {
  label: string;
  hue: number;
}

const INITIAL_NODES: NodeGraphNode[] = [
  {
    id: 'in',
    position: { x: -240, y: -80 },
    data: { label: 'Input', hue: 200 } satisfies NodePayload,
    ports: [{ id: 'out', side: 'right', dataType: 'signal' }],
  },
  {
    id: 'filter',
    position: { x: 0, y: -120 },
    data: { label: 'Filter', hue: 30 } satisfies NodePayload,
    ports: [
      { id: 'in', side: 'left', dataType: 'signal' },
      { id: 'out', side: 'right', dataType: 'signal' },
    ],
  },
  {
    id: 'mix',
    position: { x: 240, y: -40 },
    data: { label: 'Mix', hue: 280 } satisfies NodePayload,
    ports: [
      { id: 'a', side: 'left', offset: 0.3, dataType: 'signal' },
      { id: 'b', side: 'left', offset: 0.7, dataType: 'signal' },
      { id: 'out', side: 'right', dataType: 'signal' },
    ],
  },
  {
    id: 'gain',
    position: { x: 0, y: 60 },
    data: { label: 'Gain', hue: 130 } satisfies NodePayload,
    ports: [
      { id: 'in', side: 'left', dataType: 'signal' },
      { id: 'out', side: 'right', dataType: 'signal' },
    ],
  },
  {
    id: 'out',
    position: { x: 480, y: -40 },
    data: { label: 'Output', hue: 180 } satisfies NodePayload,
    ports: [{ id: 'in', side: 'left', dataType: 'signal' }],
  },
];

const INITIAL_EDGES: NodeGraphEdge[] = [
  {
    id: 'e1',
    source: { node: 'in', port: 'out' },
    target: { node: 'filter', port: 'in' },
  },
  {
    id: 'e2',
    source: { node: 'filter', port: 'out' },
    target: { node: 'mix', port: 'a' },
  },
  {
    id: 'e3',
    source: { node: 'gain', port: 'out' },
    target: { node: 'mix', port: 'b' },
  },
  {
    id: 'e4',
    source: { node: 'mix', port: 'out' },
    target: { node: 'out', port: 'in' },
  },
];

function NodeBody({
  node,
  selected,
}: {
  node: NodeGraphNode;
  selected: boolean;
}): React.ReactElement {
  const data = (node.data ?? {}) as NodePayload;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(180deg, hsl(${data.hue}, 60%, 20%) 0%, hsl(${data.hue}, 40%, 12%) 100%)`,
        border: selected
          ? `2px solid hsl(${data.hue}, 90%, 60%)`
          : `1px solid hsl(${data.hue}, 30%, 30%)`,
        borderRadius: 8,
        boxShadow: selected
          ? `0 0 0 1px hsl(${data.hue}, 80%, 50%), 0 8px 20px rgba(0,0,0,0.35)`
          : '0 4px 10px rgba(0,0,0,0.25)',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: 'white',
        fontSize: 13,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 600,
      }}
    >
      <div>{data.label}</div>
      <div style={{ opacity: 0.6, fontSize: 11, fontWeight: 400 }}>
        id: {node.id}
      </div>
    </div>
  );
}

export default function NodeGraphDemo(): React.ReactElement {
  const [nodes, setNodes] = useState<NodeGraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<NodeGraphEdge[]>(INITIAL_EDGES);
  const [selection, setSelection] = useState<NodeGraphSelection>({
    nodes: [],
    edges: [],
    groups: [],
  });

  return (
    <DemoWrapper>
      <div style={{ height: 480 }}>
        <NodeGraph
          nodes={nodes}
          edges={edges}
          selection={selection}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
          onSelectionChange={setSelection}
          renderNode={(node, ctx) => (
            <NodeBody node={node} selected={ctx.selected} />
          )}
          isValidConnection={(source, target, info) => !info.sameNode}
          onDelete={sel => {
            setNodes(prev => prev.filter(n => !sel.nodes.includes(n.id)));
            setEdges(prev =>
              prev.filter(
                e =>
                  !sel.edges.includes(e.id) &&
                  !sel.nodes.includes(e.source.node) &&
                  !sel.nodes.includes(e.target.node)
              )
            );
            setSelection({ nodes: [], edges: [], groups: [] });
          }}
          snapToGrid={20}
          responsive
          ariaLabel="Signal processing graph"
        >
          <NodeGraph.Background variant="dots" gap={24} />
          <NodeGraph.Minimap placement="bottom-right" />
        </NodeGraph>
      </div>
      <p
        style={{
          fontSize: 12,
          color: 'var(--etui-color-text-secondary)',
          marginTop: 12,
        }}
      >
        Drag node bodies to move, drag from port to port to connect, marquee on
        empty space to multi-select, press Delete to remove selection, scroll to
        zoom, middle-drag or hold space to pan.
      </p>
    </DemoWrapper>
  );
}
