# AssetBrowser — Component Specification & Agent Brief

> **Status:** Planning (signed off). Implementation not started.
> **Roadmap slot:** Stage 1, flagship component #5 (`pre-1.0-roadmap.md`).
> **Branch:** `claude/etui-assetbrowser-OBs1N` (embeds the agreed
> `etui-assetbrowser` name). One branch, one PR.
> **PR base:** `main` (the pre-1.0 line lands flagship PRs directly on `main`).
> **Changeset:** `minor` (new flagship component + new public hooks). **Never
> `major`** on this line.
> **Category:** `src/components/data/` (sits next to `DataTable`).
>
> This document is the source of truth for the AssetBrowser. The API below is
> signed off — agents implement it, they do not redesign it. If an agent
> believes a decision here is wrong, it raises the question in the PR **before**
> changing the contract.

---

## 1. What AssetBrowser is

A flagship composite surface for browsing and managing a collection of
**assets** (textures, models, materials, audio, scenes, arbitrary files) and
the **folders** that contain them. It is the "content browser" of a
professional editor — the reference points are the Unreal Engine Content
Browser, the Unity Project window, the Godot FileSystem dock, and the Figma
assets panel.

It does **not** own a filesystem. It is a **controlled, presentational**
component: the consumer owns the data source (local FS, S3, an in-memory
catalog, a database) and feeds AssetBrowser the contents of the _current
folder_ plus a _folder tree_ for the sidebar. AssetBrowser renders them, owns
view/selection/interaction state, and reports user intent through callbacks.

### When to reach for it

- A panel that lists files/assets with thumbnails and lets the user navigate
  folders, search, filter, sort, select, and drag things around.

### When not to

- A pure hierarchical tree with no asset grid → use `TreeView`.
- A flat data grid of structured rows with no folder/thumbnail concept → use
  `DataTable` directly.
- A single file-drop upload zone → use `FileUploader`.

---

## 2. Signed-off decisions (the four forks)

| #   | Decision                | Choice                         | Consequence                                                                                                                                                                                                                              |
| --- | ----------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Data & navigation model | **Controlled, current-folder** | Consumer passes the current folder's `items` + `path` + a separate `folderTree` for the sidebar, and handles `onNavigate`. Lazy loading and any backend work out of the box.                                                             |
| 2   | API surface style       | **Props + render-slots**       | One `<AssetBrowser>` with data/callback props; render props for thumbnail / item / context menu / empty; two optional compound slots (`AssetBrowser.Toolbar`, `AssetBrowser.Sidebar`) for full overrides.                                |
| 3   | Drag & drop (v1)        | **Move + import**              | Internal drag of items onto folders (move/reorder) + external OS-file drop (import), both via callbacks; items are also draggable out with a configurable `dataTransfer` payload. The actual move/import mutation is the consumer's job. |
| 4   | Grid virtualization     | **Custom windowed grid**       | A purpose-built windowed renderer keeps thousands of thumbnails smooth. List view reuses `DataTable`'s virtualization.                                                                                                                   |

---

## 3. Composition map (reuse, do not reinvent)

AssetBrowser is assembled from components that already exist. **Do not
reimplement any of these.** Compose them.

| Concern                         | Existing building block                                                                                                       | Import                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| List view                       | `DataTable`                                                                                                                   | `@/components/data/DataTable`                     |
| Grid cell                       | `Card` + `Card.Media` / `Card.Body`                                                                                           | `@/components/layout/Card`                        |
| Folder sidebar                  | `TreeView` (`TreeNodeData`)                                                                                                   | `@/components/controls/TreeView`                  |
| Path bar                        | `Breadcrumbs` + `Breadcrumbs.Item`                                                                                            | `@/components/navigation/Breadcrumbs`             |
| View toggle (grid/list)         | `SegmentedControl` + `SegmentedControlItem`                                                                                   | `@/components/navigation/SegmentedControl`        |
| Toolbar chrome                  | `Toolbar` (`.Button` / `.Toggle` / `.Separator` / `.Group`)                                                                   | `@/components/shell/Toolbar`                      |
| Search field                    | `Input` (`type="search"`, `startIcon`)                                                                                        | `@/components/primitives/Input`                   |
| Sort / filter menus             | `Menu` (`.Trigger` / `.Content` / `.RadioGroup` / `.CheckboxItem`)                                                            | `@/components/navigation/Menu`                    |
| Item context menu               | `ContextMenu` + `Menu.*` items                                                                                                | `@/components/navigation/ContextMenu`             |
| Scroll containers               | `ScrollArea`                                                                                                                  | `@/components/layout/ScrollArea`                  |
| Canvas thumbnails (3D previews) | `CanvasContainer` + `useCanvasSetup` + `useCanvasRenderer`                                                                    | `@/components/primitives/canvas`                  |
| Loading placeholders            | `Skeleton`                                                                                                                    | `@/components/feedback/Skeleton`                  |
| Empty view                      | `EmptyState`                                                                                                                  | `@/components/feedback/EmptyState`                |
| Icons                           | `Icon`, `IconButton`, `FolderIcon`, `FolderOpenIcon`, `GridIcon`, `ListIcon`, `SearchIcon`, `FileTextIcon`, sort/filter icons | `@/components/primitives/*`, `@/components/Icons` |

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Toolbar:  [≡ grid|list]  [🔎 search……]   [sort ▾] [filter ▾] [⤓] │  ← AssetBrowser.Toolbar (slot)
├───────────────┬────────────────────────────────────────────────────┤
│ Breadcrumbs:  │  Assets ▸ Textures ▸ Wood                            │  ← path bar
│ Sidebar       ├────────────────────────────────────────────────────┤
│ (TreeView)    │                                                      │
│  ▸ Assets     │     ┌────┐ ┌────┐ ┌────┐ ┌────┐                      │
│   ▸ Textures  │     │ 🖼 │ │ 🖼 │ │ 🖼 │ │ 📁 │   ← grid (windowed)  │
│   ▸ Models    │     └────┘ └────┘ └────┘ └────┘                      │
│   ▸ Audio     │      wood   stone  metal  Subfolder                  │
│               │                                                      │
│  (slot:       │     …or DataTable rows in list view…                 │
│ AssetBrowser. │                                                      │
│  Sidebar)     │                                                      │
├───────────────┴────────────────────────────────────────────────────┤
│ Footer (optional): "128 items · 3 selected"  + thumbnail-size slider │
└──────────────────────────────────────────────────────────────────┘
```

Sidebar is optional (controlled by presence of `folderTree` or a `Sidebar`
slot). Footer status line is opt-in via `showStatusBar`.

---

## 4. Data model & public types

All types live in `AssetBrowser.types.ts`. Exported types are wrapped in
`Prettify<…>` per the type-utility convention. `LiteralUnion` is used where a
value is consumer-extensible (e.g. `assetType`).

```ts
import type { ReactNode, Ref, DragEvent } from 'react';
import type { Prettify, LiteralUnion } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import type { TreeNodeData } from '@/components/controls/TreeView';
import type {
  DataTableColumn,
  DataTableDensity,
} from '@/components/data/DataTable';

