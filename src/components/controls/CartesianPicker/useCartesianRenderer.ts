import type React from 'react';
import { useCallback } from 'react';
import type {
  Point2D,
  CanvasViewport,
  CanvasBackgroundInfo,
  CanvasThemeColors,
} from '@/components/primitives/canvas';
import {
  drawGrid,
  drawDomainBounds,
  drawOriginAxes,
  drawAxisLabels,
  drawCrosshair,
  drawPointMarker,
  resolveCanvasTheme,
  useCanvasRenderer,
} from '@/components/primitives/canvas';

interface UseCartesianRendererOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  point: Point2D;
  viewport: CanvasViewport;
  domainX: [number, number];
  domainY: [number, number];
  showGrid: boolean;
  gridSubdivisions: number;
  showAxisLabels: boolean;
  showOriginAxes: boolean;
  showCrosshair: boolean;
  crosshairStyle: 'solid' | 'dashed';
  labelX?: string;
  labelY?: string;
  markerRadius: number;
  disabled: boolean;
  isHovered: boolean;
  isDragging: boolean;
  renderBackground?: (
    ctx: CanvasRenderingContext2D,
    info: CanvasBackgroundInfo
  ) => void;
}

export function useCartesianRenderer(options: UseCartesianRendererOptions): void {
  const {
    canvasRef,
    point,
    viewport,
    domainX,
    domainY,
    showGrid,
    gridSubdivisions,
    showAxisLabels,
    showOriginAxes: showOrigin,
    showCrosshair,
    crosshairStyle,
    labelX,
    labelY,
    markerRadius,
    disabled,
    isHovered,
    isDragging,
    renderBackground,
  } = options;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
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

    const theme: CanvasThemeColors = resolveCanvasTheme(canvas);
    const opacity = disabled ? 0.4 : 1;
    const domain = { domainX, domainY };

    // 1. Clear background
    ctx.globalAlpha = 1;
    ctx.fillStyle = theme.backgroundSecondary;
    ctx.fillRect(0, 0, w, h);

    // 2. Custom background
    if (renderBackground) {
      ctx.save();
      renderBackground(ctx, {
        width: w,
        height: h,
        viewport,
        domainX,
        domainY,
      });
      ctx.restore();
    }

    // 3. Grid lines
    if (showGrid) {
      drawGrid(ctx, w, h, theme, {
        subdivisions: gridSubdivisions,
        domain,
        viewport,
        opacity,
      });
    }

    // 4. Domain bounds
    drawDomainBounds(ctx, w, h, theme, domain, viewport, opacity);

    // 5. Origin axes
    if (showOrigin) {
      drawOriginAxes(ctx, w, h, theme, viewport, opacity);
    }

    // 6. Axis labels
    if (showAxisLabels) {
      drawAxisLabels(ctx, w, h, theme, {
        subdivisions: gridSubdivisions,
        domain,
        viewport,
        opacity,
        labelX,
        labelY,
      });
    }

    // 7. Crosshair
    if (showCrosshair) {
      drawCrosshair(ctx, w, h, theme, {
        point,
        viewport,
        lineStyle: crosshairStyle,
        opacity,
      });
    }

    // 8. Point marker
    drawPointMarker(ctx, w, h, theme, {
      point,
      viewport,
      radius: markerRadius,
      hovered: isHovered,
      dragging: isDragging,
      opacity,
    });

    ctx.globalAlpha = 1;
  }, [
    canvasRef,
    point,
    viewport,
    domainX,
    domainY,
    showGrid,
    gridSubdivisions,
    showAxisLabels,
    showOrigin,
    showCrosshair,
    crosshairStyle,
    labelX,
    labelY,
    markerRadius,
    disabled,
    isHovered,
    isDragging,
    renderBackground,
  ]);

  useCanvasRenderer({
    draw,
    deps: [draw],
    paused: false,
  });
}
