import type { MinimapDrawInfo, MinimapItem } from '@/components/editor/Minimap';

// ─────────────────────────────────────────────────────────────────────────────
// Shared canvas helpers
// ─────────────────────────────────────────────────────────────────────────────

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

// ─────────────────────────────────────────────────────────────────────────────
// Pretty node — rounded body, gradient fill, accent stripe, optional ports
// ─────────────────────────────────────────────────────────────────────────────

export interface PrettyNodeOpts {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Hue 0–360 — drives the gradient + accent color. */
  hue: number;
  /** Highlight (e.g. selected/hovered) — adds a glow ring. */
  highlighted?: boolean;
  /** Render small input/output port dots. @default true */
  ports?: boolean;
}

export function prettyNode(opts: PrettyNodeOpts): MinimapItem {
  const {
    id,
    x,
    y,
    width,
    height,
    hue,
    highlighted = false,
    ports = true,
  } = opts;
  return {
    id,
    type: 'custom',
    bounds: { x, y, width, height },
    draw: (ctx, info) => {
      const tl = info.worldToMinimap({ x, y });
      const br = info.worldToMinimap({ x: x + width, y: y + height });
      const w = br.x - tl.x;
      const h = br.y - tl.y;
      const r = Math.max(1.5, Math.min(4, h * 0.18));

      // Glow ring (drawn before body so it sits behind).
      if (highlighted) {
        ctx.save();
        ctx.shadowColor = `hsl(${hue} 90% 60%)`;
        ctx.shadowBlur = 8;
        ctx.fillStyle = `hsl(${hue} 90% 60%)`;
        roundedRectPath(ctx, tl.x, tl.y, w, h, r);
        ctx.fill();
        ctx.restore();
      }

      // Body — vertical gradient gives a subtle "lit from above" depth.
      const grad = ctx.createLinearGradient(tl.x, tl.y, tl.x, br.y);
      grad.addColorStop(0, `hsl(${hue} 25% 32%)`);
      grad.addColorStop(1, `hsl(${hue} 30% 22%)`);
      ctx.fillStyle = grad;
      roundedRectPath(ctx, tl.x, tl.y, w, h, r);
      ctx.fill();

      // Top highlight (1px lighter line just under the top border).
      ctx.strokeStyle = `hsla(${hue}, 60%, 60%, 0.35)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tl.x + r, tl.y + 0.5);
      ctx.lineTo(br.x - r, tl.y + 0.5);
      ctx.stroke();

      // Accent stripe on the left edge.
      const stripeW = Math.max(2, w * 0.14);
      ctx.fillStyle = `hsl(${hue} 75% 58%)`;
      roundedRectPath(ctx, tl.x, tl.y, stripeW, h, r);
      ctx.fill();
      // Square off the stripe on its right side so the rounded corner
      // doesn't show through the node body.
      ctx.fillRect(tl.x + stripeW - r, tl.y, r, h);

      // Subtle outline.
      ctx.strokeStyle = `hsla(${hue}, 30%, 12%, 0.9)`;
      ctx.lineWidth = 1;
      roundedRectPath(ctx, tl.x + 0.5, tl.y + 0.5, w - 1, h - 1, r);
      ctx.stroke();

      // Port dots (left = input, right = output).
      if (ports && w >= 12) {
        const portR = Math.max(1.2, Math.min(2, h * 0.12));
        ctx.fillStyle = `hsl(${hue} 80% 70%)`;
        const cy = tl.y + h / 2;
        ctx.beginPath();
        ctx.arc(tl.x, cy, portR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(br.x, cy, portR, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pretty edge — cubic bezier between two node ports
// ─────────────────────────────────────────────────────────────────────────────

export interface PrettyEdgeOpts {
  id: string;
  /** World-space start point (typically a node's right edge port). */
  from: { x: number; y: number };
  /** World-space end point (typically a node's left edge port). */
  to: { x: number; y: number };
  /** Stroke color. Defaults to a soft white. */
  color?: string;
  /** Stroke width in minimap CSS pixels. @default 1.25 */
  lineWidth?: number;
  /** Pixel bend (in minimap CSS px) for the horizontal handle. @default 18 */
  bendPx?: number;
}

export function prettyEdge(opts: PrettyEdgeOpts): MinimapItem {
  const {
    id,
    from,
    to,
    color = 'rgba(255, 255, 255, 0.55)',
    lineWidth = 1.25,
    bendPx = 18,
  } = opts;
  const minX = Math.min(from.x, to.x);
  const maxX = Math.max(from.x, to.x);
  const minY = Math.min(from.y, to.y);
  const maxY = Math.max(from.y, to.y);
  return {
    id,
    type: 'custom',
    bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
    draw: (ctx, info) => {
      const a = info.worldToMinimap(from);
      const b = info.worldToMinimap(to);
      const dx = Math.max(bendPx, Math.abs(b.x - a.x) * 0.35);
      const c1x = a.x + dx;
      const c2x = b.x - dx;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.bezierCurveTo(c1x, a.y, c2x, b.y, b.x, b.y);
      ctx.stroke();
      ctx.restore();
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pretty clip — gradient-filled rounded rect for timeline tracks
// ─────────────────────────────────────────────────────────────────────────────

export interface PrettyClipOpts {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hue: number;
  /** Show a thin tail-fade strip near the right edge (cross-fade hint). */
  fadeOut?: boolean;
}

export function prettyClip(opts: PrettyClipOpts): MinimapItem {
  const { id, x, y, width, height, hue, fadeOut = false } = opts;
  return {
    id,
    type: 'custom',
    bounds: { x, y, width, height },
    draw: (ctx, info) => {
      const tl = info.worldToMinimap({ x, y });
      const br = info.worldToMinimap({ x: x + width, y: y + height });
      const w = br.x - tl.x;
      const h = br.y - tl.y;
      const r = Math.max(1, Math.min(3, h * 0.3));

      const grad = ctx.createLinearGradient(tl.x, tl.y, tl.x, br.y);
      grad.addColorStop(0, `hsl(${hue} 70% 62%)`);
      grad.addColorStop(1, `hsl(${hue} 75% 42%)`);
      ctx.fillStyle = grad;
      roundedRectPath(ctx, tl.x, tl.y, w, h, r);
      ctx.fill();

      // Top inner highlight.
      ctx.strokeStyle = `hsla(${hue}, 85%, 78%, 0.85)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tl.x + r, tl.y + 0.5);
      ctx.lineTo(br.x - r, tl.y + 0.5);
      ctx.stroke();

      // Cross-fade hint — a thin diagonal sliver on the right.
      if (fadeOut && w >= 10) {
        const fadeW = Math.min(w * 0.2, 12);
        const fadeGrad = ctx.createLinearGradient(
          br.x - fadeW,
          tl.y,
          br.x,
          tl.y
        );
        fadeGrad.addColorStop(0, 'rgba(255,255,255,0)');
        fadeGrad.addColorStop(1, 'rgba(255,255,255,0.25)');
        ctx.fillStyle = fadeGrad;
        roundedRectPath(ctx, br.x - fadeW, tl.y, fadeW, h, r);
        ctx.fill();
      }

      // Subtle outline.
      ctx.strokeStyle = `hsla(${hue}, 40%, 18%, 0.9)`;
      ctx.lineWidth = 1;
      roundedRectPath(ctx, tl.x + 0.5, tl.y + 0.5, w - 1, h - 1, r);
      ctx.stroke();
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pretty keyframe — diamond marker on a timeline
// ─────────────────────────────────────────────────────────────────────────────

export interface PrettyKeyframeOpts {
  id: string;
  cx: number;
  cy: number;
  /** Half-diagonal size in world units. */
  size?: number;
  color?: string;
}

export function prettyKeyframe(opts: PrettyKeyframeOpts): MinimapItem {
  const { id, cx, cy, size = 6, color = '#f7c948' } = opts;
  return {
    id,
    type: 'custom',
    bounds: { x: cx - size, y: cy - size, width: size * 2, height: size * 2 },
    draw: (ctx, info) => {
      const p = info.worldToMinimap({ x: cx, y: cy });
      const r = Math.max(2, size * info.scale);
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - r);
      ctx.lineTo(p.x + r, p.y);
      ctx.lineTo(p.x, p.y + r);
      ctx.lineTo(p.x - r, p.y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // Centre dot for crispness at small sizes.
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.6, r * 0.25), 0, Math.PI * 2);
      ctx.fill();
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pretty playhead — for renderOverlay (NOT an item)
// ─────────────────────────────────────────────────────────────────────────────

export function prettyPlayhead(
  ctx: CanvasRenderingContext2D,
  info: MinimapDrawInfo,
  worldX: number,
  color: string = '#ff3860'
): void {
  const p = info.worldToMinimap({ x: worldX, y: 0 });
  const x = Math.round(p.x) + 0.5;

  // Main line — soft glow + crisp top.
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, info.minimapSize.height);
  ctx.stroke();
  ctx.restore();

  // Triangle head at the top.
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 4, 0);
  ctx.lineTo(x + 4, 0);
  ctx.lineTo(x, 5);
  ctx.closePath();
  ctx.fill();
}
