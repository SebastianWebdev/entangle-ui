'use client';

import type React from 'react';
import { useEffect, useRef, useCallback } from 'react';
import type {
  CurveData,
  CurveViewport,
  CurveHitTest,
  CurveBackgroundInfo,
} from './CurveEditor.types';
import type { CanvasThemeColors } from '@/components/primitives/canvas/canvas.types';
import {
  drawGrid as sharedDrawGrid,
  drawDomainBounds as sharedDrawDomainBounds,
  drawAxisLabels as sharedDrawAxisLabels,
} from '@/components/primitives/canvas/canvasDrawing';
import {
  resolveCanvasTheme,
  resolveVarValue,
} from '@/components/primitives/canvas/canvasTheme';
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
  resizeToken?: number;
}

// CanvasThemeColors and resolveCanvasTheme are now imported from shared canvas primitives

export function useCurveRenderer(options: UseCurveRendererOptions): void {
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = options.canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = resolveCanvasTheme(canvas);

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
      curveColor: rawCurveColor,
      curveWidth,
      renderBackground,
      selectedIds,
      hoveredElement,
      selectionBox,
      disabled,
    } = options;

    // Resolve curveColor if it's a CSS variable reference
    const curveColor = rawCurveColor.startsWith('var(')
      ? resolveVarValue(canvas, rawCurveColor)
      : rawCurveColor;

    const opacity = disabled ? 0.4 : 1;

    // 1. Clear background
    ctx.globalAlpha = 1;
    ctx.fillStyle = theme.backgroundSecondary;
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

    // 2. Grid lines -- based on domain values, not viewport
    if (showGrid) {
      sharedDrawGrid(ctx, w, h, theme, {
        subdivisions: gridSubdivisions,
        domain: { domainX: curve.domainX, domainY: curve.domainY },
        viewport,
        opacity,
      });
    }

    // 3. Domain boundary axes (stronger lines at domain min/max)
    sharedDrawDomainBounds(
      ctx,
      w,
      h,
      theme,
      { domainX: curve.domainX, domainY: curve.domainY },
      viewport,
      opacity
    );

    // 4. Axis labels -- based on domain values
    if (showAxisLabels) {
      sharedDrawAxisLabels(ctx, w, h, theme, {
        subdivisions: gridSubdivisions,
        domain: { domainX: curve.domainX, domainY: curve.domainY },
        viewport,
        opacity,
        labelX,
        labelY,
      });
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
  }, [options]);

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

// drawGrid, drawDomainBounds, drawAxisLabels, and formatLabel are now
// provided by shared canvas primitives and called in the draw() function above.

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
  theme: CanvasThemeColors,
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
    ctx.strokeStyle = theme.textMuted;
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
    ctx.fillStyle = isHInHovered ? theme.textPrimary : theme.textSecondary;
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
    ctx.strokeStyle = theme.textMuted;
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
    ctx.fillStyle = isHOutHovered ? theme.textPrimary : theme.textSecondary;
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
  theme: CanvasThemeColors,
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
      ctx.strokeStyle = theme.textPrimary;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = theme.textPrimary;
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
