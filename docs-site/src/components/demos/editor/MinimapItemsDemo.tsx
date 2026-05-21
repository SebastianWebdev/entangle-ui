import { useMemo } from 'react';
import {
  Minimap,
  computeBoundsFromItems,
  type MinimapItem,
} from '@/components/editor/Minimap';
import { useFakeViewport } from './minimapDemoUtils';

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outer: number,
  inner: number
): void {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < spikes; i += 1) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
    rot += step;
  }
  ctx.lineTo(cx, cy - outer);
  ctx.closePath();
  ctx.fill();
}

const ITEMS: MinimapItem[] = [
  {
    id: 'r1',
    type: 'rect',
    x: 40,
    y: 40,
    width: 120,
    height: 60,
    color: '#4a86c8',
  },
  {
    id: 'r2',
    type: 'rect',
    x: 220,
    y: 140,
    width: 100,
    height: 60,
    color: '#6aa84f',
  },
  { id: 'c1', type: 'circle', cx: 420, cy: 80, r: 30, color: '#e63946' },
  { id: 'c2', type: 'circle', cx: 520, cy: 200, r: 18, color: '#f4a261' },
  {
    id: 'l1',
    type: 'line',
    x1: 100,
    y1: 100,
    x2: 220,
    y2: 170,
    color: 'rgba(255,255,255,0.5)',
    lineWidth: 1.5,
  },
  {
    id: 'l2',
    type: 'line',
    x1: 270,
    y1: 170,
    x2: 420,
    y2: 100,
    color: 'rgba(255,255,255,0.5)',
    lineWidth: 1.5,
  },
  {
    id: 'star',
    type: 'custom',
    bounds: { x: 320, y: 220, width: 60, height: 60 },
    draw: (ctx, info) => {
      const center = info.worldToMinimap({ x: 350, y: 250 });
      ctx.fillStyle = 'gold';
      drawStar(ctx, center.x, center.y, 5, 10, 4);
    },
  },
];

export default function MinimapItemsDemo(): React.ReactElement {
  const fake = useFakeViewport({ width: 280, height: 160 });
  const worldBounds = useMemo(() => computeBoundsFromItems(ITEMS, 30), []);
  return (
    <Minimap
      items={ITEMS}
      worldBounds={worldBounds}
      transform={fake.transform}
      viewportSize={fake.viewportSize}
      onNavigate={fake.onNavigate}
      width={300}
    />
  );
}