/** Whether an entry is a file/asset or a navigable folder. */
export type AssetKind = 'file' | 'folder';

/** Well-known asset types (extensible — consumers add their own strings). */
export type AssetType = LiteralUnion<
  | 'image'
  | 'model'
  | 'material'
  | 'audio'
  | 'video'
  | 'text'
  | 'scene'
  | 'unknown',
  string
>;

/** A single entry shown in the current folder (file OR sub-folder). */
export interface AssetItem {
  /** Stable unique id within the browser. */
  id: string;
  /** Display name. */
  name: string;
  /** Drives navigation vs. open behaviour. */
  kind: AssetKind;
  /** Consumer-defined category; drives the fallback icon and the type filter. */
  assetType?: AssetType;
  /** Image thumbnail URL for grid view. Ignored when `renderThumbnail` returns a node. */
  thumbnailUrl?: string;
  /** Explicit icon override (used for files without a thumbnail, and folders). */
  icon?: ReactNode;
  /** Size in bytes — feeds the list "Size" column and size sort. */
  size?: number;
  /** Last-modified timestamp — feeds the list "Modified" column and date sort. */
  modifiedAt?: number | Date;
  /** Arbitrary consumer payload (dimensions, tags, GUID, …). */
  meta?: Record<string, unknown>;
  /** Default `true`. When `false`, the item cannot be selected. */
  selectable?: boolean;
  /** Default `true`. When `false`, the item cannot be dragged. */
  draggable?: boolean;
  /** Default: `true` for folders, `false` for files. Can items be dropped onto it? */
  droppable?: boolean;
  /** Dim + non-interactive. */
  disabled?: boolean;
}

/** One hop in the current location, oldest → newest. Drives the breadcrumb bar. */
export interface AssetPathSegment {
  id: string;
  name: string;
}

export type AssetView = 'grid' | 'list';

export type AssetSortField = LiteralUnion<
  'name' | 'type' | 'size' | 'modified',
  string
>;

export interface AssetSortState {
  field: AssetSortField;
  direction: 'asc' | 'desc';
}

/** Active filters. `types: []` or `undefined` means "no type filter". */
export interface AssetFilterState {
  types?: AssetType[];
}

export type AssetThumbnailSize = 'sm' | 'md' | 'lg' | number;

/** Why a selection / navigation change fired — useful for analytics & undo. */
export type AssetSelectionReason =
  | 'click'
  | 'keyboard'
  | 'marquee'
  | 'selectAll'
  | 'clear'
  | 'contextMenu';

export type AssetNavigationSource =
  | 'breadcrumb'
  | 'sidebar'
  | 'open'
  | 'back'
  | 'forward';

