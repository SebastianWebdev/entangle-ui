import { buildDrawInfo, getViewportRectOnMinimap } from './minimapCoords';

import type { MinimapDrawInfo, MinimapItem } from './Minimap.types';
import type { MinimapScreenRect } from './minimapCoords';
import type {
  ViewportTransform,
  ViewportSize,
  WorldRect,
} from '@/components/primitives/viewport';

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
  renderOverlay?: (
    ctx: CanvasRenderingContext2D,
    info: MinimapDrawInfo
  ) => void;
}

/**
 * Render a full minimap frame: background → items → caller `renderOverlay`
 * → dimmed shroud around the viewport rect → viewport rect outline. The
 * caller is responsible for DPR scaling on `ctx` before invoking.
 */
export function drawMinimap(input: MinimapDrawInput): void {
  const {
    ctx,
    size,
    worldBounds,
    transform,
    viewportSize,
    items,
    colors,
    renderOverlay,
  } = input;

  ctx.clearRect(0, 0, size.width, size.height);
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, size.width, size.height);

  const helpers = buildDrawInfo(worldBounds, size);
  const info: MinimapDrawInfo = {
    minimapSize: size,
    worldBounds,
    transform,
    viewportSize,
    ...helpers,
  };

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, size.width, size.height);
  ctx.clip();

  for (const item of items) {
    const color = item.color ?? colors.defaultItem;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    switch (item.type) {
      case 'rect': {
        const topLeft = info.worldToMinimap({ x: item.x, y: item.y });
        ctx.fillRect(
          topLeft.x,
          topLeft.y,
          Math.max(1, item.width * info.scale),
          Math.max(1, item.height * info.scale)
        );
        break;
      }
      case 'circle': {
        const center = info.worldToMinimap({ x: item.cx, y: item.cy });
        const r = Math.max(0.5, item.r * info.scale);
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'line': {
        const a = info.worldToMinimap({ x: item.x1, y: item.y1 });
        const b = info.worldToMinimap({ x: item.x2, y: item.y2 });
        ctx.lineWidth = item.lineWidth ?? 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        break;
      }
      case 'custom': {
        ctx.save();
        item.draw(ctx, info);
        ctx.restore();
        break;
      }
    }
  }

  if (renderOverlay) {
    ctx.save();
    renderOverlay(ctx, info);
    ctx.restore();
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
  const rl = Math.max(0, Math.min(size.width, rect.x));
  const rt = Math.max(0, Math.min(size.height, rect.y));
  const rr = Math.max(0, Math.min(size.width, rect.x + rect.width));
  const rb = Math.max(0, Math.min(size.height, rect.y + rect.height));

  ctx.fillStyle = color;
  if (rt > 0) ctx.fillRect(0, 0, size.width, rt);
  if (rb < size.height) ctx.fillRect(0, rb, size.width, size.height - rb);
  if (rl > 0 && rt < rb) ctx.fillRect(0, rt, rl, rb - rt);
  if (rr < size.width && rt < rb) {
    ctx.fillRect(rr, rt, size.width - rr, rb - rt);
  }
}
