import { useMemo } from 'react';
import {
  Minimap,
  computeBoundsFromItems,
  type MinimapItem,
} from '@/components/editor/Minimap';
import { useFakeViewport } from './minimapDemoUtils';

const ITEMS: MinimapItem[] = [
  {
    id: 'a',
    type: 'rect',
    x: 20,
    y: 20,
    width: 80,
    height: 50,
    color: '#4a86c8',
  },
  {
    id: 'b',
    type: 'rect',
    x: 180,
    y: 100,
    width: 80,
    height: 50,
    color: '#6aa84f',
  },
  {
    id: 'c',
    type: 'rect',
    x: 340,
    y: 60,
    width: 80,
    height: 50,
    color: '#e63946',
  },
  {
    id: 'd',
    type: 'rect',
    x: 520,
    y: 160,
    width: 80,
    height: 50,
    color: '#f4a261',
  },
  {
    id: 'e1',
    type: 'line',
    x1: 100,
    y1: 45,
    x2: 180,
    y2: 125,
    color: 'rgba(255,255,255,0.4)',
  },
  {
    id: 'e2',
    type: 'line',
    x1: 260,
    y1: 125,
    x2: 340,
    y2: 85,
    color: 'rgba(255,255,255,0.4)',
  },
  {
    id: 'e3',
    type: 'line',
    x1: 420,
    y1: 85,
    x2: 520,
    y2: 185,
    color: 'rgba(255,255,255,0.4)',
  },
];

export default function MinimapSlotsDemo(): React.ReactElement {
  const fake = useFakeViewport({ width: 280, height: 160 });
  const worldBounds = useMemo(() => computeBoundsFromItems(ITEMS, 40), []);
  return (
    <Minimap
      items={ITEMS}
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