/** Per-item state handed to render props. */
export interface AssetItemState {
  selected: boolean;
  focused: boolean;
  index: number; // index within the displayed (filtered+sorted) list
  view: AssetView;
  dropTarget: boolean; // a drag is currently hovering this item
}
```

### The `AssetItem` contract is intentionally flat

The consumer always passes the **current folder's** direct children. Entering a
folder is a navigation event the consumer responds to by swapping `items`.
AssetBrowser never walks a tree to find children. The only hierarchical input
is `folderTree` (sidebar), which reuses `TreeView`'s `TreeNodeData` verbatim so
the sidebar is literally a `TreeView`.

---

## 5. Public API — `AssetBrowserProps`

```ts
export interface AssetBrowserBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'ref' | 'onChange'
> {
  ref?: Ref<AssetBrowserHandle>;

  // ── Data ──────────────────────────────────────────────────────────────
  /** Direct children of the current folder (files + sub-folders). */
  items: readonly AssetItem[];
  /** Current location, oldest → newest. Drives the breadcrumb bar. */
  path?: readonly AssetPathSegment[];
  /** Folder hierarchy for the sidebar. Reuses TreeView's node shape. Omit to hide the sidebar. */
  folderTree?: readonly TreeNodeData[];
  /** Id of the folder currently shown (matches the last `path` segment). Highlights the sidebar. */
  currentFolderId?: string;

  // ── View ──────────────────────────────────────────────────────────────
  view?: AssetView; // controlled
  defaultView?: AssetView; // default 'grid'
  onViewChange?: (view: AssetView) => void;
  thumbnailSize?: AssetThumbnailSize; // controlled
  defaultThumbnailSize?: AssetThumbnailSize; // default 'md'
  onThumbnailSizeChange?: (size: AssetThumbnailSize) => void;
  /** List-view row density (passthrough to DataTable). Default 'comfortable'. */
  density?: DataTableDensity;
  /** Show the "N items · M selected" footer + thumbnail-size control. Default false. */
  showStatusBar?: boolean;

  // ── Selection ─────────────────────────────────────────────────────────
  selectionMode?: 'single' | 'multiple' | false; // default 'multiple'
  selection?: readonly string[]; // controlled selected ids
  defaultSelection?: readonly string[];
  onSelectionChange?: (
    ids: string[],
    meta: { reason: AssetSelectionReason }
  ) => void;
  /** Enable rubber-band marquee selection in grid empty space. Default true for 'multiple'. */
  marquee?: boolean;

  // ── Search / filter / sort ──────────────────────────────────────────────
  search?: string; // controlled
  defaultSearch?: string;
  onSearchChange?: (query: string) => void;
  /** When true, the consumer pre-filters `items` and AssetBrowser does not filter by name. Default false. */
  manualSearch?: boolean;
  filters?: AssetFilterState; // controlled
  defaultFilters?: AssetFilterState;
  onFiltersChange?: (filters: AssetFilterState) => void;
  manualFilter?: boolean; // default false
  /** Type values offered in the filter menu. Defaults to the distinct `assetType`s present in `items`. */
  filterableTypes?: AssetType[];
  sort?: AssetSortState; // controlled
  defaultSort?: AssetSortState; // default { field: 'name', direction: 'asc' }
  onSortChange?: (sort: AssetSortState) => void;
  manualSort?: boolean; // default false

  // ── Navigation ───────────────────────────────────────────────────────────
  /** Fires when the user enters a folder (open / breadcrumb / sidebar / history). */
  onNavigate?: (folderId: string, source: AssetNavigationSource) => void;
  /** Fires when a FILE is activated (double-click / Enter). Folders go through onNavigate. */
  onItemOpen?: (item: AssetItem) => void;
  /** Enable Back/Forward + Backspace-to-parent. AssetBrowser keeps the history stack. Default false. */
  history?: boolean;

  // ── List columns ─────────────────────────────────────────────────────────
  /** Override the default list columns. When omitted, a name/type/size/modified set is used. */
  columns?: readonly DataTableColumn<AssetItem>[];

  // ── Drag & drop ──────────────────────────────────────────────────────────
  /** Internal move: items dropped onto a folder. Presence enables internal DnD. */
  onItemsMove?: (payload: {
    itemIds: string[];
    targetFolderId: string;
  }) => void;
  /** External import: OS files dropped onto the surface (or a folder). Presence enables external drop. */
  onFilesImport?: (payload: {
    files: File[];
    targetFolderId: string | null;
  }) => void;
  /** MIME type used when dragging items out. Default 'application/x-entangle-asset'. */
  dragOutMimeType?: string;
  /** Override the drag-out dataTransfer payload. Default: JSON array of ids under `dragOutMimeType`. */
  getDragData?: (items: AssetItem[]) => Record<string, string>;
  onItemDragStart?: (items: AssetItem[], event: DragEvent) => void;
  onItemDragEnd?: (items: AssetItem[], event: DragEvent) => void;

  // ── States ───────────────────────────────────────────────────────────────
  loading?: boolean; // default false → renders Skeleton grid/rows
  loadingItemCount?: number; // default 12
  emptyState?: ReactNode; // overrides the default EmptyState

  // ── Render props (escape hatches) ─────────────────────────────────────────
  /** Custom thumbnail (e.g. canvas 3D preview). Falls back to thumbnailUrl → icon → type icon. */
  renderThumbnail?: (
    item: AssetItem,
    ctx: { size: number; selected: boolean }
  ) => ReactNode;
  /** Fully replace a grid cell's inner content (advanced). */
  renderItem?: (item: AssetItem, state: AssetItemState) => ReactNode;
  /** Returns the body of the item context menu (Menu.* children). Receives the selected items. */
  renderItemContextMenu?: (items: AssetItem[]) => ReactNode;
  /** Returns the body of the empty-area context menu. */
  renderEmptyContextMenu?: () => ReactNode;

  // ── Virtualization (grid) ─────────────────────────────────────────────────
  virtualized?: boolean | 'auto'; // default 'auto'
  virtualizationThreshold?: number; // default 200
  overscanRows?: number; // default 4

  // ── A11y ──────────────────────────────────────────────────────────────────
  'aria-label'?: string; // default 'Asset browser'

  children?: ReactNode; // compound slots only (Toolbar / Sidebar)
}

