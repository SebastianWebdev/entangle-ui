import type React from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@emotion/react';
import type { Theme } from '@/theme';
import type {
  CurveData,
  CurveViewport,
  CurveHitTest,
  CurveBackgroundInfo,
} from './CurveEditor.types';
import { clamp } from '@/utils/mathUtils';
import { domainToCanvas, sampleCurve } from './curveUtils';

interface UseCurveRendererOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  curve: CurveData;
  viewport: CurveViewport;
  showGrid: boolean;
  gridSubdivisions: number;
  showAxisLabels: boolean;
  labelX?: string;
  labelY?: string;
  curveColor: string;
  curveWidth: number;
  renderBackground?: (
    ctx: CanvasRenderingContext2D,
    info: CurveBackgroundInfo
  ) => void;
  selectedIds: Set<string>;
  hoveredElement: CurveHitTest | null;
  selectionBox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null;
  disabled: boolean;
  isDragging: boolean;
  lockTangents: boolean;
}

export function useCurveRenderer(options: UseCurveRendererOptions): void {
  const theme = useTheme() as Theme;
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = options.canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Set canvas resolution for retina
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    } else {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const {
      curve,
      viewport,
      showGrid,
      gridSubdivisions,
      showAxisLabels,
      labelX,
      labelY,
      curveColor,
      curveWidth,
      renderBackground,
      selectedIds,
      hoveredElement,
      selectionBox,
      disabled,
    } = options;

    const opacity = disabled ? 0.4 : 1;

    // 1. Clear background
    ctx.globalAlpha = 1;
    ctx.fillStyle = theme.colors.background.secondary;
    ctx.fillRect(0, 0, w, h);

    // 1b. Custom background (histograms, gradients, etc.)
    if (renderBackground) {
      ctx.save();
      renderBackground(ctx, {
        width: w,
        height: h,
        viewport,
        domainX: curve.domainX,
        domainY: curve.domainY,
      });
      ctx.restore();
    }

    // 2. Grid lines — based on domain values, not viewport
    if (showGrid) {
      drawGrid(ctx, curve, viewport, w, h, gridSubdivisions, theme, opacity);
    }

    // 3. Domain boundary axes (stronger lines at domain min/max)
    drawDomainBounds(ctx, curve, viewport, w, h, theme, opacity);

    // 4. Axis labels — based on domain values
    if (showAxisLabels) {
      drawAxisLabels(
        ctx,
        curve,
        viewport,
        w,
        h,
        gridSubdivisions,
        theme,
        opacity,
        labelX,
        labelY
      );
    }

    // 5. Curve line
    ctx.globalAlpha = opacity;
    drawCurveLine(ctx, curve, viewport, w, h, curveColor, curveWidth);

    // 6. Tangent handles (for selected keyframes)
    if (!options.lockTangents) {
      drawTangentHandles(
        ctx,
        curve,
        viewport,
        w,
        h,
        selectedIds,
        hoveredElement,
        theme,
        opacity
      );
    }

    // 7. Keyframe points
    drawKeyframes(
      ctx,
      curve,
      viewport,
      w,
      h,
      curveColor,
      selectedIds,
      hoveredElement,
      theme,
      opacity
    );

    // 8. Selection box
    if (selectionBox) {
      drawSelectionBox(ctx, selectionBox, curveColor);
    }

    ctx.globalAlpha = 1;
  }, [options, theme]);

  // Redraw on state changes
  useEffect(() => {
    if (options.isDragging) {
      // Use rAF for smooth updates during drag
      const render = () => {
        draw();
        rafRef.current = requestAnimationFrame(render);
      };
      rafRef.current = requestAnimationFrame(render);
      return () => cancelAnimationFrame(rafRef.current);
    }

    draw();
    return undefined;
  }, [draw, options.isDragging]);
}

/**
 * Format a number for axis labels.
 * Integers show as "0", "1". Clean fractions show as "0.25", "0.5".
 * Others show with minimal decimals needed.
 */
