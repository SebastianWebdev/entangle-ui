import { useMemo } from 'react';
import {
  Minimap,
  computeBoundsFromItems,
  useMinimapHover,
  type MinimapItem,
} from '@/components/editor/Minimap';
import { useFakeViewport } from './minimapDemoUtils';
import { prettyEdge, prettyNode } from './minimapPresentation';

interface NodeDef {
  id: string;
  x: number;
  y: number;
  hue: number;
  label: string;
}

const NODE_W = 96;
const NODE_H = 56;

const NODES: NodeDef[] = [
  { id: 'source', x: 30, y: 30, hue: 200, label: 'Source' },
  { id: 'filter', x: 220, y: 90, hue: 130, label: 'Filter' },
  { id: 'mix', x: 410, y: 50, hue: 350, label: 'Mix' },
  { id: 'output', x: 540, y: 170, hue: 35, label: 'Output' },
];

const EDGES: Array<[string, string]> = [
  ['source', 'filter'],
  ['filter', 'mix'],
  ['mix', 'output'],
];

function Readout(): React.ReactElement {
  const { hoverWorldPoint, hoveredItemId } = useMinimapHover();
  const node = NODES.find(n => n.id === hoveredItemId);
  if (!hoverWorldPoint) {
    return <span style={{ opacity: 0.6 }}>Hover the minimap…</span>;
  }
  const x = Math.round(hoverWorldPoint.x);
  const y = Math.round(hoverWorldPoint.y);
  return (
    <span>
      x: <strong>{x}</strong> · y: <strong>{y}</strong>
      {node && (
        <>
          {' · '}
          <strong>{node.label}</strong>
        </>
      )}
    </span>
  );
}

export default function MinimapContextDemo(): React.ReactElement {
  const fake = useFakeViewport({ width: 320, height: 200 });

  const items = useMemo<MinimapItem[]>(() => {
    const byId = new Map(NODES.map(n => [n.id, n] as const));
    const nodes = NODES.map(n =>
      prettyNode({
        id: n.id,
        x: n.x,
        y: n.y,
        width: NODE_W,
        height: NODE_H,
        hue: n.hue,
      })
    );
    const edges = EDGES.map(([from, to], i) => {
      const a = byId.get(from);
      const b = byId.get(to);
      if (!a || !b) return null;
      return prettyEdge({
        id: `edge-${i}`,
        from: { x: a.x + NODE_W, y: a.y + NODE_H / 2 },
        to: { x: b.x, y: b.y + NODE_H / 2 },
      });
    }).filter((it): it is MinimapItem => it !== null);
    return [...edges, ...nodes];
  }, []);

  const worldBounds = useMemo(() => computeBoundsFromItems(items, 30), [items]);

  return (
    <Minimap
      items={items}
      worldBounds={worldBounds}
      transform={fake.transform}
      viewportSize={fake.viewportSize}
      onNavigate={fake.onNavigate}
      width={320}
    >
      <Minimap.Title>Hover a node</Minimap.Title>
      <Minimap.Footer>
        <Readout />
      </Minimap.Footer>
    </Minimap>
  );
}
