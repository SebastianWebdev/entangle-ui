import type { LogEntry, ResolvedLogEntry } from './LogView.types';

/** A run of text, flagged as a search match or not. */
export interface HighlightSegment {
  text: string;
  match: boolean;
}

/**
 * Split `text` into alternating non-match / match segments for `query`.
 *
 * Pure and allocation-light: an empty (or whitespace-only) query returns a
 * single non-match segment so callers can render uniformly. Matching is
 * case-insensitive unless `caseSensitive` is set. All occurrences are marked.
 *
 * @example
 * getHighlightSegments('abcABC', 'bc')
 * // → [{text:'a',match:false},{text:'bc',match:true},
 * //    {text:'A',match:false},{text:'BC',match:true}]
 */
export function getHighlightSegments(
  text: string,
  query: string,
  caseSensitive = false
): HighlightSegment[] {
  const needle = query.trim();
  if (needle === '' || text === '') {
    return [{ text, match: false }];
  }

  const haystack = caseSensitive ? text : text.toLowerCase();
  const term = caseSensitive ? needle : needle.toLowerCase();

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  let found = haystack.indexOf(term, cursor);

  if (found === -1) {
    return [{ text, match: false }];
  }

  while (found !== -1) {
    if (found > cursor) {
      segments.push({ text: text.slice(cursor, found), match: false });
    }
    segments.push({
      text: text.slice(found, found + term.length),
      match: true,
    });
    cursor = found + term.length;
    found = haystack.indexOf(term, cursor);
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false });
  }

  return segments;
}

/** Pad a number to two digits. */
function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Pad a number to three digits. */
function pad3(value: number): string {
  if (value < 10) return `00${value}`;
  if (value < 100) return `0${value}`;
  return String(value);
}

/**
 * Default timestamp formatter: `HH:mm:ss.SSS` in local time. Accepts epoch
 * milliseconds or a `Date`.
 */
export function defaultFormatTimestamp(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(
    date.getSeconds()
  )}.${pad3(date.getMilliseconds())}`;
}

/**
 * True when the entry matches the search query. Searches the message and the
 * optional source tag. An empty query always matches.
 */
export function entryMatchesQuery(
  entry: Pick<LogEntry, 'message' | 'source'>,
  query: string,
  caseSensitive = false
): boolean {
  const needle = query.trim();
  if (needle === '') return true;
  const term = caseSensitive ? needle : needle.toLowerCase();
  const message = caseSensitive ? entry.message : entry.message.toLowerCase();
  if (message.includes(term)) return true;
  if (entry.source != null) {
    const source = caseSensitive ? entry.source : entry.source.toLowerCase();
    if (source.includes(term)) return true;
  }
  return false;
}

/**
 * Render one resolved entry to a plain-text line for copy/export. Includes the
 * timestamp and source when present, mirroring what the row shows.
 */
export function entryToText(
  entry: ResolvedLogEntry,
  options: {
    showTimestamps?: boolean;
    formatTimestamp?: (timestamp: number | Date) => string;
  } = {}
): string {
  const { showTimestamps = false, formatTimestamp = defaultFormatTimestamp } =
    options;
  const parts: string[] = [];
  if (showTimestamps && entry.timestamp != null) {
    const formatted = formatTimestamp(entry.timestamp);
    if (formatted !== '') parts.push(formatted);
  }
  parts.push(`[${String(entry.level).toUpperCase()}]`);
  if (entry.source != null && entry.source !== '') {
    parts.push(`(${entry.source})`);
  }
  parts.push(entry.message);
  return parts.join(' ');
}

/**
 * Filter resolved entries by visible levels and a text query.
 *
 * Level rule: an entry is hidden only when its level is a *known* filter level
 * (has a chip) and that level is not active. Entries with an unknown level (no
 * chip) are always visible — toggling chips never hides them.
 */
export function filterEntries(
  entries: readonly ResolvedLogEntry[],
  options: {
    query: string;
    caseSensitive?: boolean;
    knownLevels: ReadonlySet<string>;
    activeLevels: ReadonlySet<string>;
  }
): ResolvedLogEntry[] {
  const { query, caseSensitive = false, knownLevels, activeLevels } = options;
  const hasQuery = query.trim() !== '';
  return entries.filter(entry => {
    if (knownLevels.has(entry.level) && !activeLevels.has(entry.level)) {
      return false;
    }
    if (hasQuery && !entryMatchesQuery(entry, query, caseSensitive)) {
      return false;
    }
    return true;
  });
}

/** Join resolved entries into a copy/export blob. */
export function entriesToText(
  entries: readonly ResolvedLogEntry[],
  options?: {
    showTimestamps?: boolean;
    formatTimestamp?: (timestamp: number | Date) => string;
  }
): string {
  return entries.map(entry => entryToText(entry, options)).join('\n');
}
