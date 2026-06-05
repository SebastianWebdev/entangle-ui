import type { PathInput, PathSegment } from './PathBar.types';

/**
 * Pure helpers for turning file-path-like input into breadcrumb segments.
 *
 * No React, no DOM — safe to unit test in isolation and import without a
 * `'use client'` boundary.
 */

export const DEFAULT_DELIMITER = '/';

/**
 * A segment whose navigation `value` has been resolved. PathBar works with
 * these internally so every crumb is guaranteed a stable path to navigate to.
 */
export interface ResolvedPathSegment extends PathSegment {
  value: string;
}

/** Split a raw string path into its non-empty label parts. */
function splitLabels(path: string, delimiter: string): string[] {
  // An empty delimiter cannot split — treat the whole string as one label.
  if (delimiter === '') {
    return path.length > 0 ? [path] : [];
  }
  return path.split(delimiter).filter(part => part.length > 0);
}

/** True when a string path begins with the delimiter (an absolute path). */
function isAbsolute(path: string, delimiter: string): boolean {
  return delimiter !== '' && path.startsWith(delimiter);
}

/**
 * Build the cumulative navigation value for the segment at `index`: the path
 * from the root up to and including that segment.
 *
 * @param labels   Ordered segment labels.
 * @param index    Index of the segment whose value is wanted.
 * @param delimiter Joiner placed between labels.
 * @param absolute When true, the result keeps a leading delimiter.
 */
export function joinPath(
  labels: readonly string[],
  index: number,
  delimiter: string = DEFAULT_DELIMITER,
  absolute = false
): string {
  const prefix = absolute ? delimiter : '';
  return prefix + labels.slice(0, index + 1).join(delimiter);
}

/**
 * The path prefix of a resolved segment — its `value` with the trailing label
 * removed. Useful for building a sibling's value: it shares this prefix and
 * only swaps the final label. Works for absolute paths (the leading delimiter
 * stays in the prefix) and relative ones alike.
 *
 * @example
 * segmentPrefix({ label: 'src', value: '/src' })       // '/'
 * segmentPrefix({ label: 'b', value: 'a/b' })           // 'a/'
 * segmentPrefix({ label: 'src', value: 'src' })         // ''
 *
 * @remarks
 * Assumes `value` ends with `label` — always true for parsed paths and for
 * cumulative array values. If a consumer supplies a structured segment whose
 * `value` is unrelated to its `label`, the derived prefix is meaningless; in
 * that case provide explicit `value`s on that segment's siblings too so they
 * don't fall back to this prefix.
 */
export function segmentPrefix(segment: ResolvedPathSegment): string {
  return segment.value.slice(0, segment.value.length - segment.label.length);
}

/**
 * Parse a raw string path into resolved segments. Each segment carries the
 * cumulative `value` (the path up to and including it).
 *
 * Normalization rules:
 * - A leading delimiter marks the path absolute; resolved values keep it.
 * - Trailing delimiters and doubled delimiters collapse (empty parts dropped).
 * - An empty string (or a string of only delimiters) yields `[]`.
 *
 * Windows-style `\` separators are out of scope for v1 — pass
 * `delimiter="\\"` explicitly if a consumer needs them.
 */
export function parsePath(
  path: string,
  delimiter: string = DEFAULT_DELIMITER
): ResolvedPathSegment[] {
  const labels = splitLabels(path, delimiter);
  const absolute = isAbsolute(path, delimiter);
  return labels.map((label, index) => ({
    label,
    value: joinPath(labels, index, delimiter, absolute),
  }));
}

/**
 * Normalize the public path input (a delimited string, or an array of strings
 * / `PathSegment` objects) into resolved segments with a guaranteed `value`.
 *
 * - String input is delegated to {@link parsePath}.
 * - Array entries that already provide a `value` keep it; otherwise the
 *   cumulative path is computed from the labels (relative — array input
 *   carries no leading-delimiter information).
 * - Per-segment `icon` is preserved.
 */
export function normalizePath(
  input: PathInput,
  delimiter: string = DEFAULT_DELIMITER
): ResolvedPathSegment[] {
  if (typeof input === 'string') {
    return parsePath(input, delimiter);
  }

  const labels = input.map(entry =>
    typeof entry === 'string' ? entry : entry.label
  );

  return input.map((entry, index) => {
    const segment: PathSegment =
      typeof entry === 'string' ? { label: entry } : entry;
    return {
      ...segment,
      value: segment.value ?? joinPath(labels, index, delimiter),
    };
  });
}

/**
 * Resolve a `getSiblings` result into segments with concrete navigation
 * values. A sibling lives in the same parent as `anchor`, so it inherits that
 * segment's prefix (see {@link segmentPrefix}) and only swaps the trailing
 * label. Entries that already carry an explicit `value` keep it.
 *
 * @param anchor  The resolved segment the siblings sit beside.
 * @param entries Raw sibling entries — plain labels or structured segments.
 */
export function resolveSiblings(
  anchor: ResolvedPathSegment,
  entries: ReadonlyArray<string | PathSegment>
): ResolvedPathSegment[] {
  const prefix = segmentPrefix(anchor);
  return entries.map(entry => {
    const segment: PathSegment =
      typeof entry === 'string' ? { label: entry } : entry;
    return {
      ...segment,
      value: segment.value ?? prefix + segment.label,
    };
  });
}
