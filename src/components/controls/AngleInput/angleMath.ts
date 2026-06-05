// Pure angle helpers for AngleInput. No React, no DOM — safe to unit-test and
// reuse. The component uses the CSS gradient convention: 0° points up (north)
// and the angle increases clockwise (90° = east, 180° = south, 270° = west),
// matching `linear-gradient(<angle>, …)`.

/**
 * Normalize an angle into the `[0, 360)` range.
 */
export function normalizeAngle(angle: number): number {
  const wrapped = angle % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/**
 * Convert a pointer offset from the dial center into a CSS-convention angle in
 * degrees (0° = up, increasing clockwise). `dx`/`dy` are screen-space offsets
 * where `y` grows downward.
 *
 * `atan2(dx, -dy)` maps: up (`dx=0, dy<0`) → 0°, right (`dx>0, dy=0`) → 90°,
 * down → 180°, left → 270°.
 */
export function angleFromPointer(dx: number, dy: number): number {
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return normalizeAngle(deg);
}

/**
 * Snap an angle to the nearest multiple of `increment` degrees. A non-positive
 * increment returns the angle unchanged (snapping disabled).
 */
export function snapAngle(angle: number, increment: number): number {
  if (increment <= 0) return angle;
  return normalizeAngle(Math.round(angle / increment) * increment);
}

/**
 * Constrain a value to `[min, max]`. When the range spans a full circle
 * (`max - min === 360`) the value wraps around the circle; otherwise it is
 * clamped to the bounds.
 */
export function clampOrWrap(value: number, min: number, max: number): number {
  const range = max - min;
  if (range === 360) {
    return ((((value - min) % range) + range) % range) + min;
  }
  return Math.min(max, Math.max(min, value));
}
