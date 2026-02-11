import type {
  CanvasViewport,
  DomainBounds,
  CanvasThemeColors,
  GridOptions,
  AxisLabelOptions,
  CrosshairOptions,
  PointMarkerOptions,
} from './canvas.types';
import { domainToCanvas } from './canvasCoords';
import { clamp } from '@/utils/mathUtils';

/**
 * Format a number for axis labels.
 * Integers show as "0", "1". Clean fractions show as "0.25", "0.5".
 * Others show with minimal decimals needed.
 */
export function formatLabel(value: number, domainRange: number): string {
  const rounded = Math.round(value * 1e10) / 1e10;
  if (Number.isInteger(rounded)) return rounded.toFixed(0);

  if (domainRange <= 1) {
    const str = rounded.toFixed(2);
    if (str.endsWith('0')) return rounded.toFixed(1);
    return str;
  }

  if (domainRange <= 10) return rounded.toFixed(1);
  return rounded.toFixed(0);
}

/**
 * Draw grid lines at clean domain values.
 * Grid lines subdivide the domain range into equal parts.
 *
 * Extracted from CurveEditor's drawGrid — identical visual output.
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: CanvasThemeColors,
  options: GridOptions
): void {
  const { subdivisions, domain, viewport, opacity = 1 } = options;
  const { domainX, domainY } = domain;
  const dxRange = domainX[1] - domainX[0] || 1;
  const dyRange = domainY[1] - domainY[0] || 1;

  ctx.lineWidth = 1;

  // Vertical grid lines (subdivide domain X)
  const xStep = dxRange / subdivisions;
  for (let i = 0; i <= subdivisions; i++) {
    const domX = domainX[0] + i * xStep;
    const { px } = domainToCanvas(domX, 0, viewport, w, h);
    const isBound = i === 0 || i === subdivisions;
    ctx.globalAlpha = opacity * (isBound ? 0.25 : 0.12);
    ctx.strokeStyle = theme.borderDefault;
    ctx.beginPath();
    ctx.moveTo(Math.round(px) + 0.5, 0);
    ctx.lineTo(Math.round(px) + 0.5, h);
    ctx.stroke();
  }

  // Horizontal grid lines (subdivide domain Y)
  const yStep = dyRange / subdivisions;
  for (let i = 0; i <= subdivisions; i++) {
    const domY = domainY[0] + i * yStep;
    const { py } = domainToCanvas(0, domY, viewport, w, h);
    const isBound = i === 0 || i === subdivisions;
    ctx.globalAlpha = opacity * (isBound ? 0.25 : 0.12);
    ctx.strokeStyle = theme.borderDefault;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(py) + 0.5);
    ctx.lineTo(w, Math.round(py) + 0.5);
    ctx.stroke();
  }
}

/**
 * Draw stronger lines at the domain boundaries (min/max on both axes).
 */
export function drawDomainBounds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: CanvasThemeColors,
  domain: DomainBounds,
  viewport: CanvasViewport,
  opacity: number = 1
): void {
  const { domainX, domainY } = domain;

  ctx.globalAlpha = opacity * 0.35;
  ctx.strokeStyle = theme.borderDefault;
  ctx.lineWidth = 1.5;

  const { px: pxMin } = domainToCanvas(domainX[0], 0, viewport, w, h);
  ctx.beginPath();
  ctx.moveTo(Math.round(pxMin) + 0.5, 0);
  ctx.lineTo(Math.round(pxMin) + 0.5, h);
  ctx.stroke();

  const { px: pxMax } = domainToCanvas(domainX[1], 0, viewport, w, h);
  ctx.beginPath();
  ctx.moveTo(Math.round(pxMax) + 0.5, 0);
  ctx.lineTo(Math.round(pxMax) + 0.5, h);
  ctx.stroke();

  const { py: pyMin } = domainToCanvas(0, domainY[0], viewport, w, h);
  ctx.beginPath();
  ctx.moveTo(0, Math.round(pyMin) + 0.5);
  ctx.lineTo(w, Math.round(pyMin) + 0.5);
  ctx.stroke();

  const { py: pyMax } = domainToCanvas(0, domainY[1], viewport, w, h);
  ctx.beginPath();
  ctx.moveTo(0, Math.round(pyMax) + 0.5);
  ctx.lineTo(w, Math.round(pyMax) + 0.5);
  ctx.stroke();
}

