// src/types/keyframe.ts

/**
 * Shared keyframe / curve data model.
 *
 * Used by both CurveEditor and Timeline so they speak the same keyframe
 * language: Timeline tracks reuse `CurveKeyframe`, and Timeline's graph mode
 * assembles a `CurveData` per track to reuse `evaluateCurve`. Promoted out of
 * CurveEditor so neither component depends on the other.
 */

/**
 * Tangent handle mode — controls how handles behave around a keyframe.
 * - `free`: Each handle moves independently
 * - `aligned`: Handles stay co-linear but can differ in length
 * - `mirrored`: Handles are symmetric (same angle and length)
 * - `auto`: Smooth catmull-rom style — handles auto-computed from neighbors
 * - `linear`: No handles — straight line segments
 * - `step`: Constant value until next keyframe (hold / step function)
 */
export type TangentMode =
  | 'free'
  | 'aligned'
  | 'mirrored'
  | 'auto'
  | 'linear'
  | 'step';

/**
 * Single control point (keyframe) on the curve.
 */
export interface CurveKeyframe {
  /** X position in domain space (e.g., 0-1 for normalized, 0-100 for frames) */
  x: number;
  /** Y value at this position */
  y: number;
  /** Left tangent handle offset (relative to keyframe position) */
  handleIn: { x: number; y: number };
  /** Right tangent handle offset (relative to keyframe position) */
  handleOut: { x: number; y: number };
  /** Tangent mode for this keyframe */
  tangentMode: TangentMode;
  /** Optional unique ID (auto-generated if not provided) */
  id?: string;
}

/**
 * Complete curve data model.
 */
export interface CurveData {
  /** Ordered array of keyframes (sorted by x) */
  keyframes: CurveKeyframe[];
  /** Domain bounds — x range */
  domainX: [number, number];
  /** Domain bounds — y range */
  domainY: [number, number];
  /**
   * Pre-infinity behavior — what happens before the first keyframe
   * @default "constant"
   */
  preInfinity?: 'constant' | 'linear' | 'cycle' | 'pingpong';
  /**
   * Post-infinity behavior — what happens after the last keyframe
   * @default "constant"
   */
  postInfinity?: 'constant' | 'linear' | 'cycle' | 'pingpong';
}
