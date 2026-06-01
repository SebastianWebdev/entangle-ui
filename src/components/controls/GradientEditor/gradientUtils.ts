/**
 * Pure helpers for the GradientEditor.
 *
 * The component's internal model is {@link GradientData}. CSS strings are
 * derived on demand here (format) and parsed back here (parse), reusing the
 * ColorPicker's `parseColor` / `formatColor` for the per-stop color work.
 */

import {
  formatColor,
  parseColor,
} from '@/components/controls/ColorPicker/colorUtils';
import { clamp } from '@/utils/mathUtils';

import type {
  GradientData,
  GradientStop,
  GradientType,
} from './GradientEditor.types';

let idCounter = 0;

/**
 * Generate a unique gradient stop ID.
 */
export function generateStopId(): string {
  idCounter += 1;
  return `gs-${Date.now()}-${idCounter}`;
}

/**
 * Default gradient: black → white, horizontal linear.
 */
export function createDefaultGradient(): GradientData {
  return {
    type: 'linear',
    angle: 90,
    stops: [
      { id: generateStopId(), color: '#000000', position: 0 },
      { id: generateStopId(), color: '#ffffff', position: 1 },
    ],
  };
}

/**
 * Return a copy of the stops sorted by position. Stable for equal positions.
 */
export function sortStops(stops: GradientStop[]): GradientStop[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

/**
 * Normalize gradient data into a safe internal form:
 * - every stop has an id
 * - positions clamped to 0–1
 * - stops sorted by position
 */
export function normalizeGradient(data: GradientData): GradientData {
  const stops = sortStops(
    data.stops.map(stop => ({
      id: stop.id || generateStopId(),
      color: stop.color,
      position: clamp(stop.position, 0, 1),
    }))
  );
  return { type: data.type, angle: data.angle, stops };
}

/**
 * Format a single stop as a CSS color-stop fragment (e.g. `#ff0000 50%`).
 */
function formatStop(stop: GradientStop): string {
  const pct = Number((clamp(stop.position, 0, 1) * 100).toFixed(2));
  return `${stop.color} ${pct}%`;
}

/**
 * Serialize {@link GradientData} to a CSS gradient string.
 *
 * @example
 * formatGradientCSS({ type: 'linear', angle: 90, stops: [...] })
 * // -> "linear-gradient(90deg, #000000 0%, #ffffff 100%)"
 */
export function formatGradientCSS(data: GradientData): string {
  const stops = sortStops(data.stops).map(formatStop).join(', ');

  switch (data.type) {
    case 'radial':
      return `radial-gradient(circle, ${stops})`;
    case 'conic':
      return `conic-gradient(from ${data.angle}deg, ${stops})`;
    case 'linear':
    default:
      return `linear-gradient(${data.angle}deg, ${stops})`;
  }
}

/**
 * CSS used purely for previewing a gradient ramp left-to-right, regardless of
 * the gradient's own type/angle. Used by the stops track background so stops
 * line up with their positions.
 */
export function formatRampPreviewCSS(stops: GradientStop[]): string {
  const ordered = sortStops(stops).map(formatStop).join(', ');
  return `linear-gradient(to right, ${ordered})`;
}

// --- Parsing ---

/**
 * Split a comma-separated argument list while respecting parentheses, so
 * `rgb(0, 0, 0) 50%` is not split on its inner commas.
 */
function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of input) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Parse one color-stop fragment into a partial stop. Position is optional;
 * `null` means "not specified" so the caller can distribute it evenly.
 */
function parseStopFragment(
  fragment: string
): { color: string; position: number | null } | null {
  const pctMatch = fragment.match(/\s(-?[\d.]+)%\s*$/);
  let colorPart = fragment;
  let position: number | null = null;

  if (pctMatch) {
    position = clamp(parseFloat(pctMatch[1] ?? '0') / 100, 0, 1);
    colorPart = fragment.slice(0, fragment.length - pctMatch[0].length).trim();
  }

  // Validate the color by round-tripping through the ColorPicker parser.
  // parseColor falls back to blue on garbage, so reject obvious empties.
  if (!colorPart) return null;
  const hsva = parseColor(colorPart);
  const normalizedColor =
    hsva.a < 1 ? formatColor(hsva, 'rgba') : formatColor(hsva, 'hex');

  return { color: normalizedColor, position };
}

/**
 * Parse a CSS gradient string into {@link GradientData}.
 *
 * Supports `linear-gradient`, `radial-gradient`, and `conic-gradient` with
 * an optional leading angle (`90deg`, `from 45deg`). Returns `null` when the
 * string can't be understood as a gradient.
 */
export function parseGradientCSS(input: string): GradientData | null {
  const trimmed = input.trim();
  const match = trimmed.match(
    /^(linear|radial|conic)-gradient\s*\(([\s\S]*)\)\s*;?\s*$/i
  );
  if (!match) return null;

  const type = (match[1] ?? 'linear').toLowerCase() as GradientType;
  const body = match[2] ?? '';
  const args = splitTopLevel(body);
  if (args.length === 0) return null;

  let angle = type === 'linear' ? 90 : 0;
  let stopArgs = args;

  // The first argument may be a direction / shape / angle rather than a stop.
  const first = args[0] ?? '';
  const angleMatch = first.match(/^(?:from\s+)?(-?[\d.]+)deg$/i);
  if (angleMatch) {
    angle = parseFloat(angleMatch[1] ?? '0');
    stopArgs = args.slice(1);
  } else if (/^(to\s+|circle|ellipse|at\s+|closest|farthest)/i.test(first)) {
    // Non-angle direction/shape keyword — skip it, keep the type's default angle.
    stopArgs = args.slice(1);
  }

  const parsed = stopArgs
    .map(parseStopFragment)
    .filter((s): s is { color: string; position: number | null } => s !== null);

  if (parsed.length < 2) return null;

  // Distribute missing positions evenly across the ramp.
  const stops: GradientStop[] = parsed.map((stop, index) => ({
    id: generateStopId(),
    color: stop.color,
    position:
      stop.position ?? (parsed.length === 1 ? 0 : index / (parsed.length - 1)),
  }));

  return normalizeGradient({ type, angle, stops });
}

/**
 * Insert a new stop at `position`, taking the color the gradient already shows
 * at that position (interpolated from the nearest neighbors' raw colors — a
 * simple pick of the left neighbor keeps it dependency-free and predictable).
 */
export function addStopAt(
  data: GradientData,
  position: number,
  color?: string
): { data: GradientData; id: string } {
  const clamped = clamp(position, 0, 1);
  const ordered = sortStops(data.stops);

  // Pick the color of the nearest stop to the left (or the first stop).
  let inherited = ordered[0]?.color ?? '#ffffff';
  for (const stop of ordered) {
    if (stop.position <= clamped) inherited = stop.color;
    else break;
  }

  const id = generateStopId();
  const next = normalizeGradient({
    ...data,
    stops: [
      ...data.stops,
      { id, color: color ?? inherited, position: clamped },
    ],
  });
  return { data: next, id };
}
