import type { CanvasViewport, Point2D } from './canvas.types';

/**
 * Convert domain coordinates to canvas pixel coordinates.
 *
 * Y axis is flipped: domain Y goes up, canvas Y goes down.
 */
export function domainToCanvas(
  domainX: number,
  domainY: number,
  viewport: CanvasViewport,
  canvasWidth: number,
  canvasHeight: number
): { px: number; py: number } {
  const [vxMin, vxMax] = viewport.viewX;
  const [vyMin, vyMax] = viewport.viewY;

  const vw = vxMax - vxMin || 1;
  const vh = vyMax - vyMin || 1;

  const px = ((domainX - vxMin) / vw) * canvasWidth;
  const py = ((vyMax - domainY) / vh) * canvasHeight;

  return { px, py };
}

/**
 * Convert canvas pixel coordinates to domain coordinates.
 *
 * Inverse of domainToCanvas — Y axis is flipped.
 */
export function canvasToDomain(
  px: number,
  py: number,
  viewport: CanvasViewport,
  canvasWidth: number,
  canvasHeight: number
): Point2D {
  const [vxMin, vxMax] = viewport.viewX;
  const [vyMin, vyMax] = viewport.viewY;

  const vw = vxMax - vxMin || 1;
  const vh = vyMax - vyMin || 1;

  const x = vxMin + (px / canvasWidth) * vw;
  const y = vyMax - (py / canvasHeight) * vh;

  return { x, y };
}

/**
 * Test whether a canvas pixel position is within tolerance of a domain point.
 *
 * @returns Distance in pixels, or Infinity if outside tolerance
 */
export function hitTestPoint(
  px: number,
  py: number,
  point: Point2D,
  viewport: CanvasViewport,
  canvasWidth: number,
  canvasHeight: number,
  tolerancePx: number = 10
): number {
  const target = domainToCanvas(
    point.x,
    point.y,
    viewport,
    canvasWidth,
    canvasHeight
  );
  const dist = Math.sqrt((px - target.px) ** 2 + (py - target.py) ** 2);
  return dist <= tolerancePx ? dist : Infinity;
}

/**
 * Get the canvas-pixel position of a pointer event relative to the canvas.
 */
export function getCanvasPointerPosition(
  e: { clientX: number; clientY: number },
  canvas: HTMLCanvasElement
): { px: number; py: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    px: e.clientX - rect.left,
    py: e.clientY - rect.top,
  };
}