/**
 * Draw axis labels at clean domain values.
 *
 * Y labels on the left side, X labels at the bottom.
 * Extracted from CurveEditor's drawAxisLabels — identical layout algorithm.
 */
export function drawAxisLabels(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: CanvasThemeColors,
  options: AxisLabelOptions
): void {
  const {
    subdivisions,
    domain,
    viewport,
    opacity = 1,
    labelX,
    labelY,
  } = options;
  const { domainX, domainY } = domain;
  const dxRange = domainX[1] - domainX[0] || 1;
  const dyRange = domainY[1] - domainY[0] || 1;

  const fontSize = theme.fontSizeXs;
  ctx.globalAlpha = opacity * 0.7;
  ctx.fillStyle = theme.textMuted;
  ctx.font = `${fontSize}px sans-serif`;

  const sidePadding = 4;
  const axisGap = 6;

  const { px: xAxisMin } = domainToCanvas(domainX[0], 0, viewport, w, h);
  const { px: xAxisMax } = domainToCanvas(domainX[1], 0, viewport, w, h);
  const { py: yAxisMin } = domainToCanvas(0, domainY[0], viewport, w, h);
  const { py: yAxisMax } = domainToCanvas(0, domainY[1], viewport, w, h);

  const xTickTop = clamp(
    yAxisMin + axisGap,
    yAxisMax + 2,
    h - fontSize - (labelX ? fontSize + 8 : 2)
  );
  const xAxisLabelTop = labelX
    ? clamp(xTickTop + fontSize + 4, 0, h - fontSize - 1)
    : 0;

  const yTickAnchorX = clamp(
    xAxisMin - axisGap,
    sidePadding + 1,
    w - sidePadding
  );
  const yTickMinY = fontSize / 2 + 2;
  const yTickMaxY = Math.max(yTickMinY, xTickTop - 2);
  const yAxisLabelTop = clamp(
    yAxisMax - fontSize - 4,
    sidePadding,
    Math.max(sidePadding, xTickTop - fontSize - 6)
  );

  // X axis labels (bottom, aligned to domain subdivisions)
  ctx.textBaseline = 'top';
  const xStep = dxRange / subdivisions;
  for (let i = 0; i <= subdivisions; i++) {
    const domX = domainX[0] + i * xStep;
    const { px } = domainToCanvas(domX, 0, viewport, w, h);
    const label = formatLabel(domX, dxRange);

    if (i === 0) {
      ctx.textAlign = 'left';
      ctx.fillText(label, xAxisMin + 2, xTickTop);
    } else if (i === subdivisions) {
      ctx.textAlign = 'right';
      ctx.fillText(label, xAxisMax - 2, xTickTop);
    } else {
      ctx.textAlign = 'center';
      ctx.fillText(label, clamp(px, xAxisMin + 2, xAxisMax - 2), xTickTop);
    }
  }

  // Y axis labels (left side, aligned to domain subdivisions)
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const yStep = dyRange / subdivisions;
  for (let i = 0; i <= subdivisions; i++) {
    const domY = domainY[0] + i * yStep;
    const { py } = domainToCanvas(0, domY, viewport, w, h);
    const label = formatLabel(domY, dyRange);

    const clampedPy = clamp(py, yTickMinY, yTickMaxY);
    ctx.fillText(label, yTickAnchorX, clampedPy);
  }

  // Axis name labels
  if (labelX) {
    const textWidth = ctx.measureText(labelX).width;
    const x = clamp(
      xAxisMax + axisGap,
      sidePadding,
      w - sidePadding - textWidth
    );
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(labelX, x, xAxisLabelTop);
  }
  if (labelY) {
    const x = clamp(xAxisMin + axisGap, sidePadding, w - sidePadding);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(labelY, x, yAxisLabelTop);
  }
}

