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

## Selection & copy

There are three ways to copy. Every row has a per-line copy button on hover, and the toolbar copy button copies everything visible (or just the selection, when there is one). Set `selectionMode="multiple"` to enable row selection:

- **Click** a line to select it.
- **Cmd/Ctrl+Click** toggles a line in or out of the selection.
- **Shift+Click** extends a range from the last selected line.
- With a row focused: **Cmd/Ctrl+A** selects all visible, **Cmd/Ctrl+C** copies the selection, **Escape** clears it.

Selection is controllable via `selectedIds` / `defaultSelectedIds` / `onSelectionChange`. Native text selection (drag + Ctrl+C) keeps working and takes precedence over row selection.

```tsx
<LogView
  entries={entries}
  selectionMode="multiple"
  onSelectionChange={setIds}
/>
```

## Footer

Pass `footer` to render a thin status bar below the body (or compose `LogView.Footer` directly). Inside it, `useLogViewStats()` returns the live `{ total, counts }` so you can show a running summary — total on the left, a per-level breakdown on the right. The streaming demo above uses exactly this.

```tsx
function Footer() {
  const { total, counts } = useLogViewStats();
  return (
    <>
      <span>Streaming · {total} entries</span>
      <span style={{ marginLeft: 'auto' }}>
        {counts.warn ?? 0} warnings · {counts.error ?? 0} errors
      </span>
    </>
  );
}

<LogView ref={ref} footer={<Footer />} />;
```

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

## Column alignment

The timestamp, level icon, and source tag render as fixed-width columns, so the message text starts at the same x on every row regardless of source length. A column is only reserved when its field is actually present — if nothing in the log has a timestamp or source there is no column at all (the message sits right after the icon); once at least one entry uses the field, every row reserves it, including the rows that omit it, so they stay aligned. The reserved widths default to `88px` (timestamp) and `52px` (source) and are tunable per instance by overriding the CSS custom properties on the root:

```tsx
<LogView
  entries={entries}
  showTimestamps
  style={{
    // widen the source column for longer subsystem tags
    ['--etui-logview-source-col-width' as string]: '8rem',
  }}
/>
```

## Wrapping

Rows are single-line by default (long lines scroll horizontally), which keeps virtualization on the fast fixed-height path. Set `wrap` to soft-wrap long lines; rows then become variable-height and are measured automatically.

**Wrapped lines**

## Composition

LogView ships a default toolbar (search, level chips, copy, clear) that you can toggle with `showSearch` / `showLevelFilter` / `showCopy` / `showClear` / `showToolbar`. For full control, compose the slots yourself — `LogView.Toolbar`, `LogView.Search`, `LogView.LevelFilter`, `LogView.Copy`, `LogView.Clear`, `LogView.Body`, `LogView.Footer`. When you pass children, the default toolbar is replaced by your composition.

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

### Tweaking the default layout with `slotProps`

When you want the batteries-included layout but need to restyle or reconfigure a single slot, reach for `slotProps` instead of rebuilding it from `children`. Each key maps to a slot of the default composition (`toolbar`, `search`, `levelFilter`, `copy`, `clear`, `body`, `footer`) and is typed as that slot's props; `className` / `style` merge with the slot's own styles. `slotProps` is ignored when you pass your own `children`.

```tsx
<LogView
  entries={entries}
  slotProps={{
    search: { placeholder: 'Filter output…', size: 'lg' },
    body: { className: 'my-dense-body', style: { fontSize: 12 } },
    clear: { 'aria-label': 'Discard log' },
    copy: { children: <ClipboardIcon /> },
  }}
/>
```

**Restyling slots with slotProps**

## Custom rendering

`renderEntry` replaces the default message body of a row while keeping the
timestamp gutter, level glyph, and source tag. Use it to render structured
lines — compose other library primitives (here `Badge`) and read your own
`entry.meta`. The row still participates in virtualization, hover, selection,
and copy.

```tsx
<LogView
  entries={requests}
  renderEntry={({ entry }) => {
    const { method, ok } = entry.meta as { method: string; ok: boolean };
    return (
      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        <Badge size="xs" variant="outline" color={ok ? 'success' : 'error'}>
          {method}
        </Badge>
        <span>{entry.message}</span>
      </span>
    );
  }}
/>
```

**Custom line rendering (renderEntry)**

## Virtualization

Virtualization auto-engages above `virtualizationThreshold` (default 100) and can be forced with `virtualized={true}` or disabled with `virtualized={false}` (useful for tests and accessibility tools). Tune `overscan` and, for fixed-height rows, `estimatedRowHeight`.

## Accessibility

