# LogView

> Virtualized console output panel with level coloring, filtering, text search, follow-tail auto-scroll, timestamps, and copy.

A virtualized console / log output panel for editor and IDE-style apps. Renders a large, append-only stream of entries efficiently (virtualized via `@tanstack/react-virtual`), with per-level coloring, level filtering, text search with match highlighting, follow-tail auto-scroll, per-line and bulk copy, optional timestamps, and source tags. It stays smooth at tens of thousands of lines.

**Live Preview**

## Import

```tsx
import { LogView } from 'entangle-ui';
import type { LogEntry, LogLevel, LogViewHandle } from 'entangle-ui';
```

## Entry model

Each line is a `LogEntry`:

```tsx
interface LogEntry {
  id?: string; // stable key; auto-assigned if omitted
  level?: LogLevel; // 'debug' | 'info' | 'warn' | 'error' | (custom); default 'info'
  message: string;
  timestamp?: number | Date; // shown when showTimestamps is on
  source?: string; // category tag; included in text search
  meta?: Record<string, unknown>; // available to renderEntry
}
```

`id` is optional but recommended — it is used as the React/virtualization key. When omitted, LogView assigns a stable monotonic id on insert, so virtualization stays correct either way.

## Data flow: controlled vs. imperative

LogView supports two models. Pick one per instance.

**Controlled** — you own the array and pass it as `entries`. Simple, but re-renders on every change, so batch high-frequency updates yourself.

```tsx
<LogView entries={lines} showTimestamps />
```

**Uncontrolled (streaming)** — omit `entries` and push through the imperative handle. `append` / `appendMany` / `clear` are **rAF-batched** by an internal store, so a source emitting thousands of lines per second collapses to one render per frame.

```tsx
const ref = useRef<LogViewHandle>(null);
useEffect(() => {
  const id = setInterval(() => {
    ref.current?.append({
      level: 'info',
      message: 'tick',
      timestamp: Date.now(),
    });
  }, 16);
  return () => clearInterval(id);
}, []);

return <LogView ref={ref} maxEntries={5000} showTimestamps />;
```

**Streaming append (imperative handle)**

Use `maxEntries` to bound a long-running console — it keeps the most recent N entries as a ring buffer.

### Handle

`ref` exposes a `LogViewHandle`:

| Method                 | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `append(entry)`        | Append one entry (uncontrolled). rAF-batched.    |
| `appendMany(entries)`  | Append many entries (uncontrolled). rAF-batched. |
| `clear()`              | Clear all entries and fire `onClear`.            |
| `scrollToBottom()`     | Scroll to the latest line and re-attach follow.  |
| `scrollToIndex(index)` | Scroll a specific entry into view.               |
| `getEntries()`         | Snapshot of the resolved entries.                |
| `getElement()`         | The root DOM element.                            |

`append` / `appendMany` / `clear` are no-ops (with a dev warning) while `entries` is controlled.

## Filtering & search

LogView filters internally. The level chips multi-toggle visibility, and the search field matches the message and the source tag. Both `query` and `levels` are controllable (`query` / `onQueryChange`, `levels` / `onLevelsChange`) or uncontrolled. Search uses `useDeferredValue` so typing stays responsive over large lists, and matched substrings are highlighted.

**Search + level filter (600 lines, virtualized)**

## Levels

The four built-in levels — `debug`, `info`, `warn`, `error` — are themed automatically (errors and warnings carry an accent color and a left bar; info and debug stay quiet). The set is extensible: pass `levelConfig` to add or recolor levels, and `levelOrder` to control which chips appear and in what order.

```tsx
<LogView
  entries={entries}
  levelConfig={{
    trace: { label: 'Trace', color: 'var(--etui-color-accent-primary)' },
  }}
  levelOrder={['trace', 'debug', 'info', 'warn', 'error']}
/>
```

**Custom level**

## Auto-scroll (follow tail)

By default LogView sticks to the bottom as new entries arrive. Scrolling up detaches; a floating **jump to bottom** button (showing the number of new lines) re-attaches when clicked, as does scrolling back to the bottom. "At bottom" is read from live scroll metrics. `follow` is controllable via `follow` / `defaultFollow` / `onFollowChange`.

## Wrapping

Rows are single-line by default (long lines scroll horizontally), which keeps virtualization on the fast fixed-height path. Set `wrap` to soft-wrap long lines; rows then become variable-height and are measured automatically.

**Wrapped lines**

## Composition

LogView ships a default toolbar (search, level chips, copy, clear) that you can toggle with `showSearch` / `showLevelFilter` / `showCopy` / `showClear` / `showToolbar`. For full control, compose the slots yourself — `LogView.Toolbar`, `LogView.Search`, `LogView.LevelFilter`, `LogView.Copy`, `LogView.Clear`, `LogView.Body`. When you pass children, the default toolbar is replaced by your composition.

