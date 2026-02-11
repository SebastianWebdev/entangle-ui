import { clamp } from '@/utils/mathUtils';
import {
  domainToCanvas as sharedDomainToCanvas,
  canvasToDomain as sharedCanvasToDomain,
} from '@/components/primitives/canvas';
import type { CanvasViewport } from '@/components/primitives/canvas';
import type {
  CurveData,
  CurveKeyframe,
  CurveViewport,
  CurveHitTest,
} from './CurveEditor.types';

let idCounter = 0;

/**
 * Generate a unique keyframe ID.
 */
export function generateKeyframeId(): string {
  idCounter += 1;
  return `kf-${Date.now()}-${idCounter}`;
}

/**
 * Evaluate a cubic bezier at parameter t in [0, 1].
 * B(t) = (1-t)^3*p0 + 3*(1-t)^2*t*p1 + 3*(1-t)*t^2*p2 + t^3*p3
 */
export function evaluateBezier(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

/**
 * Evaluate a 2D cubic bezier curve at parameter t.
 */
export function evaluateBezier2D(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
): { x: number; y: number } {
  return {
    x: evaluateBezier(p0.x, p1.x, p2.x, p3.x, t),
    y: evaluateBezier(p0.y, p1.y, p2.y, p3.y, t),
  };
}

/**
 * Derivative of cubic bezier at parameter t.
 * B'(t) = 3*(1-t)^2*(p1-p0) + 6*(1-t)*t*(p2-p1) + 3*t^2*(p3-p2)
 */
function bezierDerivative(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number {
  const mt = 1 - t;
  return (
    3 * mt * mt * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t * t * (p3 - p2)
  );
}

/**
 * Find the t parameter for a given X value on a bezier segment.
 * Uses Newton-Raphson iteration with bisection fallback.
 */
export function findTForX(
  x0: number,
  x1: number,
  x2: number,
  x3: number,
  targetX: number,
  tolerance: number = 1e-6,
  maxIterations: number = 20
): number {
  // Initial guess using linear interpolation
  let t = (targetX - x0) / (x3 - x0 || 1);
  t = clamp(t, 0, 1);

  // Newton-Raphson iteration
  for (let i = 0; i < maxIterations; i++) {
    const x = evaluateBezier(x0, x1, x2, x3, t) - targetX;
    if (Math.abs(x) < tolerance) return t;

    const dx = bezierDerivative(x0, x1, x2, x3, t);
    if (Math.abs(dx) < 1e-10) break; // Derivative too small, fallback

    const newT = t - x / dx;
    t = clamp(newT, 0, 1);
  }

  // Bisection fallback for robustness
  let lo = 0;
  let hi = 1;
  t = 0.5;
  for (let i = 0; i < maxIterations; i++) {
    const x = evaluateBezier(x0, x1, x2, x3, t);
    if (Math.abs(x - targetX) < tolerance) return t;

    if (x < targetX) {
      lo = t;
    } else {
      hi = t;
    }
    t = (lo + hi) / 2;
  }

  return t;
}

/**
 * Get the bezier control points for a segment between two keyframes.
 */
function getSegmentControlPoints(
  kf0: CurveKeyframe,
  kf1: CurveKeyframe
): {
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
} {
  return {
    p0: { x: kf0.x, y: kf0.y },
    p1: { x: kf0.x + kf0.handleOut.x, y: kf0.y + kf0.handleOut.y },
    p2: { x: kf1.x + kf1.handleIn.x, y: kf1.y + kf1.handleIn.y },
    p3: { x: kf1.x, y: kf1.y },
  };
}

/**
 * Evaluate the entire curve at a given X position.
 * Finds the right segment, solves for t, returns Y.
 */
export function evaluateCurve(curve: CurveData, x: number): number {
  const { keyframes } = curve;
  if (keyframes.length === 0) return 0;

  const first = keyframes[0];
  const last = keyframes[keyframes.length - 1];
  if (!first || !last) return 0;

  if (keyframes.length === 1) return first.y;

  // Handle out-of-range X
  if (x <= first.x) return first.y;
  if (x >= last.x) return last.y;

  // Find the segment containing x
  for (let i = 0; i < keyframes.length - 1; i++) {
    const kf0 = keyframes[i];
    const kf1 = keyframes[i + 1];
    if (!kf0 || !kf1) continue;

    if (x >= kf0.x && x <= kf1.x) {
      // Handle step mode
      if (kf0.tangentMode === 'step') {
        return kf0.y;
      }

      // Handle linear mode (both keyframes)
      if (kf0.tangentMode === 'linear' && kf1.tangentMode === 'linear') {
        const segT = (x - kf0.x) / (kf1.x - kf0.x || 1);
        return kf0.y + segT * (kf1.y - kf0.y);
      }

      const { p0, p1, p2, p3 } = getSegmentControlPoints(kf0, kf1);
      const t = findTForX(p0.x, p1.x, p2.x, p3.x, x);
      return evaluateBezier(p0.y, p1.y, p2.y, p3.y, t);
    }
  }

  return last.y;
}

/**
 * Sample the curve at N evenly-spaced X points.
 * Returns array of {x, y} for rendering as a polyline.
 */
export function sampleCurve(
  curve: CurveData,
  numSamples: number
): Array<{ x: number; y: number }> {
  const [xMin, xMax] = curve.domainX;
  const samples: Array<{ x: number; y: number }> = [];
  const step = (xMax - xMin) / (numSamples - 1 || 1);

  for (let i = 0; i < numSamples; i++) {
    const x = xMin + i * step;
    samples.push({ x, y: evaluateCurve(curve, x) });
  }

  return samples;
}

/**
 * Compute auto-tangent handles for a keyframe based on neighbors.
 * Catmull-Rom style: tangent direction = (next - prev) scaled by segment length.
 */
export function computeAutoTangent(
  prev: CurveKeyframe | null,
  current: CurveKeyframe,
  next: CurveKeyframe | null
): { handleIn: { x: number; y: number }; handleOut: { x: number; y: number } } {
  const TANGENT_SCALE = 1 / 3;

  if (!prev && !next) {
    return { handleIn: { x: 0, y: 0 }, handleOut: { x: 0, y: 0 } };
  }

  if (!prev && next) {
    // First keyframe — use direction to next
    const dx = (next.x - current.x) * TANGENT_SCALE;
    const dy = (next.y - current.y) * TANGENT_SCALE;
    return {
      handleIn: { x: -dx, y: -dy },
      handleOut: { x: dx, y: dy },
    };
  }

  if (!next && prev) {
    // Last keyframe — use direction from prev
    const dx = (current.x - prev.x) * TANGENT_SCALE;
    const dy = (current.y - prev.y) * TANGENT_SCALE;
    return {
      handleIn: { x: -dx, y: -dy },
      handleOut: { x: dx, y: dy },
    };
  }

  if (!prev || !next) {
    return { handleIn: { x: 0, y: 0 }, handleOut: { x: 0, y: 0 } };
  }

  // Middle keyframe — Catmull-Rom tangent
  const dx = (next.x - prev.x) * TANGENT_SCALE;
  const dy = (next.y - prev.y) * TANGENT_SCALE;

  return {
    handleIn: { x: -dx, y: -dy },
    handleOut: { x: dx, y: dy },
  };
}

/**
 * Apply tangent mode constraints to a keyframe after a handle was moved.
 * - aligned: project opposite handle to co-linear with moved handle
 * - mirrored: mirror moved handle to opposite
 */
export function constrainTangent(
  keyframe: CurveKeyframe,
  movedHandle: 'in' | 'out'
): CurveKeyframe {
  const { tangentMode } = keyframe;

  if (
    tangentMode === 'free' ||
    tangentMode === 'auto' ||
    tangentMode === 'linear' ||
    tangentMode === 'step'
  ) {
    return keyframe;
  }

  const moved = movedHandle === 'in' ? keyframe.handleIn : keyframe.handleOut;
  const movedLength = Math.sqrt(moved.x * moved.x + moved.y * moved.y);

  if (movedLength < 1e-10) {
    return keyframe;
  }

  if (tangentMode === 'mirrored') {
    // Opposite handle is exact negative
    const opposite = { x: -moved.x, y: -moved.y };
    return movedHandle === 'in'
      ? { ...keyframe, handleOut: opposite }
      : { ...keyframe, handleIn: opposite };
  }

  if (tangentMode === 'aligned') {
    // Opposite handle keeps its length but aligns direction
    const other = movedHandle === 'in' ? keyframe.handleOut : keyframe.handleIn;
    const otherLength = Math.sqrt(other.x * other.x + other.y * other.y);

    if (otherLength < 1e-10) {
      return keyframe;
    }

    // Direction opposite to moved handle, scaled to original length
    const scale = otherLength / movedLength;
    const opposite = { x: -moved.x * scale, y: -moved.y * scale };

    return movedHandle === 'in'
      ? { ...keyframe, handleOut: opposite }
      : { ...keyframe, handleIn: opposite };
  }

  return keyframe;
}

/**
 * Compute step function value (hold previous Y until next keyframe).
 */
export function evaluateStep(curve: CurveData, x: number): number {
  const { keyframes } = curve;
  if (keyframes.length === 0) return 0;

  const first = keyframes[0];
  if (!first) return 0;
  if (x <= first.x) return first.y;

  for (let i = keyframes.length - 1; i >= 0; i--) {
    const kf = keyframes[i];
    if (kf && kf.x <= x) {
      return kf.y;
    }
  }

  return first.y;
}

/**
 * Handle infinity behavior (cycle, pingpong, linear extrapolation).
 * Returns the wrapped X value and whether Y should be flipped (for pingpong).
 */
export function wrapX(
  x: number,
  domainX: [number, number],
  preInfinity: CurveData['preInfinity'],
  postInfinity: CurveData['postInfinity']
): { wrappedX: number; flipY: boolean } {
  const [xMin, xMax] = domainX;
  const range = xMax - xMin;

  if (range <= 0) return { wrappedX: xMin, flipY: false };

  // Within range — no wrapping needed
  if (x >= xMin && x <= xMax) {
    return { wrappedX: x, flipY: false };
  }

  const mode =
    x < xMin ? (preInfinity ?? 'constant') : (postInfinity ?? 'constant');

  switch (mode) {
    case 'constant':
      return { wrappedX: clamp(x, xMin, xMax), flipY: false };

    case 'linear':
      // No wrapping — caller should extrapolate
      return { wrappedX: x, flipY: false };

    case 'cycle': {
      const normalized = (((x - xMin) % range) + range) % range;
      return { wrappedX: xMin + normalized, flipY: false };
    }

    case 'pingpong': {
      const normalized = (((x - xMin) % (range * 2)) + range * 2) % (range * 2);
      if (normalized > range) {
        return { wrappedX: xMin + (range * 2 - normalized), flipY: false };
      }
      return { wrappedX: xMin + normalized, flipY: false };
    }

    default:
      return { wrappedX: clamp(x, xMin, xMax), flipY: false };
  }
}

/**
 * Convert domain coordinates to canvas pixel coordinates.
 * Re-exported from shared canvas primitives for backward compatibility.
 */
export function domainToCanvas(
  domainX: number,
  domainY: number,
  viewport: CurveViewport | CanvasViewport,
  canvasWidth: number,
  canvasHeight: number
): { px: number; py: number } {
  return sharedDomainToCanvas(
    domainX,
    domainY,
    viewport,
    canvasWidth,
    canvasHeight
  );
}

/**
 * Convert canvas pixel coordinates to domain coordinates.
 * Re-exported from shared canvas primitives for backward compatibility.
 */
export function canvasToDomain(
  px: number,
  py: number,
  viewport: CurveViewport | CanvasViewport,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return sharedCanvasToDomain(px, py, viewport, canvasWidth, canvasHeight);
}

/**
 * Hit test — find the nearest element to a canvas pixel position.
 */
export function hitTest(
  px: number,
  py: number,
  curve: CurveData,
  viewport: CurveViewport,
  canvasWidth: number,
  canvasHeight: number,
  tolerancePx: number = 10
): CurveHitTest {
  const noHit: CurveHitTest = {
    type: 'none',
    keyframeIndex: -1,
    distance: Infinity,
  };
  let best = noHit;

  const { keyframes } = curve;

  // Test keyframes and handles (closest wins)
  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    if (!kf) continue;
    const kfCanvas = domainToCanvas(
      kf.x,
      kf.y,
      viewport,
      canvasWidth,
      canvasHeight
    );
    const kfDist = Math.sqrt((px - kfCanvas.px) ** 2 + (py - kfCanvas.py) ** 2);

    if (kfDist < tolerancePx && kfDist < best.distance) {
      best = { type: 'keyframe', keyframeIndex: i, distance: kfDist };
    }

    // Check handles (only if handles are visible — selected state checked by caller)
    const hInCanvas = domainToCanvas(
      kf.x + kf.handleIn.x,
      kf.y + kf.handleIn.y,
      viewport,
      canvasWidth,
      canvasHeight
    );
    const hInDist = Math.sqrt(
      (px - hInCanvas.px) ** 2 + (py - hInCanvas.py) ** 2
    );
    if (hInDist < tolerancePx && hInDist < best.distance) {
      best = { type: 'handleIn', keyframeIndex: i, distance: hInDist };
    }

    const hOutCanvas = domainToCanvas(
      kf.x + kf.handleOut.x,
      kf.y + kf.handleOut.y,
      viewport,
      canvasWidth,
      canvasHeight
    );
    const hOutDist = Math.sqrt(
      (px - hOutCanvas.px) ** 2 + (py - hOutCanvas.py) ** 2
    );
    if (hOutDist < tolerancePx && hOutDist < best.distance) {
      best = { type: 'handleOut', keyframeIndex: i, distance: hOutDist };
    }
  }

  // If we found a keyframe or handle, return that (higher priority than curve)
  if (best.type !== 'none') return best;

  // Test curve line
  if (keyframes.length >= 2) {
    const samples = sampleCurve(curve, 200);
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      if (!s) continue;
      const sCanvas = domainToCanvas(
        s.x,
        s.y,
        viewport,
        canvasWidth,
        canvasHeight
      );
      const dist = Math.sqrt((px - sCanvas.px) ** 2 + (py - sCanvas.py) ** 2);
      if (dist < tolerancePx && dist < best.distance) {
        best = { type: 'curve', keyframeIndex: -1, distance: dist };
      }
    }
  }

  return best;
}

