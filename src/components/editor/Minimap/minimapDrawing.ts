import type {
  ViewportTransform,
  ViewportSize,
  WorldRect,
} from '@/components/primitives/viewport';
import type { MinimapItem } from './Minimap.types';
import {
  computeMinimapScale,
  getViewportRectOnMinimap,
  worldToMinimap,
  type MinimapScreenRect,
} from './minimapCoords';

export interface MinimapDrawColors {
  background: string;
  defaultItem: string;
  viewportRectStroke: string;
  outsideOverlay: string;
}

export interface MinimapDrawInput {
  ctx: CanvasRenderingContext2D;
  size: ViewportSize;
  worldBounds: WorldRect;
  transform: ViewportTransform;
  viewportSize: ViewportSize;
  items: ReadonlyArray<MinimapItem>;
  colors: MinimapDrawColors;
}

/**
 * Render a full minimap frame: background → items → dimmed shroud around
 * the viewport rect → viewport rect outline. The caller is responsible for
 * DPR scaling on `ctx` before invoking.
 */
export function drawMinimap(input: MinimapDrawInput): void {
  const { ctx, size, worldBounds, transform, viewportSize, items, colors } =
    input;

  ctx.clearRect(0, 0, size.width, size.height);
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, size.width, size.height);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, size.width, size.height);
  ctx.clip();

  const scale = computeMinimapScale(worldBounds, size);

  for (const item of items) {
    const color = item.color ?? colors.defaultItem;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    switch (item.type) {
      case 'rect': {
        const topLeft = worldToMinimap(
          { x: item.x, y: item.y },
          worldBounds,
          size
        );
        ctx.fillRect(
          topLeft.x,
          topLeft.y,
          Math.max(1, item.width * scale),
          Math.max(1, item.height * scale)
        );
        break;
      }
      case 'circle': {
        const center = worldToMinimap(
          { x: item.cx, y: item.cy },
          worldBounds,
          size
        );
        const r = Math.max(0.5, item.r * scale);
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'line': {
        const a = worldToMinimap({ x: item.x1, y: item.y1 }, worldBounds, size);
        const b = worldToMinimap({ x: item.x2, y: item.y2 }, worldBounds, size);
        ctx.lineWidth = item.lineWidth ?? 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        break;
      }
    }
  }

  ctx.restore();

  const vr = getViewportRectOnMinimap(
    transform,
    viewportSize,
    worldBounds,
    size
  );
  drawOutsideOverlay(ctx, size, vr, colors.outsideOverlay);

  ctx.strokeStyle = colors.viewportRectStroke;
  ctx.lineWidth = 1;
  const strokeW = Math.max(0, vr.width - 1);
  const strokeH = Math.max(0, vr.height - 1);
  ctx.strokeRect(vr.x + 0.5, vr.y + 0.5, strokeW, strokeH);
}

function drawOutsideOverlay(
  ctx: CanvasRenderingContext2D,
  size: ViewportSize,
  rect: MinimapScreenRect,
  color: string
): void {
  // Clamp the viewport rect to minimap bounds so we shroud everything else
  const rl = Math.max(0, Math.min(size.width, rect.x));
  const rt = Math.max(0, Math.min(size.height, rect.y));
  const rr = Math.max(0, Math.min(size.width, rect.x + rect.width));
  const rb = Math.max(0, Math.min(size.height, rect.y + rect.height));

  ctx.fillStyle = color;
  if (rt > 0) ctx.fillRect(0, 0, size.width, rt);
  if (rb < size.height) ctx.fillRect(0, rb, size.width, size.height - rb);
  if (rl > 0 && rt < rb) ctx.fillRect(0, rt, rl, rb - rt);
  if (rr < size.width && rt < rb)
    ctx.fillRect(rr, rt, size.width - rr, rb - rt);
}
