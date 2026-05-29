import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  createTypeMatchValidator,
  type NodeGraphEdge,
  type NodeGraphNode,
} from '@/components/editor/NodeGraph';
import { StatusFooter } from './nodeGraphRecipeData';

// The barest possible graph: a `nodes` array + an `edges` array held in plain
// `useState`. Ports are declared inline inside `renderNode` with
// `<NodeGraph.Port>` — no compounds, no ports array, no offset math. Drag a
// node and the wires follow; drag pin → pin to connect.

interface BasicPort {
  id: string;
  side: 'left' | 'right';
  label: string;
}
interface BasicData {
  label: string;
  ports: BasicPort[];
}

const INITIAL_NODES: NodeGraphNode[] = [
  {
    id: 'value',
    position: { x: -280, y: -30 },
    data: {
      label: 'Value',
      ports: [{ id: 'out', side: 'right', label: 'Out' }],
    } satisfies BasicData,
  },
  {
    id: 'scale',
    position: { x: -30, y: -50 },
    data: {
      label: 'Scale',
      ports: [
        { id: 'in', side: 'left', label: 'In' },
        { id: 'factor', side: 'left', label: 'Factor' },
        { id: 'out', side: 'right', label: 'Out' },
      ],
    } satisfies BasicData,
  },
  {
    id: 'output',
    position: { x: 230, y: -30 },
    data: {
      label: 'Output',
      ports: [{ id: 'in', side: 'left', label: 'In' }],
    } satisfies BasicData,
  },
];

const INITIAL_EDGES: NodeGraphEdge[] = [
  {
    id: 'e1',
    source: { node: 'value', port: 'out' },
    target: { node: 'scale', port: 'in' },
  },
  {
    id: 'e2',
    source: { node: 'scale', port: 'out' },
    target: { node: 'output', port: 'in' },
  },
];

// Output → input only, in either drag direction. `'num'` is the only data type
// here, so the type-match is trivially satisfied — the rule that matters is
// the side combo.
const isValidConnection = createTypeMatchValidator({
  directions: ['right->left', 'left->right'],
});

export default function NodeGraphBasicsDemo(): React.ReactElement {
  const [nodes, setNodes] = useState<NodeGraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<NodeGraphEdge[]>(INITIAL_EDGES);

  return (
    <DemoWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          height: 420,
        }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
          <NodeGraph
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            isValidConnection={isValidConnection}
            snapToGrid={8}
            responsive
            ariaLabel="Minimal node graph"
            renderNode={node => {
              const data = node.data as BasicData;
              return (
                <div
                  style={{
                    width: 150,
                    background: 'var(--etui-color-bg-elevated, #20222a)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 6,
                    color: 'var(--etui-color-text-primary, #e8e8ea)',
                    fontSize: 12,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '6px 10px',
                      fontWeight: 600,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {data.label}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      padding: '8px 0',
                    }}
                  >
                    {data.ports.map(port => (
                      <div
                        key={port.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '0 8px',
                          justifyContent:
                            port.side === 'left' ? 'flex-start' : 'flex-end',
                        }}
                      >
                        {port.side === 'left' ? (
                          <NodeGraph.Port
                            id={port.id}
                            side="left"
                            dataType="num"
                          />
                        ) : null}
                        <span>{port.label}</span>
                        {port.side === 'right' ? (
                          <NodeGraph.Port
                            id={port.id}
                            side="right"
                            dataType="num"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          >
            <NodeGraph.Background variant="dots" gap={20} />
          </NodeGraph>
        </div>
        <StatusFooter>
          <span>{nodes.length} nodes</span>
          <span>{edges.length} edges</span>
          <span style={{ marginLeft: 'auto' }}>
            <kbd>Drag pin → pin</kbd> connect · <kbd>Drag node</kbd> move ·{' '}
            <kbd>Drag edge end</kbd> reconnect
          </span>
        </StatusFooter>
      </div>
    </DemoWrapper>
  );
}
