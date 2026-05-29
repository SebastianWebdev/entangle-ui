import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  createTypeMatchValidator,
  useNodeGraph,
  type NodeGraphEdge,
  type NodeGraphEdgeStyle,
  type NodeGraphEdgeStyleCtx,
  type NodeGraphHandle,
  type NodeGraphNode,
} from '@/components/editor/NodeGraph';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/navigation';
import {
  RecipeNodeBody,
  StatusFooter,
  TYPE_COLOR,
  type DataType,
  type RecipeNodeData,
  type RecipePin,
} from './nodeGraphRecipeData';

// Three things in one recipe:
//   1. `edgeStyle` — colour each wire by its source pin's `dataType`, widen
//      the selected / hovered wire, dash an "async" wire, and pulse an
//      "active" wire's width over time.
//   2. `renderEdgeLabel` — an HTML chip at the wire midpoint.
//   3. A rAF that calls `ref.invalidate('edges')` so the time-based pulse
//      animates — the general pattern for any animated edge style.

type Scheme = 'type' | 'flow' | 'mono';

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

const INITIAL_NODES: NodeGraphNode[] = [
  node('event', -480, -40, {
    title: 'Event Tick',
    subtitle: 'Lifecycle',
    accent: '#ff5e54',
    pins: [pin('exec', '', 'right', 'exec')],
  }),
  node('speed', -480, 110, {
    title: 'Get Speed',
    subtitle: 'Pure',
    accent: '#5fd97e',
    pins: [pin('out', 'Speed', 'right', 'float')],
  }),
  node('thr', -480, 230, {
    title: 'Threshold',
    subtitle: 'float',
    accent: '#5fd97e',
    pins: [pin('out', '120.0', 'right', 'float')],
  }),
  node('cmp', -200, 150, {
    title: 'Speed > Threshold',
    subtitle: 'Pure',
    accent: '#5fd97e',
    pins: [
      pin('a', 'A', 'left', 'float'),
      pin('b', 'B', 'left', 'float'),
      pin('out', 'Result', 'right', 'bool'),
    ],
  }),
  node('branch', 80, 10, {
    title: 'Branch',
    subtitle: 'Flow Control',
    accent: '#5d8dff',
    pins: [
      pin('exec', '', 'left', 'exec'),
      pin('cond', 'Condition', 'left', 'bool'),
      pin('true', 'True', 'right', 'exec'),
      pin('false', 'False', 'right', 'exec'),
    ],
  }),
  node('msg', 80, 200, {
    title: 'String',
    subtitle: 'string',
    accent: '#b06fb0',
    pins: [pin('out', '"Too fast!"', 'right', 'string')],
  }),
  node('print', 380, 80, {
    title: 'Print String',
    subtitle: 'Debug',
    accent: '#62d5d5',
    pins: [
      pin('exec', '', 'left', 'exec'),
      pin('text', 'In String', 'left', 'string'),
    ],
  }),
];

interface EdgeMeta {
  active?: boolean;
  async?: boolean;
  label?: string;
}

const INITIAL_EDGES: NodeGraphEdge[] = [
  {
    id: 'e-exec',
    source: { node: 'event', port: 'exec' },
    target: { node: 'branch', port: 'exec' },
    data: { active: true } satisfies EdgeMeta,
  },
  {
    id: 'e-a',
    source: { node: 'speed', port: 'out' },
    target: { node: 'cmp', port: 'a' },
  },
  {
    id: 'e-b',
    source: { node: 'thr', port: 'out' },
    target: { node: 'cmp', port: 'b' },
  },
  {
    id: 'e-cond',
    source: { node: 'cmp', port: 'out' },
    target: { node: 'branch', port: 'cond' },
    data: { label: 'bool' } satisfies EdgeMeta,
  },
  {
    id: 'e-true',
    source: { node: 'branch', port: 'true' },
    target: { node: 'print', port: 'exec' },
    data: { async: true } satisfies EdgeMeta,
  },
  {
    id: 'e-text',
    source: { node: 'msg', port: 'out' },
    target: { node: 'print', port: 'text' },
    data: { label: 'string' } satisfies EdgeMeta,
  },
];

const isValidConnection = createTypeMatchValidator({
  directions: ['right->left'],
});

