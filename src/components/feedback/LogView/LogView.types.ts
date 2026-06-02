import type { BaseComponent } from '@/types/common';
import type { LiteralUnion, Prettify } from '@/types/utilities';
import type React from 'react';

/**
 * Built-in log levels, themed out of the box via CSS recipe variants:
 * `error` → `accent.error`, `warn` → `accent.warning`, `info` → neutral,
 * `debug` → `text.muted`.
 */
export type BuiltInLogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log level. The four {@link BuiltInLogLevel} values are themed automatically;
 * any other string is accepted as a custom level — supply a
 * {@link LogLevelDefinition} via `levelConfig` to give it a label, color, and
 * icon.
 */
export type LogLevel = LiteralUnion<BuiltInLogLevel>;

/** Visual density. Affects fixed row height and gutter padding. */
export type LogViewDensity = 'comfortable' | 'compact' | 'dense';

/** Virtualization mode. `'auto'` enables it once the entry count exceeds the threshold. */
export type LogViewVirtualizationMode = boolean | 'auto';

/**
 * Row selection mode.
 * - `false` — rows are not selectable (default).
 * - `'single'` — one row at a time.
 * - `'multiple'` — click selects, Cmd/Ctrl+click toggles, Shift+click extends a range.
 */
export type LogViewSelectionMode = false | 'single' | 'multiple';

/**
 * A single log line.
 *
 * `id` is optional but recommended for stable virtualization keys; when
 * omitted LogView assigns a stable monotonic sequence id on insert. `level`
 * defaults to `'info'`.
 */
export interface LogEntry {
  /** Stable identity used as the React/virtualization key. Auto-assigned when omitted. */
  id?: string;
  /** Severity. @default "info" */
  level?: LogLevel;
  /** The log message text. */
  message: string;
  /** Optional timestamp (epoch ms or `Date`). Rendered when `showTimestamps` is on. */
  timestamp?: number | Date;
  /** Optional source / category tag (e.g. a subsystem name). Included in text search. */
  source?: string;
  /** Arbitrary structured payload. Not rendered by default; available to `renderEntry`. */
  meta?: Record<string, unknown>;
}

/**
 * Internal, fully-resolved entry. Every entry the store holds has a guaranteed
 * string `id` and a `level`; the other fields are passed through from the
 * source {@link LogEntry}.
 */
export interface ResolvedLogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp?: number | Date;
  source?: string;
  meta?: Record<string, unknown>;
}

/** Visual definition for a level — drives the filter chip and row accent. */
export interface LogLevelDefinition {
  /** Chip / badge label. @default the capitalized level name */
  label?: string;
  /**
   * Level color. Built-in levels are themed via CSS and ignore this; custom
   * levels use it (any CSS color, including a `var(--etui-…)` reference).
   * Falls back to `text.secondary`.
   */
  color?: string;
  /** Icon component for the level. Pass `null` to render no icon. */
  icon?: React.ComponentType<{ size?: 'sm' | 'md' | 'lg' | number }> | null;
  /** Sort order of the chip in the level filter (ascending). */
  order?: number;
}

/** Map of level → visual definition. */
export type LogLevelConfig = Partial<Record<LogLevel, LogLevelDefinition>>;

/** Context passed to a custom `renderEntry` row renderer. */
export interface LogEntryRenderInfo {
  entry: ResolvedLogEntry;
  index: number;
  /** The active (deferred) search query, for custom highlighting. */
  query: string;
}

/**
 * Imperative handle exposed on the LogView `ref`.
 *
 * `append` / `appendMany` / `clear` drive the **uncontrolled** store and are
 * rAF-batched — high-frequency streaming collapses to one render per frame.
 * They are no-ops (with a dev warning) when `entries` is controlled.
 */