export type AssetBrowserProps = Prettify<AssetBrowserBaseProps>;
```

### Controlled / uncontrolled

Every stateful axis (`view`, `thumbnailSize`, `selection`, `search`, `filters`,
`sort`) is **controlled-or-uncontrolled** via `useControlledState`. Pass the
`value` prop to control it, or the `default*` prop to let AssetBrowser own it.
Never mirror a prop into local state with a `useEffect`.

### Manual vs. internal data shaping

When `manualSearch` / `manualFilter` / `manualSort` are `false` (default),
AssetBrowser computes the **displayed list** itself:

```
displayed = sort(filterByType(filterByName(items, search), filters.types), sort)
```

Folders always sort **before** files within a direction (Finder/Unreal
behaviour), then by the chosen field. This derivation lives in
`assetBrowserFilter.ts` (pure, unit-tested) and is consumed via `useMemo` —
**not** a `useEffect`. When a `manual*` flag is `true`, AssetBrowser trusts
`items` as already shaped for that axis and only emits the corresponding
`on*Change` event.

### Imperative handle

```ts
export interface AssetBrowserHandle {
  focus(): void;
  getElement(): HTMLDivElement | null;
  selectAll(): void;
  clearSelection(): void;
  scrollToItem(id: string): void;
  getSelectedItems(): AssetItem[];
}
```

Routed through `useImperativeHandle` (pattern #5). `ref` is the handle, **not**
the DOM node — hence the `Omit<…, 'ref'>` on the base props.

### Compound slots

Only two, both optional, both detected via **Symbol slot markers** (pattern #6,
never `displayName`):

```tsx
<AssetBrowser items={items} folderTree={tree} onNavigate={go}>
  <AssetBrowser.Toolbar>
    {/* custom toolbar; replaces the default */}
  </AssetBrowser.Toolbar>
  <AssetBrowser.Sidebar>
    {/* custom sidebar; replaces the default TreeView */}
  </AssetBrowser.Sidebar>