/**
 * Sort keyframes by X position (required after move).
 */
export function sortKeyframes(keyframes: CurveKeyframe[]): CurveKeyframe[] {
  return [...keyframes].sort((a, b) => a.x - b.x);
}

/**
 * Create a default linear curve.
 */
export function createLinearCurve(
  domainX: [number, number] = [0, 1],
  domainY: [number, number] = [0, 1]
): CurveData {
  return {
    keyframes: [
      {
        x: domainX[0],
        y: domainY[0],
        handleIn: { x: 0, y: 0 },
        handleOut: {
          x: (domainX[1] - domainX[0]) / 3,
          y: (domainY[1] - domainY[0]) / 3,
        },
        tangentMode: 'linear',
        id: generateKeyframeId(),
      },
      {
        x: domainX[1],
        y: domainY[1],
        handleIn: {
          x: -(domainX[1] - domainX[0]) / 3,
          y: -(domainY[1] - domainY[0]) / 3,
        },
        handleOut: { x: 0, y: 0 },
        tangentMode: 'linear',
        id: generateKeyframeId(),
      },
    ],
    domainX,
    domainY,
  };
}

/**
 * Ensure every keyframe has an ID.
 */
export function ensureKeyframeIds(keyframes: CurveKeyframe[]): CurveKeyframe[] {
  return keyframes.map(kf =>
    kf.id ? kf : { ...kf, id: generateKeyframeId() }
  );
}