- The scroll viewport is a `role="log"` region.
- Level chips are toggle buttons with `aria-pressed`.
- The per-line copy control appears on row hover and on focus.
- When rows are selectable (or `onEntryClick` is set) they become `role="button"`, are keyboard-focusable, expose `aria-pressed` for their selected state, and respond to Enter / Space and the selection shortcuts.

## Styling

LogView is themed entirely through CSS custom properties — no colors, spacings, or fonts are hard-coded. There are two layers you can override.

### Component custom properties

LogView-specific properties (each with a built-in fallback) that you set on the root, or any ancestor, to tune its layout:

| Custom property                      | Default | Controls                                 |
| ------------------------------------ | ------- | ---------------------------------------- |
| `--etui-logview-timestamp-col-width` | `88px`  | Reserved width of the timestamp column.  |
| `--etui-logview-source-col-width`    | `52px`  | Reserved width of the source-tag column. |

```tsx
<LogView
  entries={entries}
  showTimestamps
  // e.g. widen the source column for longer subsystem tags (default 52px)
  style={{ ['--etui-logview-source-col-width' as string]: '7rem' }}
/>
```

### Theme tokens consumed

Everything else reads from the `--etui-*` theme contract. Override these on any ancestor to re-skin LogView (or use `createCustomTheme(...)` from the public API for a whole-app palette). The complete set LogView reads:

| Token                                                                              | Used for                                                               |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `--etui-color-bg-primary`                                                          | Root and body background.                                              |
| `--etui-color-surface-default`                                                     | Toolbar and footer background.                                         |
| `--etui-color-surface-hover`                                                       | Row and level-chip hover background.                                   |
| `--etui-color-border-default`                                                      | Root border, toolbar/footer separators, chip borders, scrollbar thumb. |
| `--etui-color-border-focus`                                                        | Level-chip focus ring.                                                 |
| `--etui-color-text-primary`                                                        | Row message text.                                                      |
| `--etui-color-text-secondary`                                                      | `info` level and footer text.                                          |
| `--etui-color-text-muted`                                                          | `debug` level, timestamps, empty state.                                |
| `--etui-color-accent-error`                                                        | `error` level — text, left bar, row tint.                              |
| `--etui-color-accent-warning`                                                      | `warn` level and the search-match highlight.                           |
| `--etui-color-accent-primary`                                                      | Selected-row tint and the "new lines" badge/count.                     |
| `--etui-radius-sm`, `--etui-radius-md`, `--etui-radius-lg`                         | Match highlight; root + chips + jump button; level dot.                |
| `--etui-shadow-md`                                                                 | Jump-to-bottom button elevation.                                       |
| `--etui-spacing-xs`, `--etui-spacing-sm`, `--etui-spacing-md`, `--etui-spacing-xl` | Gutters, gaps, and padding throughout.                                 |
| `--etui-font-family-sans`                                                          | Toolbar / chips / footer chrome.                                       |
| `--etui-font-family-mono`                                                          | The log rows.                                                          |
| `--etui-font-size-xs`, `--etui-font-size-sm`, `--etui-font-size-md`                | Density-scaled row and chrome text.                                    |
| `--etui-font-weight-semibold`                                                      | The "new lines" count.                                                 |
| `--etui-line-height-tight`                                                         | Level chips.                                                           |
| `--etui-transition-fast`                                                           | Hover and show/hide transitions.                                       |
| `--etui-z-base`                                                                    | Jump-to-bottom stacking context.                                       |

**Re-skinned via token overrides**

## Internationalization

