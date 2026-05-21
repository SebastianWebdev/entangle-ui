import { useMemo } from 'react';
import {
  Minimap,
  computeBoundsFromItems,
  useMinimapContext,
  type MinimapItem,
} from '@/components/editor/Minimap';
import { useFakeViewport } from './minimapDemoUtils';

const ITEMS: MinimapItem[] = [
  {
    id: 'alpha',
    type: 'rect',
    x: 40,
    y: 40,
    width: 100,
    height: 60,
    color: '#4a86c8',
  },
  {
    id: 'beta',
    type: 'rect',
    x: 220,
    y: 80,
    width: 100,
    height: 60,
    color: '#6aa84f',
  },
  { id: 'gamma', type: 'circle', cx: 420, cy: 70, r: 28, color: '#e63946' },
  { id: 'delta', type: 'circle', cx: 540, cy: 170, r: 22, color: '#f4a261' },
];

function Readout(): React.ReactElement {
  const { hoverWorldPoint, hoveredItemId, isDragging } = useMinimapContext();
  if (!hoverWorldPoint && !isDragging) {
    return <span style={{ opacity: 0.6 }}>Hover the minimap…</span>;
  }
  const x = hoverWorldPoint ? Math.round(hoverWorldPoint.x) : '—';
  const y = hoverWorldPoint ? Math.round(hoverWorldPoint.y) : '—';
  return (
    <span>
      x: <strong>{x}</strong> · y: <strong>{y}</strong>
      {hoveredItemId && (
        <>
          {' · '}
          <strong>{hoveredItemId}</strong>
        </>
      )}
    </span>
  );
}

export default function MinimapContextDemo(): React.ReactElement {
  const fake = useFakeViewport({ width: 320, height: 200 });
  const worldBounds = useMemo(() => computeBoundsFromItems(ITEMS, 30), []);
  return (
    <Minimap
      items={ITEMS}
      worldBounds={worldBounds}
      transform={fake.transform}
      viewportSize={fake.viewportSize}
      onNavigate={fake.onNavigate}
      width={320}
    >
      <Minimap.Title>Hover an item</Minimap.Title>
      <Minimap.Footer>
        <Readout />
      </Minimap.Footer>
    </Minimap>
  );
}
