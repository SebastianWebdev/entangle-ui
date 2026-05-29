import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  createTypeMatchValidator,
  useNodeGraph,
  type NodeGraphHandle,
  type NodeGraphNode,
} from '@/components/editor/NodeGraph';
import { Button } from '@/components/primitives/Button';
import {
  RecipeNodeBody,
  StatusFooter,
  type DataType,
  type RecipeNodeData,
  type RecipePin,
} from './nodeGraphRecipeData';

// Two camera surfaces, one source of truth:
//   • `<NodeGraph.Toolbar>` — the built-in Fit / Fit-selection / zoom buttons,
//     anchored to a viewport corner (they ignore pan/zoom).
//   • the imperative handle (`ref`) — `fitToContent`, `focusNode`, `centerOn`,
//     `zoomToRect`, plus `getTransform` for the live readout below.

const pin = (
  id: string,
  label: string,
  side: 'left' | 'right',
  dataType: DataType
): RecipePin => ({ id, label, side, dataType });

const node = (
  id: string,
  x: number,
  y: number,
  data: RecipeNodeData
): NodeGraphNode => ({ id, position: { x, y }, data });

const NODES: NodeGraphNode[] = [
  node('event', -620, -200, {
    title: 'Event BeginPlay',
    accent: '#ff5e54',
    pins: [pin('exec', '', 'right', 'exec')],
  }),
  node('init', -300, -260, {
    title: 'Initialize',
    subtitle: 'Setup',
    accent: '#5d8dff',
    pins: [
      pin('exec', '', 'left', 'exec'),
      pin('done', '', 'right', 'exec'),
      pin('value', 'Value', 'right', 'float'),
    ],
  }),
  node('add', 40, -180, {
    title: 'Add',
    subtitle: 'Pure',
    accent: '#5fd97e',
    pins: [
      pin('a', 'A', 'left', 'float'),
      pin('b', 'B', 'left', 'float'),
      pin('out', 'Result', 'right', 'float'),
    ],
  }),
  node('store', 380, -240, {
    title: 'Set Variable',
    accent: '#e8a36b',
    pins: [
      pin('exec', '', 'left', 'exec'),
      pin('value', 'Value', 'left', 'float'),
      pin('done', '', 'right', 'exec'),
    ],
  }),
  node('print', 380, 40, {
    title: 'Print String',
    subtitle: 'Debug',
    accent: '#62d5d5',
    pins: [
      pin('exec', '', 'left', 'exec'),
      pin('text', 'Text', 'left', 'string'),
    ],
  }),
];

const EDGES = [
  {
    id: 'e1',
    source: { node: 'event', port: 'exec' },
    target: { node: 'init', port: 'exec' },
  },
  {
    id: 'e2',
    source: { node: 'init', port: 'value' },
    target: { node: 'add', port: 'a' },
  },
  {
    id: 'e3',
    source: { node: 'init', port: 'done' },
    target: { node: 'store', port: 'exec' },
  },
  {
    id: 'e4',
    source: { node: 'add', port: 'out' },
    target: { node: 'store', port: 'value' },
  },
];

const isValidConnection = createTypeMatchValidator({
  directions: ['right->left'],
});

/**
 * Live transform readout. Owns its own state + rAF poll loop so the
 * `setState` cadence (~8 Hz) doesn't trigger a rerender of the parent
 * demo — which would cascade through `<NodeGraph>`, the toolbar buttons,
 * and every inline `onClick` callback. Isolating it keeps the rest of
 * the demo idle except on real user interaction.
 */
function TransformReadout({
  handleRef,
}: {
  handleRef: RefObject<NodeGraphHandle | null>;
}): React.ReactElement {
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (now: number): void => {
      if (now - last > 120) {
        const t = handleRef.current?.getTransform();
        if (t)
          setView({ x: Math.round(t.x), y: Math.round(t.y), zoom: t.zoom });
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [handleRef]);

  return (
    <span>
      transform&nbsp;·&nbsp;x&nbsp;{view.x}&nbsp;·&nbsp;y&nbsp;{view.y}
      &nbsp;·&nbsp;zoom&nbsp;{Math.round(view.zoom * 100)}%
    </span>
  );
}

export default function NodeGraphCameraDemo(): React.ReactElement {
  const graph = useNodeGraph({ nodes: NODES, edges: EDGES });
  const ref = useRef<NodeGraphHandle>(null);

  const renderNode = useCallback(
    (n: NodeGraphNode) => <RecipeNodeBody node={n} />,
    []
  );

  // Fit everything once on mount so the demo opens framed.
  useEffect(() => {
    const id = window.setTimeout(() => ref.current?.fitToContent(64), 60);
    return () => window.clearTimeout(id);
  }, []);

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
            ref={ref}
            {...graph.bind}
            renderNode={renderNode}
            isValidConnection={isValidConnection}
            snapToGrid={8}
            minZoom={0.2}
            maxZoom={3}
            responsive
            ariaLabel="Camera control graph"
          >
            <NodeGraph.Background variant="dots" gap={22} />
            <NodeGraph.Toolbar placement="top-left">
              <NodeGraph.FitContentButton padding={64} />
              <NodeGraph.FitSelectionButton padding={96} />
              <NodeGraph.ToolbarSeparator />
              <NodeGraph.ZoomOutButton />
              <NodeGraph.ResetZoomButton />
              <NodeGraph.ZoomInButton />
            </NodeGraph.Toolbar>
            <NodeGraph.Minimap placement="bottom-right" width={180} />
          </NodeGraph>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => ref.current?.fitToContent(64)}
          >
            Fit all
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              graph.setSelection({ nodes: ['event'], edges: [], groups: [] });
              ref.current?.focusNode('event');
            }}
          >
            Focus: Event
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              graph.setSelection({ nodes: ['print'], edges: [], groups: [] });
              ref.current?.focusNode('print');
            }}
          >
            Focus: Print
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => ref.current?.centerOn({ x: 0, y: 0 }, 1)}
          >
            Center origin (1:1)
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              ref.current?.zoomToRect(
                { x: 40, y: -260, width: 720, height: 380 },
                48
              )
            }
          >
            Frame output region
          </Button>
        </div>
        <StatusFooter>
          <TransformReadout handleRef={ref} />
          <span style={{ marginLeft: 'auto' }}>
            Toolbar buttons call the same code path as the imperative handle.
          </span>
        </StatusFooter>
      </div>
    </DemoWrapper>
  );
}
