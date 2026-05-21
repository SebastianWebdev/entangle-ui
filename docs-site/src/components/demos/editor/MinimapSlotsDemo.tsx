import { useMemo } from 'react';
import {
  Minimap,
  computeBoundsFromItems,
  type MinimapItem,
} from '@/components/editor/Minimap';
import { useFakeViewport } from './minimapDemoUtils';
import { prettyEdge, prettyNode } from './minimapPresentation';

interface NodeDef {
  id: string;
  x: number;
  y: number;
  hue: number;
}

const NODE_W = 80;
const NODE_H = 50;

const NODES: NodeDef[] = [
  { id: 'A', x: 20, y: 20, hue: 200 },
  { id: 'B', x: 180, y: 100, hue: 130 },
  { id: 'C', x: 340, y: 60, hue: 350 },
  { id: 'D', x: 520, y: 160, hue: 35 },
];

const EDGES: Array<[string, string]> = [
  ['A', 'B'],
  ['B', 'C'],
  ['C', 'D'],
];

export default function MinimapSlotsDemo(): React.ReactElement {
  const fake = useFakeViewport({ width: 280, height: 160 });

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
    // Edges first so they render under the nodes.
    return [...edges, ...nodes];
  }, []);

  const worldBounds = useMemo(() => computeBoundsFromItems(items, 40), [items]);

  return (
    <Minimap
      items={items}
      worldBounds={worldBounds}
      transform={fake.transform}
      viewportSize={fake.viewportSize}
      onNavigate={fake.onNavigate}
      width={280}
    >
      <Minimap.Title>Pipeline overview</Minimap.Title>
      <Minimap.Corner side="top-right">v1.2</Minimap.Corner>
      <Minimap.Corner side="bottom-left">4 nodes</Minimap.Corner>
      <Minimap.Footer>Drag to navigate · Arrow keys to pan</Minimap.Footer>
    </Minimap>
  );
}