```tsx
<LogView entries={entries}>
  <LogView.Toolbar>
    <LogView.LevelFilter />
    <LogView.Search placeholder="Search output…" />
  </LogView.Toolbar>
  <LogView.Body />
</LogView>
```

**Custom composition**

## Virtualization

Virtualization auto-engages above `virtualizationThreshold` (default 100) and can be forced with `virtualized={true}` or disabled with `virtualized={false}` (useful for tests and accessibility tools). Tune `overscan` and, for fixed-height rows, `estimatedRowHeight`.

## Accessibility

- The scroll viewport is a `role="log"` region.
- Level chips are toggle buttons with `aria-pressed`.
- The per-line copy control appears on row hover and on focus.
- When `onEntryClick` is set, rows become `role="button"` and respond to Enter / Space.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `entries` | `readonly LogEntry[]` | — | Controlled entry list. When set, the consumer owns the data and the imperative append/clear methods are inert. |
| `defaultEntries` | `readonly LogEntry[]` | — | Initial entries for the uncontrolled store. |
| `maxEntries` | `number` | — | Ring-buffer cap on stored entries (oldest dropped first). Useful for long-running consoles. |
| `getEntryId` | `(entry: LogEntry, index: number) => string` | — | Override how a stable id is derived for an entry that omits `id`. |
| `query` | `string` | — | Controlled search query. |
| `defaultQuery` | `string` | — | Default search query (uncontrolled). |
| `onQueryChange` | `(query: string) => void` | — | Called when the search query changes. |
| `caseSensitive` | `boolean` | `false` | Whether search is case-sensitive. |
| `levels` | `readonly LogLevel[]` | — | Controlled set of visible levels. A level absent from this array is filtered out. |
| `defaultLevels` | `readonly LogLevel[]` | — | Default visible levels (uncontrolled). |
| `onLevelsChange` | `(levels: LogLevel[]) => void` | — | Called when the visible-level set changes. |
| `levelConfig` | `Partial>` | — | Visual definitions for levels (labels, colors, icons, order). |
| `levelOrder` | `readonly LogLevel[]` | — | Ordered list of levels to show as filter chips. Defaults to the four built-ins plus any keys in `levelConfig`. |
| `follow` | `boolean` | — | Controlled follow-tail state. |
| `defaultFollow` | `boolean` | `true` | Default follow-tail state (uncontrolled). |
| `onFollowChange` | `(follow: boolean) => void` | — | Called when follow-tail attaches/detaches. |
| `wrap` | `boolean` | `false` | Soft-wrap long lines (variable-height measured rows) vs. single-line. |
| `density` | `'comfortable' \| 'compact' \| 'dense'` | `'compact'` | Visual density. Affects fixed row height. |
| `showTimestamps` | `boolean` | `false` | Show the per-entry timestamp gutter. |
| `formatTimestamp` | `(timestamp: number \| Date) => string` | `HH:mm:ss.SSS` | Format a timestamp for display. |
| `showSource` | `boolean` | `true` | Show the per-entry source tag when present. |
| `showToolbar` | `boolean` | `true` | Render the default toolbar (ignored when `children` is provided). |
| `showSearch / showLevelFilter / showClear / showCopy` | `boolean` | `true` | Toggle individual controls in the default toolbar. |
| `virtualized` | `boolean \| 'auto'` | `'auto'` | Virtualization mode. `auto` engages above the threshold. |
| `virtualizationThreshold` | `number` | `100` | Entry count above which 'auto' engages. |
| `estimatedRowHeight` | `number` | `per density` | Estimated row height in px (fixed mode / initial wrap estimate). |
| `overscan` | `number` | `12` | Off-screen rows kept mounted. |
| `height` | `number \| string` | `320` | Body height (the scroll viewport). |
| `maxHeight` | `number \| string` | — | Maximum body height. |
| `renderEntry` | `(info: { entry, index, query }) => React.ReactNode` | — | Custom row renderer; replaces the default row body. |
| `emptyState` | `React.ReactNode` | — | Content shown when there are no entries (or none match the filter). |
| `onClear` | `() => void` | — | Fired when the log is cleared (toolbar Clear or handle.clear). |
| `onEntryClick` | `(entry: ResolvedLogEntry, index: number) => void` | — | Fired when an entry row is activated. |
| `onCopy` | `(text: string) => void` | — | Fired after a copy (per-line or copy-all) with the copied text. |
| `ref` | `React.Ref` | — | Imperative handle (append, clear, scrollToBottom, …). |