function formatLabel(value: number, domainRange: number): string {
  // Round to avoid floating-point artifacts
  const rounded = Math.round(value * 1e10) / 1e10;
  if (Number.isInteger(rounded)) return rounded.toFixed(0);

  // For small ranges, show more precision
  if (domainRange <= 1) {
    // Check if it's a clean fraction (0.25, 0.5, 0.75, etc.)
    const str = rounded.toFixed(2);
    if (str.endsWith('0')) return rounded.toFixed(1);
    return str;
  }

  // For larger ranges
  if (domainRange <= 10) return rounded.toFixed(1);
  return rounded.toFixed(0);
}

/**
 * Draw grid lines at clean domain values (not viewport values).
 * Grid lines subdivide the domain range into equal parts.
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  curve: CurveData,
  viewport: CurveViewport,
  w: number,
  h: number,
  subdivisions: number,
  theme: Theme,
  opacity: number
): void {
  const [dxMin, dxMax] = curve.domainX;
  const [dyMin, dyMax] = curve.domainY;
  const dxRange = dxMax - dxMin || 1;
  const dyRange = dyMax - dyMin || 1;

  ctx.lineWidth = 1;

  // Vertical grid lines (subdivide domain X)
  const xStep = dxRange / subdivisions;
  for (let i = 0; i <= subdivisions; i++) {
    const domX = dxMin + i * xStep;
    const { px } = domainToCanvas(domX, 0, viewport, w, h);

    // Domain bounds drawn stronger
    const isBound = i === 0 || i === subdivisions;
    ctx.globalAlpha = opacity * (isBound ? 0.25 : 0.12);
    ctx.strokeStyle = theme.colors.border.default;
    ctx.beginPath();
    ctx.moveTo(Math.round(px) + 0.5, 0);
    ctx.lineTo(Math.round(px) + 0.5, h);
    ctx.stroke();
  }

  // Horizontal grid lines (subdivide domain Y)
  const yStep = dyRange / subdivisions;
  for (let i = 0; i <= subdivisions; i++) {
    const domY = dyMin + i * yStep;
    const { py } = domainToCanvas(0, domY, viewport, w, h);

    const isBound = i === 0 || i === subdivisions;
    ctx.globalAlpha = opacity * (isBound ? 0.25 : 0.12);
    ctx.strokeStyle = theme.colors.border.default;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(py) + 0.5);
    ctx.lineTo(w, Math.round(py) + 0.5);
    ctx.stroke();
  }
}

/**
 * Draw stronger lines at the domain boundaries (min/max on both axes).
 */
function drawDomainBounds(
  ctx: CanvasRenderingContext2D,
  curve: CurveData,
  viewport: CurveViewport,
  w: number,
  h: number,
  theme: Theme,
  opacity: number
): void {
  const [dxMin, dxMax] = curve.domainX;
  const [dyMin, dyMax] = curve.domainY;

  ctx.globalAlpha = opacity * 0.35;
  ctx.strokeStyle = theme.colors.border.default;
  ctx.lineWidth = 1.5;

  // Left bound (X min)
  const { px: pxMin } = domainToCanvas(dxMin, 0, viewport, w, h);
  ctx.beginPath();
  ctx.moveTo(Math.round(pxMin) + 0.5, 0);
  ctx.lineTo(Math.round(pxMin) + 0.5, h);
  ctx.stroke();

  // Right bound (X max)
  const { px: pxMax } = domainToCanvas(dxMax, 0, viewport, w, h);
  ctx.beginPath();
  ctx.moveTo(Math.round(pxMax) + 0.5, 0);
  ctx.lineTo(Math.round(pxMax) + 0.5, h);
  ctx.stroke();

  // Bottom bound (Y min)
  const { py: pyMin } = domainToCanvas(0, dyMin, viewport, w, h);
  ctx.beginPath();
  ctx.moveTo(0, Math.round(pyMin) + 0.5);
  ctx.lineTo(w, Math.round(pyMin) + 0.5);
  ctx.stroke();

  // Top bound (Y max)
  const { py: pyMax } = domainToCanvas(0, dyMax, viewport, w, h);
  ctx.beginPath();
  ctx.moveTo(0, Math.round(pyMax) + 0.5);
  ctx.lineTo(w, Math.round(pyMax) + 0.5);
  ctx.stroke();
}

/**
 * Draw axis labels at clean domain values.
 * Y labels on the left side, X labels at the bottom.
 * Labels correspond to domain subdivisions (e.g. 0, 0.25, 0.5, 0.75, 1).
 */
