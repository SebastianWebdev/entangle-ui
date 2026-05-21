import { useMemo } from 'react';
import {
  Minimap,
  computeBoundsFromItems,
  type MinimapItem,
} from '@/components/editor/Minimap';
import { useFakeViewport } from './minimapDemoUtils';

// Spiked star with a soft glow + bright centre — shows off what
// `type: 'custom'` can do (the other items are baseline primitives).
function drawShinyStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  spikes: number,
  fill: string,
  glow: string
): void {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 10;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < spikes; i += 1) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Bright centre dot.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(0.8, inner * 0.35), 0, Math.PI * 2);
  ctx.fill();
}

const ITEMS: MinimapItem[] = [
  // ── Plain rects with a clean accent palette ──
  {
    id: 'r1',
    type: 'rect',
    x: 30,
    y: 30,
    width: 140,
    height: 70,
    color: '#4a86c8',
  },
  {
    id: 'r2',
    type: 'rect',
    x: 200,
    y: 150,
    width: 110,
    height: 60,
    color: '#6aa84f',
  },

  // ── Circles ──
  { id: 'c1', type: 'circle', cx: 420, cy: 80, r: 32, color: '#e63946' },
  { id: 'c2', type: 'circle', cx: 540, cy: 200, r: 20, color: '#f4a261' },

  // ── Lines linking shapes ──
  {
    id: 'l1',
    type: 'line',
    x1: 170,
    y1: 65,
    x2: 388,
    y2: 80,
    color: 'rgba(255,255,255,0.5)',
    lineWidth: 1.5,
  },
  {
    id: 'l2',
    type: 'line',
    x1: 310,
    y1: 180,
    x2: 540,
    y2: 200,
    color: 'rgba(255,255,255,0.5)',
    lineWidth: 1.5,
  },

  // ── Custom: showy spiked star, drawn entirely by the caller ──
  {
    id: 'star',
    type: 'custom',
    bounds: { x: 320, y: 220, width: 80, height: 80 },
    draw: (ctx, info) => {
      const center = info.worldToMinimap({ x: 360, y: 260 });
      // Scale star size with the minimap scale so it stays proportional.
      const outer = Math.max(6, 22 * info.scale);
      const inner = outer * 0.45;
      drawShinyStar(
        ctx,
        center.x,
        center.y,
        outer,
        inner,
        5,
        '#f7c948',
        '#f7c948'
      );
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
      width={320}
      minHeight={140}
    >
      <Minimap.Title>rect · circle · line · custom</Minimap.Title>
    </Minimap>
  );
}
