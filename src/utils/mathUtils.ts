/**
 * Clamps a value between min and max bounds
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Rounds a number to specified decimal places
 */
export function roundToPrecision(value: number, precision?: number): number {
  if (precision === undefined) return value;
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}