/**
 * Draw crosshair lines through a point.
 *
 * Used by CartesianPicker to show the current selection.
 * Can be solid or dashed, full-span or limited to domain bounds.
 */
export function drawCrosshair(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: CanvasThemeColors,
  options: CrosshairOptions
): void {
  const {
    point,
    viewport,
    lineStyle = 'dashed',
    lineWidth = 1,
    fullSpan = true,
    opacity = 1,
  } = options;

  const { px, py } = domainToCanvas(point.x, point.y, viewport, w, h);

  ctx.globalAlpha = opacity * 0.6;
  ctx.strokeStyle = theme.accentPrimary;
  ctx.lineWidth = lineWidth;

  if (lineStyle === 'dashed') {
    ctx.setLineDash([4, 4]);
  } else {
    ctx.setLineDash([]);
  }

  // Vertical line through point
  ctx.beginPath();
  ctx.moveTo(Math.round(px) + 0.5, fullSpan ? 0 : py - 20);
  ctx.lineTo(Math.round(px) + 0.5, fullSpan ? h : py + 20);
  ctx.stroke();

  // Horizontal line through point
  ctx.beginPath();
  ctx.moveTo(fullSpan ? 0 : px - 20, Math.round(py) + 0.5);
  ctx.lineTo(fullSpan ? w : px + 20, Math.round(py) + 0.5);
  ctx.stroke();

  ctx.setLineDash([]);
}

/**
 * Draw a circular point marker.
 *
 * Used by CartesianPicker for the selected point.
 * Supports hover and drag visual states.
 */
export function drawPointMarker(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: CanvasThemeColors,
  options: PointMarkerOptions
): void {
  const {
    point,
    viewport,
    radius = 6,
    hovered = false,
    dragging = false,
    opacity = 1,
  } = options;

  const { px, py } = domainToCanvas(point.x, point.y, viewport, w, h);
  const effectiveRadius = hovered || dragging ? radius + 2 : radius;

  ctx.globalAlpha = opacity;

  // Outer ring
  ctx.beginPath();
  ctx.arc(px, py, effectiveRadius, 0, Math.PI * 2);
  ctx.fillStyle = dragging ? theme.accentPrimary : theme.backgroundSecondary;
  ctx.fill();
  ctx.strokeStyle = theme.accentPrimary;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner dot
  ctx.beginPath();
  ctx.arc(px, py, 2, 0, Math.PI * 2);
  ctx.fillStyle = theme.accentPrimary;
  ctx.fill();
}

/**
 * Draw axis origin lines (X=0 and Y=0 if visible within viewport).
 *
 * Useful for CartesianPicker where domain is centered on origin.
 */
export function drawOriginAxes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: CanvasThemeColors,
  viewport: CanvasViewport,
  opacity: number = 1
): void {
  const [vxMin, vxMax] = viewport.viewX;
  const [vyMin, vyMax] = viewport.viewY;

  ctx.globalAlpha = opacity * 0.5;
  ctx.strokeStyle = theme.textMuted;
  ctx.lineWidth = 1;

  // Y axis (x = 0) if in viewport
  if (vxMin <= 0 && vxMax >= 0) {
    const { px } = domainToCanvas(0, 0, viewport, w, h);
    ctx.beginPath();
    ctx.moveTo(Math.round(px) + 0.5, 0);
    ctx.lineTo(Math.round(px) + 0.5, h);
    ctx.stroke();
  }

  // X axis (y = 0) if in viewport
  if (vyMin <= 0 && vyMax >= 0) {
    const { py } = domainToCanvas(0, 0, viewport, w, h);
    ctx.beginPath();
    ctx.moveTo(0, Math.round(py) + 0.5);
    ctx.lineTo(w, Math.round(py) + 0.5);
    ctx.stroke();
  }
}