Every built-in string LogView renders is overridable through the `labels` prop — a `Partial<LogViewLabels>`, so anything you omit keeps its English default. The new-line counter is a function, so locales can handle pluralization and word order. Explicit per-slot props (a slot's `aria-label`, the search `placeholder`, `emptyState`, the root `aria-label`) still take precedence over `labels`.

**Localized labels (Polish)**

```tsx
<LogView
  entries={entries}
  labels={{
    searchPlaceholder: 'Filtruj logi…',
    levelFilterLabel: 'Filtruj po poziomie',
    clearLabel: 'Wyczyść',
    copyLineLabel: 'Kopiuj linię',
    jumpToBottomLabel: 'Przewiń na dół',
    newLinesLabel: n => `${n} ${n === 1 ? 'nowa' : 'nowych'}`,
    emptyLabel: 'Brak wpisów',
  }}
/>
```

The full key list is the `LogViewLabels` type; the English defaults are exported as `DEFAULT_LOG_VIEW_LABELS` (spread and tweak it when you only need to change a couple).

| Key                 | Type                        | Default               |
| ------------------- | --------------------------- | --------------------- |
| `regionLabel`       | `string`                    | `"Log output"`        |
| `searchPlaceholder` | `string`                    | `"Filter logs…"`      |
| `searchLabel`       | `string`                    | `"Filter logs"`       |
| `levelFilterLabel`  | `string`                    | `"Filter by level"`   |
| `clearLabel`        | `string`                    | `"Clear logs"`        |
| `copyLabel`         | `string`                    | `"Copy logs"`         |
| `copyLineLabel`     | `string`                    | `"Copy line"`         |
| `jumpToBottomLabel` | `string`                    | `"Jump to bottom"`    |
| `newLinesLabel`     | `(count: number) => string` | `` n => `${n} new` `` |
| `emptyLabel`        | `string`                    | `"No log entries"`    |

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
| `selectionMode` | `false \| 'single' \| 'multiple'` | `false` | Row selection. `multiple` enables click / Cmd+click / Shift+click selection, with Cmd+A / Cmd+C / Escape on a focused row. |
| `selectedIds` | `readonly string[]` | — | Controlled set of selected entry ids. |
| `defaultSelectedIds` | `readonly string[]` | — | Default selected entry ids (uncontrolled). |
| `onSelectionChange` | `(selectedIds: string[]) => void` | — | Called when the selection changes. |
| `height` | `number \| string` | `320` | Body height (the scroll viewport). |
| `maxHeight` | `number \| string` | — | Maximum body height. |
| `renderEntry` | `(info: { entry, index, query }) => React.ReactNode` | — | Custom row renderer; replaces the default row body. |
| `emptyState` | `React.ReactNode` | — | Content shown when there are no entries (or none match the filter). |
| `footer` | `React.ReactNode` | — | Footer content rendered in a thin bar below the body (default composition). Use useLogViewStats() inside it for live counts. |
| `slotProps` | `LogViewSlotProps` | — | Per-slot props for the default composition (toolbar, search, levelFilter, copy, clear, body, footer). className/style merge with each slot’s styles; ignored when you pass your own children. Full breakdown in the slotProps reference below. |
| `labels` | `Partial` | — | Override built-in UI strings for i18n (search placeholder/label, level-filter label, clear/copy/copy-line labels, jump-to-bottom, new-line counter, empty state, region label). Omitted keys keep their English default. See Internationalization. |
| `onClear` | `() => void` | — | Fired when the log is cleared (toolbar Clear or handle.clear). |
| `onEntryClick` | `(entry: ResolvedLogEntry, index: number) => void` | — | Fired when an entry row is activated. |
| `onCopy` | `(text: string) => void` | — | Fired after a copy (per-line or copy-all) with the copied text. |
| `ref` | `React.Ref` | — | Imperative handle (append, clear, scrollToBottom, …). |

### `slotProps` reference

`slotProps` is an object keyed by slot. Each value is typed as that slot's own props, so everything below is fully type-checked. **Every slot** also accepts the shared `BaseComponent` props — `className`, `style`, `id`, `testId`, `ref` — where `className` and `style` are **merged** with the slot's built-in styles (additive, never replacing). The whole object is ignored when you provide your own `children`.

| Slot key      | Props type                             | Slot-specific props (beyond the shared base)                                                                                       |
| ------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `toolbar`     | `Omit<LogViewToolbarProps,'children'>` | — (its children are the default search / filter / action buttons)                                                                  |
| `search`      | `LogViewSearchProps`                   | `placeholder?: string` (default `"Filter logs…"`), `size?: 'sm' \| 'md' \| 'lg'` (default `"md"`)                                  |
| `levelFilter` | `LogViewLevelFilterProps`              | —                                                                                                                                  |
| `copy`        | `LogViewCopyProps`                     | `children?: React.ReactNode` (replace the icon), `aria-label?: string` (default `"Copy logs"`); `ref` is `Ref<HTMLButtonElement>`  |
| `clear`       | `LogViewClearProps`                    | `children?: React.ReactNode` (replace the icon), `aria-label?: string` (default `"Clear logs"`); `ref` is `Ref<HTMLButtonElement>` |
| `body`        | `LogViewBodyProps`                     | —                                                                                                                                  |
| `footer`      | `Omit<LogViewFooterProps,'children'>`  | — (its content comes from the `footer` prop)                                                                                       |

**Shared base props on every slot:** `className?: string` · `style?: React.CSSProperties` · `id?: string` · `testId?: string` · `ref?: React.Ref<…>` — a `<div>` for `toolbar` / `search` / `levelFilter` / `body` / `footer`, a `<button>` for `copy` / `clear`.

To reorder, add, or remove slots, compose them as `children` instead. The timestamp / source **column widths** are separate, overridable CSS custom properties — see [Column alignment](#column-alignment).