</AssetBrowser>
```

Slot markers live in `slots.ts`:

```ts
export const ASSET_BROWSER_SLOT: unique symbol = Symbol.for(
  'etui.assetBrowser.slot'
);
export type AssetBrowserSlotKind = 'toolbar' | 'sidebar';
```

When no `Toolbar` slot is given, the default toolbar renders (view toggle +
search + sort menu + filter menu + optional import button). When no `Sidebar`
slot is given and `folderTree` is present, a default `TreeView` sidebar
renders.

---

## 6. State architecture

Per `component-patterns.md` §4, split state by update frequency.

### Store (`AssetBrowserStore`) — hot path, `useSyncExternalStore`

A per-instance class store with slice subscriptions and `shallowEqual` no-op
guards. Holds everything that updates faster than a click:

- **selection** — the source of truth for rendering. The controlled
  `selection` prop mirrors **into** the store via `useLayoutEffect`; commits
  emit `onSelectionChange`.
- **focusedId / focusedIndex** — roving focus for keyboard nav.
- **marquee** — `{ active, rect }`, updated at pointer-move rate.
- **drag** — `{ active, draggingIds, dropTargetId }`, updated during DnD.
- **hover** — hovered item id (drives drop-target affordances).

Slice hooks: `useAssetSelection()`, `useAssetFocus()`, `useAssetMarquee()`,
`useAssetDrag()`. Each subscribes only to its slice so a marquee drag does not
re-render the toolbar.

### Controlled state + context — low frequency

`view`, `thumbnailSize`, `search`, `filters`, `sort`, `density` change on
discrete user actions. They live in `useControlledState` and ride a context
value. They do **not** belong in the hot store.

**Reference implementations to copy:**
`src/components/primitives/viewport/ViewportStore.ts`,
`ViewportContext.ts`, `Viewport.tsx`.

---

## 7. View modes

### Grid view (windowed)

- Cells are `Card` (`variant="outlined"`, `selected`, `onClick`) with
  `Card.Media` (thumbnail) + a label row. The cell content can be replaced via
  `renderItem`; the thumbnail alone via `renderThumbnail`.
- Cell width derives from `thumbnailSize` (`sm` / `md` / `lg` map to token-based
  px; a `number` is raw px). Cells are uniform; the grid is `auto-fill`.
- **Windowing (custom):** measure the scroll container width with
  `useResizeObserver`; compute `columns = floor((width − padding) / (cellW + gap))`,
  `rowHeight = cellH + gap`, `totalRows = ceil(count / columns)`. Render only
  rows in `[scrollTop/rowHeight − overscan, … + visibleRows + overscan]`,
  offset by a top spacer (translateY / padding-top) inside a tall scroller so
  the native scrollbar stays correct. Logic lives in
  `useAssetGridVirtualizer.ts` (pure math + a tiny scroll subscription).
- **Threshold:** `virtualized: 'auto'` engages windowing above
  `virtualizationThreshold` (default 200) items; `true`/`false` force it.
- **Thumbnails:** resolution order is `renderThumbnail` → `thumbnailUrl`
  (lazy-loaded `<img loading="lazy">`, gated by `useIntersectionObserver` so
  off-screen images never request) → `item.icon` → a type-derived fallback
  icon. Canvas-based 3D previews are a `renderThumbnail` returning a
  `CanvasContainer` driven by `useCanvasSetup` + `useCanvasRenderer` (canvas
  template, pattern #7).

### List view

- A thin wrapper over `DataTable<AssetItem>`. Default columns:
  1. **Name** — small thumbnail/icon + name (sortable, sticky-left).
  2. **Type** — `assetType` (sortable).
  3. **Size** — humanized bytes (sortable, right-aligned).
  4. **Modified** — relative/absolute date (sortable, right-aligned).
- `columns` prop overrides the defaults wholesale.
- **Bridges to DataTable:**
  - `selectionMode` → DataTable `selectionMode`; selection ids round-trip
    through the same store, so switching grid↔list preserves selection.
  - `sort` (`AssetSortState`) ↔ DataTable `DataTableSortState`
    (`{ columnId, direction }`). Map field↔columnId both ways.
  - `density`, `loading`, `loadingRowCount`, `virtualized`,
    `virtualizationThreshold`, `emptyState` pass straight through.
  - `onRowActivate` → folder ⇒ `onNavigate('open')`, file ⇒ `onItemOpen`.
- **Do not** re-implement table sorting/selection/virtualization — DataTable
  already does it. AssetBrowser only translates its vocabulary.

---

## 8. Selection model

Lives in `useAssetSelection.ts`, writing through the store.

| Gesture                    | Result                                                                       |
| -------------------------- | ---------------------------------------------------------------------------- |
| Click item                 | Replace selection with that item.                                            |
| Ctrl/Cmd + click           | Toggle that item; keep the rest.                                             |
| Shift + click              | Range-select from the anchor to the clicked item (over the displayed order). |
| Click empty space          | Clear selection.                                                             |
| Drag in empty space (grid) | Marquee select (additive with Ctrl/Cmd).                                     |
| `Ctrl/Cmd + A`             | Select all selectable items.                                                 |
| `Escape`                   | Clear selection / cancel an in-progress marquee.                             |

- `selectionMode='single'` ignores modifiers and marquee (one item max).
- `selectionMode={false}` disables selection entirely (items still openable).
- `isRowSelectable`/`item.selectable === false` items are skipped by range,
  marquee, and select-all.
- Every commit calls `onSelectionChange(ids, { reason })`. Marquee commits via
  `startTransition` on pointer-up; intermediate marquee state stays in the
  store and never fires the callback per frame.

---

## 9. Folder navigation

- **Breadcrumbs:** render `path` as `Breadcrumbs` with one `Breadcrumbs.Item`
  per segment; the last is `isCurrent`. Clicking a segment →
  `onNavigate(segment.id, 'breadcrumb')`. Long paths collapse via
  `Breadcrumbs`' built-in `maxItems`.
- **Sidebar:** default is a `TreeView` fed by `folderTree`, with
  `selectedIds={[currentFolderId]}`, `selectionMode='single'`. Selecting a node
  → `onNavigate(nodeId, 'sidebar')`. Expansion is internal to TreeView
  (uncontrolled) unless the consumer supplies a `Sidebar` slot.
- **Open:** double-click / `Enter` on a **folder** item →
  `onNavigate(item.id, 'open')`. On a **file** → `onItemOpen(item)`.
- **History (`history` prop):** when enabled, AssetBrowser keeps a back/forward
  stack of folder ids, renders Back/Forward toolbar buttons, and maps
  `Backspace` / `Alt+ArrowUp` to "go to parent" (derived from `path`). Each hop
  still emits `onNavigate(id, 'back' | 'forward')` — the consumer remains the
  one that swaps `items`.

---

## 10. Drag & drop (move + import)

HTML5 DnD (`draggable`, `dragstart`/`dragover`/`drop`), wired in
`useAssetDnd.ts`. The mutation is always the consumer's — AssetBrowser only
detects intent and fires a callback.

### Drag out / internal move (items)

- Items render `draggable={item.draggable !== false}`. On `dragstart`, if the
  dragged item is in the selection, the whole selection is the payload; else
  just that item.
- `dataTransfer` is set from `getDragData(items)` (default: the array of ids
  serialized as JSON under `dragOutMimeType`). This is what lets an asset be
  dropped onto an external surface (e.g. a material slot in a 3D editor).
- `onItemDragStart` / `onItemDragEnd` fire for consumer bookkeeping.

### Drop onto a folder (internal move)

- Folder items (and sidebar folder nodes) are drop targets when
  `onItemsMove` is provided and `item.droppable !== false`. On a valid hover
  the target shows a drop affordance (store `dropTargetId`). On `drop` →
  `onItemsMove({ itemIds, targetFolderId })`. A folder can never be dropped
  onto itself or its current selection.

### External file import

- When `onFilesImport` is provided, the surface accepts OS file drops. Dropping
  over a folder targets that folder; dropping on empty space targets the
  current folder (`targetFolderId: currentFolderId ?? null`). On `drop` →
  `onFilesImport({ files, targetFolderId })`. The whole surface shows an
  "import" overlay while dragging files over it.

`dragenter`/`dragleave` counting must use a depth counter (the classic
enter/leave flicker fix) — flagged for agents in §16.

---

## 11. Context menus

- Wrap each item (and the empty area) so right-click / long-press opens a
  `ContextMenu`. The **body** is supplied by the consumer:
  - `renderItemContextMenu(selectedItems)` → `Menu.*` children. If the
    right-clicked item is not in the current selection, selection first
    replaces with that item (reason `'contextMenu'`), then the menu opens with
    the new selection.
  - `renderEmptyContextMenu()` → `Menu.*` children for the empty area
    (e.g. "New folder", "Import…", "Paste").
- If neither render prop is supplied, no context menu is mounted (native menu
  is allowed through).

---

## 12. Keyboard & accessibility

### Keyboard matrix

| Key               | Grid                                                                   | List                     |
| ----------------- | ---------------------------------------------------------------------- | ------------------------ |
| Arrow keys        | Move roving focus in 2D (cols from layout)                             | Up/Down rows (DataTable) |
| Home / End        | First / last item                                                      | First / last row         |
| PageUp / PageDown | By one viewport of rows                                                | By one viewport          |
| Enter             | Open (folder→navigate, file→open)                                      | Same                     |
| Space             | Toggle selection of focused item                                       | Same                     |
| Shift + arrows    | Extend range selection                                                 | Same                     |
| Ctrl/Cmd + A      | Select all                                                             | Select all               |
| Escape            | Clear selection / cancel marquee                                       | Clear selection          |
| Backspace / Alt+↑ | Go to parent (when `history`)                                          | Same                     |
| F2                | Begin rename (only if a rename callback is wired — see §17 open items) | Same                     |

2D arrow math is pure and unit-tested in `assetBrowserKeyboard.ts`
(`nextIndex(current, key, columns, count)`).

### ARIA / roles

- Root: `role="region"`, `aria-label`.
- **Grid view:** `role="grid"` + `aria-multiselectable` (when multiple); rows
  are `role="row"`, cells `role="gridcell"` with `aria-selected`, one item in
  the roving tabindex set (`tabIndex=0` on the focused item, `-1` on the rest).
- **List view:** DataTable already exposes `role="grid"` semantics — do not
  double-wrap.
- Breadcrumbs render inside a `nav`; the current segment is `aria-current="page"`.
- A **visually-hidden live region** announces selection count and folder
  changes ("Entered Textures, 24 items", "3 selected").
- Honour `prefers-reduced-motion` for the import overlay, marquee, and any
  card-hover transitions (reuse existing transition tokens, which already
  respect the reduced-motion baseline).

---

## 13. Theming & styling

- `AssetBrowser.css.ts` uses **only** `vars.*` from `@/theme/contract.css`.
  No hardcoded colors, spacing, radii, font sizes, transitions, or shadows.
- Surfaces: panel uses `vars.colors.background.*`; selected cells/rows use the
  accent-tinted border/background tokens already used by `Card`'s `selected`
  state and DataTable's selected row; hover uses `surface.hover` / `rowHover`.
- Dynamic runtime values (thumbnail cell size, virtualization spacer heights,
  marquee rect) go through `createVar()` + `assignInlineVars` from
  `@vanilla-extract/dynamic` — never inline string styles for themed values.
- `thumbnailSize` `sm`/`md`/`lg` are recipe variants; a numeric value sets the
  cell-size CSS var directly.
- Dark-first; verify against the light theme before the PR (Stage 2 parity
  rule).

---

## 14. Performance

- Grid windowing keeps DOM node count bounded regardless of folder size.
- All callback props (`onSelectionChange`, `onNavigate`, `onItemsMove`,
  `renderThumbnail`, …) are read through `useLatest` inside stable handlers so
  consumer inline functions never re-subscribe listeners or invalidate the
  windowing effect (pattern #3 + #11).
- Hot-path state (marquee, drag, hover, focus) lives in the store with
  `shallowEqual` no-op guards (pattern #4 + #12); it never flows through a
  context value.
- Internal filter/sort derivation uses `useMemo`; the search term feeds
  `useDeferredValue` so typing stays responsive over large folders (React 19,
  pattern #10).
- Thumbnails lazy-load via `useIntersectionObserver`; off-screen images issue
  no network request.
- Library stays tree-shakeable: `/*#__PURE__*/ React.memo`, no new side-effect
  imports, `'use client'` only where required (pattern #8).

---

## 15. File structure

```
src/components/data/AssetBrowser/
├── AssetBrowser.tsx              # root: ref-as-prop + imperative handle, composes everything
├── AssetBrowser.types.ts         # all public types (§4–§5)
├── AssetBrowser.css.ts           # Vanilla Extract styles
├── AssetBrowser.test.tsx         # component tests
├── AssetBrowserStore.ts          # hot-path store (§6)
├── AssetBrowserStore.test.ts
├── AssetBrowserContext.ts        # context + slice hooks
├── AssetBrowserToolbar.tsx       # default toolbar + 'toolbar' slot marker
├── AssetBrowserBreadcrumbs.tsx   # path bar
├── AssetBrowserSidebar.tsx       # default TreeView sidebar + 'sidebar' slot marker
├── AssetBrowserGrid.tsx          # windowed grid view
├── AssetBrowserGridItem.tsx      # single Card-based cell
├── AssetBrowserList.tsx          # DataTable wrapper + sort/selection bridge
├── useAssetGridVirtualizer.ts    # windowing math (pure + scroll subscription)
├── useAssetGridVirtualizer.test.ts
├── useAssetSelection.ts          # selection-modifier logic
├── useAssetSelection.test.ts
├── useAssetDnd.ts                # drag/drop wiring
├── assetBrowserFilter.ts         # pure filter/sort/search helpers
├── assetBrowserFilter.test.ts
├── assetBrowserKeyboard.ts       # pure 2D keyboard-nav math
├── assetBrowserKeyboard.test.ts
├── slots.ts                      # Symbol slot markers (no 'use client')
└── index.ts                      # re-exports component + public types
```

Exports to update: `src/components/data/index.ts` and the root `src/index.ts`
(component + every public type + any new public hook). If
`useAssetGridVirtualizer` proves generally useful it graduates to
`src/hooks/` with its own folder, tests, and export — otherwise it stays local.

---

## 16. Implementation phases (ordered, each independently reviewable)

One PR overall, but build and commit in this order so each step type-checks,
lints, and tests green on its own.

| Phase                         | Deliverable                                                                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0. Foundations**            | `*.types.ts`, `slots.ts`, `assetBrowserFilter.ts`, `assetBrowserKeyboard.ts`, store + context skeleton — all with unit tests. No UI yet.                                            |
| **1. Shell**                  | Root component, controlled-state wiring, default toolbar (view toggle + search), breadcrumbs, default TreeView sidebar, empty + loading (Skeleton) states. Static, non-virtualized. |
| **2. List view**              | `AssetBrowserList` over `DataTable` with default columns + sort/selection/density bridges + activation routing.                                                                     |
| **3. Grid view**              | `AssetBrowserGrid` (non-virtualized) + `AssetBrowserGridItem` (Card) + thumbnail resolution (renderThumbnail → url(lazy) → icon → type icon).                                       |
| **4. Selection & keyboard**   | `useAssetSelection`, modifiers, 2D keyboard nav, marquee, roving focus — through the store.                                                                                         |
| **5. Grid virtualization**    | `useAssetGridVirtualizer`, windowing wired into the grid; `virtualized`/threshold props.                                                                                            |
| **6. Drag & drop**            | `useAssetDnd`: internal move, external import overlay, drag-out payload.                                                                                                            |
| **7. Context menus + handle** | `renderItemContextMenu` / `renderEmptyContextMenu`, `useImperativeHandle`.                                                                                                          |
| **8. A11y + reduced-motion**  | Roles, roving tabindex, live region, reduced-motion audit.                                                                                                                          |
| **9. Docs + changeset**       | MDX page, demo file, sidebar entry, `minor` changeset, light-theme check.                                                                                                           |

---

## 17. Agent brief — what to watch, what not to do

> Read `docs/component-patterns.md` and `docs/0.8-conventions.md` **before**
> writing a line. This section is the AssetBrowser-specific layer on top of
> them.

### Must do

1. **Compose, don't reinvent.** List view _is_ `DataTable`. Sidebar _is_
   `TreeView`. Cells _are_ `Card`. Path _is_ `Breadcrumbs`. If you find
   yourself writing a table, a tree, or a card from scratch, stop — you took a
   wrong turn.
2. **Reuse the hook catalog** (`component-patterns.md` §1): `useControlledState`
   for every controlled axis, `useResizeObserver` for grid width,
   `useIntersectionObserver` for lazy thumbnails, `useLatest` for every callback
   prop, `useMergedRef`, `useHotkey`/`useKeyboard` for shortcuts,
   `useClickOutside` where needed. **Never** hand-roll `ResizeObserver`,
   `IntersectionObserver`, `matchMedia`, or raw `setTimeout`/`document`
   listeners inside a `useEffect`.
3. **`useEffect` is the last resort** (§2). The filtered/sorted list is a
   `useMemo`, not state synced by an effect. Resolve theme inside canvas draws,
   never cache themed colors in `useState`.
4. **Hot path → store** (§4/§6). Marquee, drag, hover, focus, live selection
   updates go through `AssetBrowserStore` with `shallowEqual` guards and slice
   subscriptions. They must not ride a context value or fire `setState` per
   pointer-move.
5. **`useLatest` for all consumer callbacks and render props** so inline
   functions never re-subscribe DnD/scroll/resize listeners or invalidate the
   windowing effect.
6. **`ref` as a prop + `useImperativeHandle`** for the handle; `Omit<'ref'>`
   from the base props so TS enforces the handle type. No `React.FC`. No
   `forwardRef`.
7. **Symbol slot markers** for `Toolbar`/`Sidebar` detection (§5, pattern #6) —
   never match on `displayName`.
8. **`vars.*` tokens only.** No hardcoded color/spacing/radius/transition/font.
   Dynamic numeric values via `createVar` + `assignInlineVars`.
9. **`/*#__PURE__*/ React.memo`, `displayName`, `'use client'`** only on files
   that need it (pure type/marker/util files do not).
10. **English everywhere.** Tests, JSDoc, comments, commit messages, MDX.
11. **Tests ≥ 80%** on changed files; `renderWithTheme` from
    `@/tests/testUtils`; `describe` blocks Rendering / Interactions /
    Accessibility. Pure modules (filter, keyboard math, virtualizer, store) get
    their own focused unit tests.
12. **Ship the docs.** MDX page at
    `docs-site/src/content/docs/components/data/asset-browser.mdx`, demo at
    `docs-site/src/components/demos/data/AssetBrowserDemo.tsx`, sidebar entry in
    `docs-site/astro.config.mjs` (Data group, alphabetical). Follow
    `data-table.mdx` as the canonical example. Every preview needs
    `client:only="react"`.
13. **`minor` changeset**, user-facing summary. Verify it is **not** `major`.

### AssetBrowser-specific traps

- **Selection is one source of truth.** Grid and list read the same store
  selection so toggling views preserves it. Do not keep a second selection set
  inside the DataTable wrapper — bridge ids in/out.
- **Sort vocabulary mismatch.** AssetBrowser speaks `{ field, direction }`;
  DataTable speaks `{ columnId, direction }`. Map both ways in one place
  (`AssetBrowserList`), and keep `field === columnId` for the default columns to
  make the mapping trivial.
- **Folders sort before files.** Easy to forget; covered by a
  `assetBrowserFilter` test.
- **DnD enter/leave flicker.** `dragenter`/`dragleave` fire per child element —
  use a depth counter (increment on enter, decrement on leave, target is
  "active" while count > 0). Do not toggle a boolean naively.
- **Drag-out vs. drop-target on the same node.** A folder cell is both
  draggable (move it) and a drop target (move things into it). Guard against
  dropping the dragged selection onto itself.
- **Windowing + scrollbar correctness.** The scroller must be the full virtual
  height (top spacer + window + bottom spacer) so the native scrollbar
  represents the whole list. Re-measure columns on container resize via
  `useResizeObserver`, and recompute the window on scroll (throttled rAF, not a
  state write per scroll pixel).
- **Lazy thumbnails must not thrash.** Observe once per mounted cell; disconnect
  on unmount. With windowing, cells unmount/remount as you scroll — the
  intersection hook handles re-observe, do not leak observers.
- **`renderThumbnail` is an inline function.** Wrap it in `useLatest`; it must
  not be a dependency of the windowing or draw effects.
- **`role="grid"` is for the grid VIEW container**, but DataTable already owns
  `role="grid"` for the list — never nest two.

### Out of scope for v1 (do not build; note as deferred)

- Inline rename in the grid/list (TreeView already has it for the sidebar; the
  grid F2 row in the matrix stays inert unless a rename callback is added — see
  open items).
- Multi-column "details" view beyond the default DataTable columns.
- Built-in copy/paste/delete commands (expose via context-menu render props;
  the consumer wires the actions).
- Tag/label management, ratings, favorites.
- Server-side infinite scroll pagination (the controlled model supports
  consumer-driven paging, but no built-in pager in v1).

---

## 18. Open items to confirm during implementation

These are **not** blockers for the spec, but raise them in the PR if they come
up:

1. **Rename:** add `renamable` + `onItemRename` to match TreeView, or leave
   rename to the context menu? Default plan: **leave to context menu** in v1;
   keep the `F2` row inert.
2. **`useAssetGridVirtualizer` promotion:** keep local, or graduate to
   `src/hooks/` as a public `useGridVirtualizer`? Decide once the API stabilizes
   and only if a second consumer appears.
3. **Status-bar thumbnail-size control:** slider vs. segmented sm/md/lg. Default
   plan: small segmented control to avoid pulling `Slider` into the bundle
   unless needed.

---

## 19. Definition of done

- [ ] All public types exported from `entangle-ui`.
- [ ] List view = DataTable; grid view = windowed Card grid; sidebar = TreeView;
      path = Breadcrumbs — no reimplementations.
- [ ] Controlled + uncontrolled for view / selection / search / filters / sort /
      thumbnailSize, all via `useControlledState`.
- [ ] Hot-path state in the store; callbacks via `useLatest`.
- [ ] Grid virtualization engages above the threshold and scrolls smoothly with
      thousands of items.
- [ ] Move + import DnD wired to callbacks; drag-out payload set.
- [ ] Keyboard matrix + ARIA roles + live region + reduced-motion implemented.
- [ ] Tests ≥ 80% on changed files; full suite green.
- [ ] `npm run lint`, `npm run type-check`, `npm run format` clean.
- [ ] MDX docs page + demo + sidebar entry shipped; renders in `npm run dev`.
- [ ] Light-theme visual check passed.
- [ ] `minor` changeset committed (not `major`).
- [ ] One PR against `main`, conventional commits, branch
      `claude/etui-assetbrowser-OBs1N`.

```

```