export default function NodeGraphEdgeStyleDemo(): React.ReactElement {
  const graph = useNodeGraph({ nodes: INITIAL_NODES, edges: INITIAL_EDGES });
  const ref = useRef<NodeGraphHandle>(null);
  const [scheme, setScheme] = useState<Scheme>('type');
  // Mirror the scheme into a ref so the memoized `edgeStyle` reads the live
  // value without being re-created (and the rAF below re-renders the canvas
  // every frame anyway).
  const schemeRef = useRef(scheme);
  schemeRef.current = scheme;

  const renderNode = useCallback(
    (n: NodeGraphNode) => <RecipeNodeBody node={n} />,
    []
  );

  const edgeStyle = useCallback(
    (edge: NodeGraphEdge, ctx: NodeGraphEdgeStyleCtx): NodeGraphEdgeStyle => {
      const type = (ctx.sourcePort?.dataType ?? 'any') as DataType;
      const meta = edge.data as EdgeMeta | undefined;
      const style: NodeGraphEdgeStyle = {};

      if (schemeRef.current === 'type') {
        style.color = TYPE_COLOR[type] ?? TYPE_COLOR.any;
      } else if (schemeRef.current === 'flow') {
        style.color = type === 'exec' ? '#f5f5f5' : 'rgba(150, 162, 184, 0.75)';
        style.width = type === 'exec' ? 2 : 1.4;
      }
      // 'mono' leaves color/width undefined → the theme default stroke.

      if (meta?.async) style.dash = [7, 6];

      if (meta?.active) {
        // Width pulse driven by wall-clock time. The rAF loop below forces a
        // redraw each frame, so this re-evaluates and animates.
        style.color = '#ffd24a';
        style.width = 2 + (Math.sin(performance.now() / 180) + 1) * 1.1;
      }

      if (ctx.selected) style.width = Math.max(style.width ?? 0, 3.2);
      else if (ctx.hovered) style.width = Math.max(style.width ?? 0, 2.2);

      return style;
    },
    []
  );

  const renderEdgeLabel = useCallback((edge: NodeGraphEdge) => {
    const meta = edge.data as EdgeMeta | undefined;
    if (!meta?.label) return null;
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          padding: '1px 6px',
          borderRadius: 999,
          background: 'var(--etui-color-bg-elevated, #20222a)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: 'var(--etui-color-text-secondary, #aeb4be)',
        }}
      >
        {meta.label}
      </span>
    );
  }, []);

  // Animate the "active" wire: redraw the edge layer every frame so the
  // time-based width pulse in `edgeStyle` advances. One canvas layer, no
  // React re-render.
  useEffect(() => {
    let raf = 0;
    const loop = (): void => {
      ref.current?.invalidate('edges');
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const legend = useMemo(
    () =>
      (['exec', 'float', 'bool', 'string'] as DataType[]).map(t => (
        <span
          key={t}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: TYPE_COLOR[t],
              display: 'inline-block',
            }}
          />
          {t}
        </span>
      )),
    []
  );

  return (
    <DemoWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          height: 520,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 11,
              color: 'var(--etui-color-text-muted, #7a808a)',
            }}
          >
            Edge colour scheme
          </span>
          <SegmentedControl
            size="sm"
            value={scheme}
            onChange={value => setScheme(value as Scheme)}
            aria-label="Edge colour scheme"
          >
            <SegmentedControlItem value="type">By type</SegmentedControlItem>
            <SegmentedControlItem value="flow">
              Exec vs data
            </SegmentedControlItem>
            <SegmentedControlItem value="mono">Mono</SegmentedControlItem>
          </SegmentedControl>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <NodeGraph
            ref={ref}
            {...graph.bind}
            renderNode={renderNode}
            edgeStyle={edgeStyle}
            renderEdgeLabel={renderEdgeLabel}
            isValidConnection={isValidConnection}
            snapToGrid={8}
            minZoom={0.3}
            maxZoom={2}
            responsive
            ariaLabel="Edge styling graph"
          >
            <NodeGraph.Background variant="dots" gap={22} />
          </NodeGraph>
        </div>
        <StatusFooter>
          {legend}
          <span style={{ marginLeft: 'auto' }}>
            <kbd>Click</kbd> a wire to select it (widens) · the gold exec wire
            pulses · the dashed wire is flagged <code>async</code>
          </span>
        </StatusFooter>
      </div>
    </DemoWrapper>
  );
}
