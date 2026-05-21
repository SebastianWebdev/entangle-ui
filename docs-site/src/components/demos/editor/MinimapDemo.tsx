import { useMemo, useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Viewport,
  ViewportLayer,
  ViewportWorld,
  ViewportOverlay,
  type ViewportHandle,
  type ViewportLayerDrawInfo,
} from '@/components/primitives';
import { Button } from '@/components/primitives/Button';
import {
  Minimap,
  ViewportMinimap,
  computeBoundsFromItems,
  useMinimapContext,
  type MinimapItem,
} from '@/components/editor/Minimap';

interface DemoNode {
  id: string;
  x: number;
  y: number;
  label: string;
  hue: number;
}

const NODES: DemoNode[] = [
  { id: 'a', x: 60, y: 40, label: 'Input', hue: 200 },
  { id: 'b', x: 280, y: 100, label: 'Filter', hue: 30 },
  { id: 'c', x: 520, y: 60, label: 'Transform', hue: 130 },
  { id: 'd', x: 760, y: 180, label: 'Combine', hue: 280 },
  { id: 'e', x: 460, y: 280, label: 'Mask', hue: 350 },
  { id: 'f', x: 200, y: 360, label: 'Sample', hue: 60 },
  { id: 'g', x: 880, y: 380, label: 'Output', hue: 180 },
];

const EDGES: Array<[string, string]> = [
  ['a', 'b'],
  ['b', 'c'],
  ['c', 'd'],
  ['b', 'e'],
  ['e', 'd'],
  ['f', 'e'],
  ['d', 'g'],
];

const NODE_W = 140;
const NODE_H = 52;

function drawGrid(
  ctx: CanvasRenderingContext2D,
  info: ViewportLayerDrawInfo
): void {
  const { size, transform, theme } = info;
  const step = 32 * transform.zoom;
  if (step < 4) return;
  const offsetX = transform.x % step;
  const offsetY = transform.y % step;

  ctx.strokeStyle = theme.borderDefault;
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = offsetX; x < size.width; x += step) {
    ctx.moveTo(Math.round(x) + 0.5, 0);
    ctx.lineTo(Math.round(x) + 0.5, size.height);
  }
  for (let y = offsetY; y < size.height; y += step) {
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(size.width, Math.round(y) + 0.5);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function CoordReadout(): React.ReactElement {
  const { hoverWorldPoint, hoveredItemId } = useMinimapContext();
  if (!hoverWorldPoint) {
    return <span style={{ opacity: 0.6 }}>—</span>;
  }
  const x = Math.round(hoverWorldPoint.x);
  const y = Math.round(hoverWorldPoint.y);
  return (
    <span>
      {x}, {y}
      {hoveredItemId ? ` · ${hoveredItemId}` : ''}
    </span>
  );
}

export default function MinimapDemo(): React.ReactElement {
  const viewportRef = useRef<ViewportHandle | null>(null);
  const [showEdges, setShowEdges] = useState(true);

  const items = useMemo<MinimapItem[]>(() => {
    const byId = new Map(NODES.map(n => [n.id, n] as const));
    const rects: MinimapItem[] = NODES.map(n => ({
      id: n.id,
      type: 'rect',
      x: n.x,
      y: n.y,
      width: NODE_W,
      height: NODE_H,
      color: `hsl(${n.hue} 70% 55%)`,
    }));
    if (!showEdges) return rects;
    const lines: MinimapItem[] = EDGES.map(([from, to], i) => {
      const a = byId.get(from);
      const b = byId.get(to);
      if (!a || !b) {
        return {
          id: `edge-${i}`,
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0,
        };
      }
      return {
        id: `edge-${i}`,
        type: 'line',
        x1: a.x + NODE_W,
        y1: a.y + NODE_H / 2,
        x2: b.x,
        y2: b.y + NODE_H / 2,
        color: 'rgba(255, 255, 255, 0.35)',
      };
    });
    return [...lines, ...rects];
  }, [showEdges]);

  const worldBounds = useMemo(() => computeBoundsFromItems(items, 60), [items]);

  const handleFit = (): void => {
    viewportRef.current?.fitToContent(worldBounds, 24);
  };

  return (
    <DemoWrapper height="460px" padding="0">
      <Viewport ref={viewportRef} responsive>
        <ViewportLayer name="grid" draw={drawGrid} />
        <ViewportWorld>
          {NODES.map(n => (
            <div
              key={n.id}
              style={{
                position: 'absolute',
                left: n.x,
                top: n.y,
                width: NODE_W,
                height: NODE_H,
                background: 'var(--etui-color-background-secondary)',
                color: 'var(--etui-color-text-primary)',
                border: '1px solid var(--etui-color-border-default)',
                borderLeft: `4px solid hsl(${n.hue} 70% 55%)`,
                borderRadius: 'var(--etui-radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--etui-font-size-sm)',
                userSelect: 'none',
                pointerEvents: 'auto',
              }}
            >
              {n.label}
            </div>
          ))}
        </ViewportWorld>

        <ViewportMinimap
          items={items}
          worldBounds={worldBounds}
          placement="bottom-right"
          width={240}
        >
          <Minimap.Title>Pipeline overview</Minimap.Title>
          <Minimap.Corner side="bottom-right">
            <CoordReadout />
          </Minimap.Corner>
          <Minimap.Footer>Drag · Arrows · Click to jump</Minimap.Footer>
        </ViewportMinimap>

        <ViewportOverlay>
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 8,
              pointerEvents: 'auto',
            }}
          >
            <Button size="sm" onClick={handleFit}>
              Fit content
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowEdges(prev => !prev)}
            >
              {showEdges ? 'Hide edges' : 'Show edges'}
            </Button>
          </div>
        </ViewportOverlay>
      </Viewport>
    </DemoWrapper>
  );
}