export interface LogViewHandle {
  /** Append a single entry (uncontrolled mode). rAF-batched. */
  append: (entry: LogEntry) => void;
  /** Append many entries (uncontrolled mode). rAF-batched. */
  appendMany: (entries: readonly LogEntry[]) => void;
  /** Clear all entries (uncontrolled mode) and fire `onClear`. */
  clear: () => void;
  /** Scroll the body to the latest entry and re-attach follow. */
  scrollToBottom: () => void;
  /** Scroll a specific entry index into view. */
  scrollToIndex: (index: number) => void;
  /** Snapshot of the currently stored (resolved) entries. */
  getEntries: () => readonly ResolvedLogEntry[];
  /** The root DOM element. */
  getElement: () => HTMLDivElement | null;
}

export interface LogViewBaseProps extends Omit<
  BaseComponent,
  'onChange' | 'onSelect' | 'onCopy' | 'ref'
> {
  ref?: React.Ref<LogViewHandle>;

  // ── Data ──
  /**
   * Controlled entry list. When provided, the consumer owns the data and the
   * imperative `append`/`clear` handle methods are inert. When omitted,
   * LogView is uncontrolled and the handle drives an internal store.
   */
  entries?: readonly LogEntry[];
  /** Initial entries for the uncontrolled store. */
  defaultEntries?: readonly LogEntry[];
  /**
   * Hard cap on stored entries (ring buffer — oldest dropped first). Useful for
   * long-running consoles. @default undefined (unbounded)
   */
  maxEntries?: number;
  /** Override how a stable id is derived for an entry that omits `id`. */
  getEntryId?: (entry: LogEntry, index: number) => string;

  // ── Filtering / search (internal, controlled-or-uncontrolled) ──
  /** Controlled search query. */
  query?: string;
  /** Default search query (uncontrolled). */
  defaultQuery?: string;
  /** Called when the search query changes. */
  onQueryChange?: (query: string) => void;
  /** Whether search is case-sensitive. @default false */
  caseSensitive?: boolean;
  /**
   * Controlled set of *visible* levels. A level absent from this array is
   * filtered out. When omitted (uncontrolled), all known levels are visible.
   */
  levels?: readonly LogLevel[];
  /** Default visible levels (uncontrolled). */
  defaultLevels?: readonly LogLevel[];
  /** Called when the visible-level set changes. */
  onLevelsChange?: (levels: LogLevel[]) => void;

  // ── Levels config ──
  /**
   * Visual definitions for levels (labels, colors, icons, order). Prefer a
   * stable reference (module constant or `useMemo`) — an inline object is
   * re-read on every render and busts the internal filter memoization.
   */
  levelConfig?: LogLevelConfig;
  /**
   * Explicit ordered list of levels to show as filter chips. Defaults to the
   * four built-ins plus any keys present in `levelConfig`, ordered by `order`.
   * Prefer a stable reference for the same reason as `levelConfig`.
   */
  levelOrder?: readonly LogLevel[];

  // ── Auto-scroll / follow ──
  /** Controlled follow-tail state. */
  follow?: boolean;
  /** Default follow-tail state (uncontrolled). @default true */
  defaultFollow?: boolean;
  /** Called when follow-tail attaches/detaches. */
  onFollowChange?: (follow: boolean) => void;

  // ── Layout ──
  /** Soft-wrap long lines (variable-height measured rows) vs. single-line. @default false */
  wrap?: boolean;
  /** Visual density. @default "compact" */
  density?: LogViewDensity;
  /** Show the per-entry timestamp gutter. @default false */
  showTimestamps?: boolean;
  /** Format a timestamp for display. @default HH:mm:ss.SSS */
  formatTimestamp?: (timestamp: number | Date) => string;
  /** Show the per-entry source tag when present. @default true */
  showSource?: boolean;

  // ── Default-composition toolbar toggles (ignored when `children` is provided) ──
  /** Render the default toolbar. @default true */
  showToolbar?: boolean;
  /** Render the search field in the default toolbar. @default true */
  showSearch?: boolean;
  /** Render the level filter chips in the default toolbar. @default true */
  showLevelFilter?: boolean;
  /** Render the clear button in the default toolbar. @default true */
  showClear?: boolean;
  /** Render the copy-all button in the default toolbar. @default true */
  showCopy?: boolean;

  // ── Virtualization ──
  /** Virtualization mode. @default "auto" */
  virtualized?: LogViewVirtualizationMode;
  /** Threshold above which `'auto'` engages. @default 100 */
  virtualizationThreshold?: number;
  /** Estimated row height in px (fixed mode / initial wrap estimate). @default per density */
  estimatedRowHeight?: number;
  /** Off-screen rows kept mounted. @default 12 */
  overscan?: number;

  // ── Selection ──
  /**
   * Row selection mode. With `'multiple'`, click selects a line, Cmd/Ctrl+click
   * toggles it, and Shift+click extends a range. Selected lines highlight and
   * can be copied (Cmd/Ctrl+C, or the toolbar copy button); Cmd/Ctrl+A selects
   * all visible, Escape clears. @default false
   */
  selectionMode?: LogViewSelectionMode;
  /** Controlled set of selected entry ids. */
  selectedIds?: readonly string[];
  /** Default selected entry ids (uncontrolled). */
  defaultSelectedIds?: readonly string[];
  /** Called when the selection changes. */
  onSelectionChange?: (selectedIds: string[]) => void;

  // ── Sizing ──
  /** Body height (the scroll viewport). @default 320 */
  height?: number | string;
  /** Maximum body height. */
  maxHeight?: number | string;

  // ── Rendering ──
  /** Custom row renderer. Receives the resolved entry; replaces the default row body. */
  renderEntry?: (info: LogEntryRenderInfo) => React.ReactNode;
  /** Content shown when there are no entries (or none match the filter). */
  emptyState?: React.ReactNode;
  /**
   * Footer content rendered in a thin bar below the body (default composition
   * only; with custom `children`, compose `LogView.Footer` instead). Use
   * `useLogViewStats()` inside it for live entry / per-level counts.
   */
  footer?: React.ReactNode;

  // ── Events ──
  /** Fired when the log is cleared (toolbar Clear or `handle.clear`). */
  onClear?: () => void;
  /** Fired when an entry row is clicked. */
  onEntryClick?: (entry: ResolvedLogEntry, index: number) => void;
  /** Fired after a copy (per-line or copy-all) with the copied text. */
  onCopy?: (text: string) => void;

  /** Children for compound composition. When omitted, the default layout renders. */
  children?: React.ReactNode;

  /** Accessible label for the log region. */
  'aria-label'?: string;
}

export type LogViewProps = Prettify<LogViewBaseProps>;

// ── Slot prop types ──

export interface LogViewToolbarProps extends BaseComponent {
  children?: React.ReactNode;
}

export interface LogViewFooterProps extends BaseComponent {
  children?: React.ReactNode;
}

export interface LogViewSearchProps extends Omit<BaseComponent, 'children'> {
  /** Placeholder text. @default "Filter logs…" */
  placeholder?: string;
  /** Input size. @default "sm" */
  size?: 'sm' | 'md' | 'lg';
}

export type LogViewLevelFilterProps = Omit<BaseComponent, 'children'>;

export interface LogViewClearProps extends Omit<
  BaseComponent<HTMLButtonElement>,
  'children'
> {
  /** Override the button content (defaults to a trash icon). */
  children?: React.ReactNode;
  /** Accessible label. @default "Clear logs" */
  'aria-label'?: string;
}

export interface LogViewCopyProps extends Omit<
  BaseComponent<HTMLButtonElement>,
  'children'
> {
  /** Override the button content (defaults to a copy icon). */
  children?: React.ReactNode;
  /** Accessible label. @default "Copy logs" */
  'aria-label'?: string;
}

export type LogViewBodyProps = Omit<BaseComponent, 'children'>;
