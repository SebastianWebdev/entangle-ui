import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  NodeGraph,
  useNodeGraph,
  type NodeGraphEdge,
  type NodeGraphHandle,
  type NodeGraphNode,
} from '@/components/editor/NodeGraph';
import { Badge } from '@/components/primitives/Badge';
import { Switch } from '@/components/primitives/Switch';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/navigation';
import { StatusFooter } from './nodeGraphRecipeData';

// A real, interactive performance harness. Pick a node count, optionally let
// the camera orbit (sustained pan → every canvas layer redraws each frame),
// and watch the live FPS / frame-time meter. Drag, marquee, and zoom to feel
// the interaction cost yourself.
//
// What makes this scale (all inherited from the architecture):
//   • per-id slice selectors — only the dragged / hovered node re-renders
//   • edges / groups / background on separate <ViewportLayer> canvases
//   • the background pattern is LOD + pattern-fill, bounded per frame
//   • broad-phase Bézier rejection keeps edge hit-testing near O(edges)

const COUNTS = [120, 320, 640] as const;
const ACCENTS = [
  '#5d8dff',
  '#5fd97e',
  '#ff7e54',
  '#c98bff',
  '#ffd24a',
  '#62d5d5',
];
const SPACING_X = 210;
const SPACING_Y = 120;

interface BenchData {
  title: string;
  accent: string;
}

interface BuiltGraph {
  nodes: NodeGraphNode[];
  edges: NodeGraphEdge[];
  center: { x: number; y: number };
  radius: number;
}

function buildGraph(count: number): BuiltGraph {
  const cols = Math.ceil(Math.sqrt(count));
  const nodes: NodeGraphNode[] = [];
  const edges: NodeGraphEdge[] = [];
  for (let i = 0; i < count; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    nodes.push({
      id: `n${i}`,
      position: { x: col * SPACING_X, y: row * SPACING_Y },
      // Explicit size → hit-testing / marquee / minimap skip DOM measurement.
      width: 132,
      height: 58,
      data: {
        title: `Node ${i}`,
        accent: ACCENTS[i % ACCENTS.length] ?? '#5d8dff',
      },
    });
    // Wire each node to its left neighbour in the same row.
    if (col > 0) {
      edges.push({
        id: `e${i}`,
        source: { node: `n${i - 1}`, port: 'out' },
        target: { node: `n${i}`, port: 'in' },
      });
    }
  }
  const rows = Math.ceil(count / cols);
  const width = (cols - 1) * SPACING_X;
  const height = (rows - 1) * SPACING_Y;
  return {
    nodes,
    edges,
    center: { x: width / 2, y: height / 2 },
    radius: Math.max(width, height) / 2,
  };
}

function BenchNode({ node }: { node: NodeGraphNode }): React.ReactElement {
  const data = node.data as BenchData;
  return (
    <NodeGraph.NodeBody accent={data.accent} style={{ width: 132 }}>
      <NodeGraph.NodeHeader title={data.title} />
      <NodeGraph.PinList columnGap={10}>
        <NodeGraph.Pin
          id="in"
          side="left"
          dataType="flow"
          color="#8ab4ff"
          label=""
        />
        <NodeGraph.Pin
          id="out"
          side="right"
          dataType="flow"
          color="#8ab4ff"
          label=""
        />
      </NodeGraph.PinList>
    </NodeGraph.NodeBody>
  );
}

export default function NodeGraphBenchmarkDemo(): React.ReactElement {
  const initial = useMemo(() => buildGraph(COUNTS[0]), []);
  const graph = useNodeGraph({ nodes: initial.nodes, edges: initial.edges });
  const ref = useRef<NodeGraphHandle>(null);

  const [count, setCount] = useState<number>(COUNTS[0]);
  const [animate, setAnimate] = useState(false);
  const [stats, setStats] = useState({ fps: 60, ms: 16.7, worst: 17 });

  // Live values the rAF loop reads without re-subscribing.
  const animateRef = useRef(animate);
  animateRef.current = animate;
  const extentRef = useRef({ center: initial.center, radius: initial.radius });

  const renderNode = useCallback(
    (n: NodeGraphNode) => <BenchNode node={n} />,
    []
  );

  const regenerate = useCallback(
    (next: number) => {
      const built = buildGraph(next);
      extentRef.current = { center: built.center, radius: built.radius };
      graph.setNodes(built.nodes);
      graph.setEdges(built.edges);
      graph.clearSelection();
      setCount(next);
      // Let the new nodes mount + measure before framing them.
      window.setTimeout(() => ref.current?.fitToContent(80), 80);
    },
    [graph]
  );

  // Frame-time meter + optional camera orbit. The orbit pans the viewport in a
  // slow circle so every layer redraws each frame — that's the cost the meter
  // reports. Idle (animate off) it just measures the browser's natural cadence.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let frames = 0;
    let worst = 0;
    const loop = (now: number): void => {
      const dt = now - last;
      last = now;
      acc += dt;
      frames += 1;
      if (dt > worst) worst = dt;

      if (animateRef.current) {
        const { center, radius } = extentRef.current;
        const t = now / 1000;
        const r = radius * 0.35;
        ref.current?.centerOn({
          x: center.x + Math.cos(t * 0.5) * r,
          y: center.y + Math.sin(t * 0.5) * r,
        });
      }

      if (acc >= 300) {
        setStats({
          fps: Math.round((frames * 1000) / acc),
          ms: Math.round((acc / frames) * 10) / 10,
          worst: Math.round(worst),
        });
        acc = 0;
        frames = 0;
        worst = 0;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Frame on first mount.
  useEffect(() => {
    const id = window.setTimeout(() => ref.current?.fitToContent(80), 80);
    return () => window.clearTimeout(id);
  }, []);

  const fpsColor =
    stats.fps >= 50 ? 'success' : stats.fps >= 30 ? 'warning' : 'error';

  return (
    <DemoWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          height: 560,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: 'var(--etui-color-text-muted, #7a808a)',
            }}
          >
            Node count
          </span>
          <SegmentedControl
            size="sm"
            value={String(count)}
            onChange={value => regenerate(Number(value))}
            aria-label="Node count"
          >
            {COUNTS.map(c => (
              <SegmentedControlItem key={c} value={String(c)}>
                {c}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          <Switch
            size="sm"
            checked={animate}
            onChange={setAnimate}
            label="Orbit camera"
          />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Badge color={fpsColor} variant="subtle">
              {stats.fps} fps
            </Badge>
            <Badge color="neutral" variant="subtle">
              {stats.ms} ms/frame
            </Badge>
            <Badge color="neutral" variant="subtle">
              worst {stats.worst} ms
            </Badge>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <NodeGraph
            ref={ref}
            {...graph.bind}
            renderNode={renderNode}
            minZoom={0.05}
            maxZoom={2}
            responsive
            ariaLabel="Performance benchmark graph"
          >
            <NodeGraph.Background variant="dots" gap={26} />
            <NodeGraph.Minimap placement="bottom-right" width={190} />
          </NodeGraph>
        </div>
        <StatusFooter>
          <span>
            {graph.nodes.length} nodes · {graph.edges.length} edges
          </span>
          <span style={{ marginLeft: 'auto' }}>
            Toggle <strong>Orbit camera</strong> to load the renderer · drag /
            marquee / wheel-zoom to feel interaction cost
          </span>
        </StatusFooter>
      </div>
    </DemoWrapper>
  );
}
