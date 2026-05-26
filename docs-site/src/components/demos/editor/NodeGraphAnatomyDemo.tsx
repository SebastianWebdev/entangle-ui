import { useCallback, useMemo } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  createTypeMatchValidator,
  useNodeGraph,
  type NodeGraphNode,
} from '@/components/editor/NodeGraph';
import {
  TYPE_COLOR,
  pinShape,
  StatusFooter,
  type RecipePin,
} from './nodeGraphRecipeData';

// This recipe is the integration test for the node-authoring compounds:
//   <NodeGraph.NodeBody>     themed panel + auto selected/hover visuals
//   <NodeGraph.NodeHeader>   icon + title + subtitle strip
//   <NodeGraph.PinList>      two-column grid, routes pins by `side`
//   <NodeGraph.Pin>          handle + label one-liner (auto-fills when wired)
//   <NodeGraph.NodeSection>  collapsible "advanced pins" group
// Everything is built from library parts — no hand-rolled chrome.

interface AnatomyData {
  title: string;
  subtitle?: string;
  icon?: string;
  accent: string;
  main: RecipePin[];
  /** Tucked behind a collapsible "Advanced" section when present. */
  advanced?: RecipePin[];
}

const p = (
  id: string,
  label: string,
  side: 'left' | 'right',
  dataType: RecipePin['dataType']
): RecipePin => ({ id, label, side, dataType });

const INITIAL_NODES: NodeGraphNode[] = [
  {
    id: 'make-transform',
    position: { x: -300, y: -120 },
    data: {
      title: 'Make Transform',
      subtitle: 'Pure',
      icon: 'f',
      accent: '#5fd97e',
      main: [
        p('location', 'Location', 'left', 'vector'),
        p('rotation', 'Rotation', 'left', 'vector'),
        p('out', 'Return Value', 'right', 'object'),
      ],
      advanced: [
        p('scale', 'Scale', 'left', 'vector'),
        p('uniform', 'Uniform Scale', 'left', 'float'),
      ],
    } satisfies AnatomyData,
  },
  {
    id: 'spawn',
    position: { x: 60, y: -140 },
    data: {
      title: 'Spawn Actor',
      subtitle: 'From Class',
      icon: '✦',
      accent: '#5d8dff',
      main: [
        p('exec', '', 'left', 'exec'),
        p('class', 'Class', 'left', 'object'),
        p('transform', 'Transform', 'left', 'object'),
        p('done', '', 'right', 'exec'),
        p('spawned', 'Return Value', 'right', 'object'),
      ],
    } satisfies AnatomyData,
  },
];

const isValidConnection = createTypeMatchValidator({
  directions: ['right->left'],
});

function AnatomyNodeBody({
  node,
}: {
  node: NodeGraphNode;
}): React.ReactElement {
  const data = node.data as AnatomyData;
  const renderPin = (pin: RecipePin): React.ReactElement => (
    <NodeGraph.Pin
      key={pin.id}
      id={pin.id}
      side={pin.side}
      dataType={pin.dataType}
      shape={pinShape(pin.dataType)}
      color={TYPE_COLOR[pin.dataType]}
      label={pin.label}
    />
  );

  return (
    <NodeGraph.NodeBody accent={data.accent} style={{ width: 210 }}>
      <NodeGraph.NodeHeader
        title={data.title}
        subtitle={data.subtitle}
        icon={
          data.icon ? (
            <span style={{ color: data.accent, fontWeight: 700 }}>
              {data.icon}
            </span>
          ) : undefined
        }
      />
      <NodeGraph.PinList columnGap={16}>
        {data.main.map(renderPin)}
      </NodeGraph.PinList>
      {data.advanced ? (
        <NodeGraph.NodeSection title="Advanced" defaultCollapsed>
          <NodeGraph.PinList columnGap={16}>
            {data.advanced.map(renderPin)}
          </NodeGraph.PinList>
        </NodeGraph.NodeSection>
      ) : null}
    </NodeGraph.NodeBody>
  );
}

export default function NodeGraphAnatomyDemo(): React.ReactElement {
  const initial = useMemo(
    () => ({
      nodes: INITIAL_NODES,
      edges: [
        {
          id: 'e1',
          source: { node: 'make-transform', port: 'out' },
          target: { node: 'spawn', port: 'transform' },
        },
      ],
    }),
    []
  );
  const graph = useNodeGraph(initial);
  const renderNode = useCallback(
    (node: NodeGraphNode) => <AnatomyNodeBody node={node} />,
    []
  );

  return (
    <DemoWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          height: 460,
        }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
          <NodeGraph
            {...graph.bind}
            renderNode={renderNode}
            isValidConnection={isValidConnection}
            snapToGrid={8}
            responsive
            ariaLabel="Node anatomy graph"
          >
            <NodeGraph.Background variant="grid" gap={24} />
          </NodeGraph>
        </div>
        <StatusFooter>
          <span>
            Expand “Advanced” on the left node — the extra pins re-wire live.
          </span>
          <span style={{ marginLeft: 'auto' }}>
            {graph.nodes.length} nodes · {graph.edges.length} edges
          </span>
        </StatusFooter>
      </div>
    </DemoWrapper>
  );
}