function drawAxisLabels(
  ctx: CanvasRenderingContext2D,
  curve: CurveData,
  viewport: CurveViewport,
  w: number,
  h: number,
  subdivisions: number,
  theme: Theme,
  opacity: number,
  labelX?: string,
  labelY?: string
): void {
  const [dxMin, dxMax] = curve.domainX;
  const [dyMin, dyMax] = curve.domainY;
  const dxRange = dxMax - dxMin || 1;
  const dyRange = dyMax - dyMin || 1;

  const fontSize = theme.typography.fontSize.xs;
  ctx.globalAlpha = opacity * 0.7;
  ctx.fillStyle = theme.colors.text.muted;
  ctx.font = `${fontSize}px sans-serif`;

  const padX = 4;
  const bottomMargin = fontSize + 6;

  // ─── X axis labels (bottom, aligned to domain subdivisions) ───
  ctx.textBaseline = 'top';
  const xStep = dxRange / subdivisions;
  for (let i = 0; i <= subdivisions; i++) {
    const domX = dxMin + i * xStep;
    const { px } = domainToCanvas(domX, 0, viewport, w, h);
    const label = formatLabel(domX, dxRange);
    const textWidth = ctx.measureText(label).width;

    // Position: first label left-aligned, last right-aligned, rest centered
    // Also offset first label right to avoid overlapping with Y-axis labels
    if (i === 0) {
      ctx.textAlign = 'left';
      // Offset right so it doesn't overlap with Y axis labels
      const yLabelWidth = ctx.measureText(formatLabel(dyMax, dyRange)).width;
      const minX = yLabelWidth + padX + 4;
      ctx.fillText(label, Math.max(minX, px - textWidth / 2), h - bottomMargin);
    } else if (i === subdivisions) {
      ctx.textAlign = 'right';
      ctx.fillText(
        label,
        Math.min(w - padX, px + textWidth / 2),
        h - bottomMargin
      );
    } else {
      ctx.textAlign = 'center';
      ctx.fillText(label, px, h - bottomMargin);
    }
  }

  // ─── Y axis labels (left side, aligned to domain subdivisions) ───
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const yStep = dyRange / subdivisions;
  for (let i = 0; i <= subdivisions; i++) {
    const domY = dyMin + i * yStep;
    const { py } = domainToCanvas(0, domY, viewport, w, h);
    const label = formatLabel(domY, dyRange);

    // Clamp vertically to keep within canvas
    const clampedPy = clamp(py, fontSize / 2 + 2, h - bottomMargin - 2);
    ctx.fillText(label, padX, clampedPy);
  }

  // ─── Axis name labels ───
  if (labelX) {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(labelX, w - padX, h - 2);
  }
  if (labelY) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(labelY, padX, 4);
  }
}

function drawCurveLine(
  ctx: CanvasRenderingContext2D,
  curve: CurveData,
  viewport: CurveViewport,
  w: number,
  h: number,
  curveColor: string,
  lineWidth: number
): void {
  if (curve.keyframes.length < 2) return;

  const samples = sampleCurve(curve, Math.max(200, w));
  if (samples.length === 0) return;

  ctx.strokeStyle = curveColor;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();

  const first = samples[0];
  if (!first) return;
  const firstCanvas = domainToCanvas(first.x, first.y, viewport, w, h);
  ctx.moveTo(firstCanvas.px, firstCanvas.py);

  for (let i = 1; i < samples.length; i++) {
    const s = samples[i];
    if (!s) continue;
    const sCanvas = domainToCanvas(s.x, s.y, viewport, w, h);
    ctx.lineTo(sCanvas.px, sCanvas.py);
  }

  ctx.stroke();
}

