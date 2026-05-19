import { useRef, useState } from 'react';
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

const NODES = [
  { id: 'a', x: 80, y: 60, label: 'Source' },
  { id: 'b', x: 260, y: 140, label: 'Transform' },
  { id: 'c', x: 440, y: 80, label: 'Filter' },
  { id: 'd', x: 380, y: 240, label: 'Output' },
];

const NODE_W = 110;
const NODE_H = 44;

function drawGrid(
  ctx: CanvasRenderingContext2D,
  info: ViewportLayerDrawInfo
): void {
  const { size, transform, theme } = info;
  const step = 40 * transform.zoom;
  if (step < 4) return;
  const offsetX = transform.x % step;
  const offsetY = transform.y % step;

  ctx.strokeStyle = theme.borderDefault;
  ctx.globalAlpha = 0.25;
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

export default function ViewportDemo(): React.ReactElement {
  const viewportRef = useRef<ViewportHandle>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleFit = (): void => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    NODES.forEach(n => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + NODE_W);
      maxY = Math.max(maxY, n.y + NODE_H);
    });
    viewportRef.current?.fitToContent(
      { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
      32
    );
  };

  const handleReset = (): void => {
    viewportRef.current?.centerOn({ x: 260, y: 140 }, 1);
  };

  return (
    <DemoWrapper height="420px" padding="0">
      <Viewport
        ref={viewportRef}
        responsive
        selectionRect={{ enabled: true, button: 'left' }}
        onSelectionChange={info => {
          if (!info.inProgress) {
            const next = new Set(info.additive ? selectedIds : []);
            NODES.forEach(n => {
              const overlaps =
                n.x + NODE_W >= info.rect.x &&
                n.x <= info.rect.x + info.rect.width &&
                n.y + NODE_H >= info.rect.y &&
                n.y <= info.rect.y + info.rect.height;
              if (overlaps) next.add(n.id);
            });
            setSelectedIds(next);
          }
        }}
      >
        <ViewportLayer name="grid" draw={drawGrid} />
        <ViewportWorld>
          {NODES.map(n => {
            const selected = selectedIds.has(n.id);
            return (
              <div
                key={n.id}
                style={{
                  position: 'absolute',
                  left: n.x,
                  top: n.y,
                  width: NODE_W,
                  height: NODE_H,
                  pointerEvents: 'auto',
                  background: selected
                    ? 'var(--etui-color-accent-primary)'
                    : 'var(--etui-color-background-secondary)',
                  color: selected
                    ? 'var(--etui-color-background-primary)'
                    : 'var(--etui-color-text-primary)',
                  border: '1px solid var(--etui-color-border-default)',
                  borderRadius: 'var(--etui-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--etui-font-size-sm)',
                  userSelect: 'none',
                  cursor: 'default',
                }}
              >
                {n.label}
              </div>
            );
          })}
        </ViewportWorld>
        <ViewportOverlay>
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              gap: 8,
              pointerEvents: 'auto',
            }}
          >
            <Button size="sm" onClick={handleFit}>
              Fit content
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              Reset
            </Button>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              fontSize: 'var(--etui-font-size-xs)',
              color: 'var(--etui-color-text-muted)',
              pointerEvents: 'none',
            }}
          >
            Drag with middle mouse / hold Space + drag to pan · Wheel to zoom ·
            Drag from background to marquee-select
          </div>
        </ViewportOverlay>
      </Viewport>
    </DemoWrapper>
  );
}
