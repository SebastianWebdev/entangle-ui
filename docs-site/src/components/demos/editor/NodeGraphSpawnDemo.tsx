import { useCallback } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  createTypeMatchValidator,
  useNodeGraph,
  type NodeGraphNode,
  type NodeGraphSpawnContext,
  type NodeGraphTemplate,
} from '@/components/editor/NodeGraph';
import {
  RecipeNodeBody,
  StatusFooter,
  type DataType,
  type RecipeNodeData,
  type RecipePin,
} from './nodeGraphRecipeData';

// `<NodeGraph.SpawnPalette>` renders a portal-mounted fuzzy-search palette and
// subscribes to the store's spawn-request channel — so right-clicking empty
// space (or a group) opens it automatically at the pointer. Each template's
// `build(worldPoint)` returns the node body minus its id; the library assigns
// the id and hands the finished node to `onSpawn`.

const pin = (
  id: string,
  label: string,
  side: 'left' | 'right',
  dataType: DataType
): RecipePin => ({ id, label, side, dataType });

const snap = (value: number): number => Math.round(value / 8) * 8;

function template(
  id: string,
  title: string,
  group: string,
  accent: string,
  pins: RecipePin[],
  keywords: string[],
  subtitle?: string
): NodeGraphTemplate {
  return {
    id,
    title,
    group,
    keywords,
    ...(subtitle !== undefined ? { subtitle } : {}),
    build: worldPoint => ({
      position: { x: snap(worldPoint.x), y: snap(worldPoint.y) },
      data: { title, subtitle, accent, pins } satisfies RecipeNodeData,
    }),
  };
}

const TEMPLATES: NodeGraphTemplate[] = [
  template(
    'event-begin',
    'Event BeginPlay',
    'Events',
    '#ff5e54',
    [pin('exec', '', 'right', 'exec')],
    ['begin', 'play', 'start', 'event']
  ),
  template(
    'event-tick',
    'Event Tick',
    'Events',
    '#ff5e54',
    [pin('exec', '', 'right', 'exec'), pin('dt', 'Delta', 'right', 'float')],
    ['tick', 'frame', 'update']
  ),
  template(
    'branch',
    'Branch',
    'Flow',
    '#5d8dff',
    [
      pin('exec', '', 'left', 'exec'),
      pin('cond', 'Condition', 'left', 'bool'),
      pin('true', 'True', 'right', 'exec'),
      pin('false', 'False', 'right', 'exec'),
    ],
    ['if', 'condition', 'branch'],
    'Flow Control'
  ),
  template(
    'sequence',
    'Sequence',
    'Flow',
    '#5d8dff',
    [
      pin('exec', '', 'left', 'exec'),
      pin('then0', 'Then 0', 'right', 'exec'),
      pin('then1', 'Then 1', 'right', 'exec'),
    ],
    ['sequence', 'then', 'order'],
    'Flow Control'
  ),
  template(
    'add',
    'Add (float)',
    'Math',
    '#5fd97e',
    [
      pin('a', 'A', 'left', 'float'),
      pin('b', 'B', 'left', 'float'),
      pin('out', 'Result', 'right', 'float'),
    ],
    ['add', 'plus', 'sum', 'math'],
    'Pure'
  ),
  template(
    'multiply',
    'Multiply (float)',
    'Math',
    '#5fd97e',
    [
      pin('a', 'A', 'left', 'float'),
      pin('b', 'B', 'left', 'float'),
      pin('out', 'Result', 'right', 'float'),
    ],
    ['multiply', 'times', 'product', 'math'],
    'Pure'
  ),
  template(
    'print',
    'Print String',
    'Debug',
    '#62d5d5',
    [
      pin('exec', '', 'left', 'exec'),
      pin('text', 'In String', 'left', 'string'),
      pin('done', '', 'right', 'exec'),
    ],
    ['print', 'log', 'debug']
  ),
  template(
    'delay',
    'Delay',
    'Utility',
    '#62d5d5',
    [
      pin('exec', '', 'left', 'exec'),
      pin('duration', 'Duration', 'left', 'float'),
      pin('done', 'Completed', 'right', 'exec'),
    ],
    ['delay', 'wait', 'timer']
  ),
];

const INITIAL_NODES: NodeGraphNode[] = [
  {
    id: 'seed-event',
    position: { x: -240, y: -40 },
    data: {
      title: 'Event BeginPlay',
      accent: '#ff5e54',
      pins: [pin('exec', '', 'right', 'exec')],
    } satisfies RecipeNodeData,
  },
  {
    id: 'seed-print',
    position: { x: 60, y: -60 },
    data: {
      title: 'Print String',
      subtitle: 'Debug',
      accent: '#62d5d5',
      pins: [
        pin('exec', '', 'left', 'exec'),
        pin('text', 'In String', 'left', 'string'),
      ],
    } satisfies RecipeNodeData,
  },
];

const isValidConnection = createTypeMatchValidator({
  directions: ['right->left'],
});

export default function NodeGraphSpawnDemo(): React.ReactElement {
  const graph = useNodeGraph({
    nodes: INITIAL_NODES,
    edges: [
      {
        id: 'e1',
        source: { node: 'seed-event', port: 'exec' },
        target: { node: 'seed-print', port: 'exec' },
      },
    ],
  });

  const renderNode = useCallback(
    (n: NodeGraphNode) => <RecipeNodeBody node={n} />,
    []
  );

  const handleSpawn = useCallback(
    (spawned: NodeGraphNode, _ctx: NodeGraphSpawnContext) => {
      graph.setNodes(prev => [...prev, spawned]);
      graph.setSelection({ nodes: [spawned.id], edges: [], groups: [] });
    },
    [graph]
  );

  return (
    <DemoWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          height: 480,
        }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
          <NodeGraph
            {...graph.bind}
            renderNode={renderNode}
            isValidConnection={isValidConnection}
            snapToGrid={8}
            minZoom={0.3}
            maxZoom={2}
            responsive
            ariaLabel="Spawn palette graph"
          >
            <NodeGraph.Background variant="dots" gap={22} />
            <NodeGraph.SpawnPalette
              templates={TEMPLATES}
              onSpawn={handleSpawn}
              placeholder="Search nodes to add…"
            />
          </NodeGraph>
        </div>
        <StatusFooter>
          <span>
            <kbd>Right-click</kbd> empty space → fuzzy-search palette → the node
            lands at the pointer
          </span>
          <span style={{ marginLeft: 'auto' }}>
            {graph.nodes.length} nodes · {TEMPLATES.length} templates
          </span>
        </StatusFooter>
      </div>
    </DemoWrapper>
  );
}