function drawTangentHandles(
  ctx: CanvasRenderingContext2D,
  curve: CurveData,
  viewport: CurveViewport,
  w: number,
  h: number,
  selectedIds: Set<string>,
  hoveredElement: CurveHitTest | null,
  theme: Theme,
  opacity: number
): void {
  const { keyframes } = curve;

  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    if (!kf) continue;
    if (!kf.id || !selectedIds.has(kf.id)) continue;
    if (kf.tangentMode === 'linear' || kf.tangentMode === 'step') continue;

    const isAutoMode = kf.tangentMode === 'auto';
    const kfCanvas = domainToCanvas(kf.x, kf.y, viewport, w, h);

    // Handle In
    const hIn = domainToCanvas(
      kf.x + kf.handleIn.x,
      kf.y + kf.handleIn.y,
      viewport,
      w,
      h
    );

    ctx.globalAlpha = opacity * (isAutoMode ? 0.4 : 0.7);
    ctx.strokeStyle = theme.colors.text.muted;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(kfCanvas.px, kfCanvas.py);
    ctx.lineTo(hIn.px, hIn.py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Handle In point
    const hInRadius = isAutoMode ? 3 : 4;
    const isHInHovered =
      hoveredElement?.type === 'handleIn' && hoveredElement.keyframeIndex === i;
    ctx.globalAlpha = opacity;
    ctx.fillStyle = isHInHovered
      ? theme.colors.text.primary
      : theme.colors.text.secondary;
    ctx.beginPath();
    ctx.arc(
      hIn.px,
      hIn.py,
      isHInHovered ? hInRadius + 1 : hInRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Handle Out
    const hOut = domainToCanvas(
      kf.x + kf.handleOut.x,
      kf.y + kf.handleOut.y,
      viewport,
      w,
      h
    );

    ctx.globalAlpha = opacity * (isAutoMode ? 0.4 : 0.7);
    ctx.strokeStyle = theme.colors.text.muted;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(kfCanvas.px, kfCanvas.py);
    ctx.lineTo(hOut.px, hOut.py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Handle Out point
    const hOutRadius = isAutoMode ? 3 : 4;
    const isHOutHovered =
      hoveredElement?.type === 'handleOut' &&
      hoveredElement.keyframeIndex === i;
    ctx.globalAlpha = opacity;
    ctx.fillStyle = isHOutHovered
      ? theme.colors.text.primary
      : theme.colors.text.secondary;
    ctx.beginPath();
    ctx.arc(
      hOut.px,
      hOut.py,
      isHOutHovered ? hOutRadius + 1 : hOutRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function drawKeyframes(
  ctx: CanvasRenderingContext2D,
  curve: CurveData,
  viewport: CurveViewport,
  w: number,
  h: number,
  curveColor: string,
  selectedIds: Set<string>,
  hoveredElement: CurveHitTest | null,
  theme: Theme,
  opacity: number
): void {
  const { keyframes } = curve;

  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    if (!kf) continue;
    const isSelected = kf.id ? selectedIds.has(kf.id) : false;
    const isHovered =
      hoveredElement?.type === 'keyframe' && hoveredElement.keyframeIndex === i;
    const isEndpoint = i === 0 || i === keyframes.length - 1;

    const { px, py } = domainToCanvas(kf.x, kf.y, viewport, w, h);

    ctx.globalAlpha = opacity;

    if (isEndpoint) {
      // Diamond shape for endpoints
      const size = isHovered ? 8 : isSelected ? 7 : 6;
      ctx.beginPath();
      ctx.moveTo(px, py - size);
      ctx.lineTo(px + size, py);
      ctx.lineTo(px, py + size);
      ctx.lineTo(px - size, py);
      ctx.closePath();
    } else {
      // Circle for middle keyframes
      const radius = isHovered ? 8 : isSelected ? 7 : 6;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
    }

    if (isSelected) {
      ctx.fillStyle = curveColor;
      ctx.fill();
      ctx.strokeStyle = theme.colors.text.primary;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = theme.colors.text.primary;
      ctx.fill();
      ctx.strokeStyle = curveColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}

function drawSelectionBox(
  ctx: CanvasRenderingContext2D,
  box: { x1: number; y1: number; x2: number; y2: number },
  curveColor: string
): void {
  const x = Math.min(box.x1, box.x2);
  const y = Math.min(box.y1, box.y2);
  const bw = Math.abs(box.x2 - box.x1);
  const bh = Math.abs(box.y2 - box.y1);

  ctx.globalAlpha = 0.1;
  ctx.fillStyle = curveColor;
  ctx.fillRect(x, y, bw, bh);

  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = curveColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x, y, bw, bh);
  ctx.setLineDash([]);
}
