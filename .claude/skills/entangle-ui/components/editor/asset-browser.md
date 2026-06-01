# AssetBrowser

> Controlled content browser for files and folders — grid/list views, thumbnails, folder navigation, search, filter, sort, selection, marquee, and drag-and-drop.

The content browser of a professional editor — the surface that lists assets (textures, models, materials, audio, arbitrary files) and the folders that hold them, like the Unreal Content Browser or the Unity Project window. It composes the existing `DataTable` (list view), `Card` grid (grid view), `TreeView` (folder sidebar), and `Breadcrumbs` (path bar) into one cohesive surface.

AssetBrowser is **controlled and presentational** — it does not own a filesystem. You feed it the contents of the _current folder_ plus a _folder tree_; it renders them and reports navigation, selection, and drag intent through callbacks. Lazy loading and any backend (local FS, S3, an in-memory catalog) work out of the box.

**Live Preview**

## What you get out of the box

Drop in `<AssetBrowser items={items} />` with nothing else and you get:

- A **grid view** with the default thumbnail scale (`md`, 104 px), folder-first ordering, and ascending name sort.
- A **toolbar** with the grid/list toggle, a search field, a sort menu (name / type / size / modified · asc / desc), and a filter menu populated from the `assetType` values present in `items`.
- A **virtualized scroll area** that auto-engages above 200 items.
- A **breadcrumb bar** when you pass `path`, and a **TreeView sidebar** when you pass `folderTree`.
- **Selection** — `multiple` by default; click replaces, Ctrl/Cmd-click toggles, Shift-click range-selects, dragging in empty space draws a marquee.
- **Keyboard navigation** — arrows / Home / End / PageUp / PageDown, Enter to open (folders navigate, files emit `onItemOpen`), Space to toggle, Ctrl/Cmd+A to select all, Escape to clear.
- **A11y** — `role="grid"`, `aria-multiselectable`, per-cell `aria-selected`, roving tabindex, a live region for selection / folder changes.
- An **empty state** when `items.length === 0`, and a **loading state** when `loading` is set.

The defaults are picked for editor-grade density and the dark theme; everything is overridable via props, render slots, or theme tokens.

## Import

```tsx
import { AssetBrowser } from 'entangle-ui';
import type { AssetItem, AssetPathSegment, AssetSortState } from 'entangle-ui';
```

## Quick start

The minimum: an items array and an `onItemOpen` handler.

```tsx
const items: AssetItem[] = [
  { id: 'wood', name: 'wood.png', kind: 'file', assetType: 'image' },
  { id: 'stone', name: 'stone.png', kind: 'file', assetType: 'image' },
];

<AssetBrowser items={items} onItemOpen={item => openPreview(item)} />;
```

Add folder navigation by holding the current folder id and a `path` in state, then responding to `onNavigate`:

```tsx
const [folder, setFolder] = useState('root');

<AssetBrowser
  items={contentsOf(folder)}
  path={pathTo(folder)}
  folderTree={tree}
  currentFolderId={folder}
  onNavigate={id => setFolder(id)}
  onItemOpen={item => openPreview(item)}
/>;
```

## Real-world example

A complete editor-style content browser with a selection-driven inspector panel, an activity log, and full drag-and-drop wiring.

**Editor with inspector & activity panel**

```tsx
const [folder, setFolder] = useState('textures');
const [selection, setSelection] = useState<string[]>([]);
const [activity, setActivity] = useState<Activity[]>([]);

const log = (message: string) =>
  setActivity(prev => [{ message, time: new Date() }, ...prev].slice(0, 8));

<AssetBrowser
  items={contentsOf(folder)}
  path={pathTo(folder)}
  folderTree={tree}
  currentFolderId={folder}
  selection={selection}
  onSelectionChange={ids => setSelection(ids)}
  onNavigate={id => {
    setFolder(id);
    setSelection([]);
  }}
  onItemOpen={item => log(`Open ${item.name}`)}
  onItemsMove={({ itemIds, targetFolderId }) =>
    log(`Move ${itemIds.length} → ${targetFolderId}`)
  }
  onFilesImport={({ files, targetFolderId }) =>
    log(`Import ${files.length} file(s) → ${targetFolderId ?? 'current'}`)
  }
  renderThumbnail={item => <TypeBadge type={item.assetType} />}
  filterableTypes={['image', 'model', 'audio', 'material']}
  showStatusBar
/>;
```

## Data model

Each entry is an `AssetItem` discriminated by `kind`. Folders and files share the same shape; folders don't need an `assetType` (they always sort before files).

```tsx
interface AssetItem {
  id: string; // stable, unique within the browser
  name: string; // display label
  kind: 'file' | 'folder'; // drives navigation vs. open
  assetType?: string; // 'image' | 'model' | 'audio' | …; extensible
  thumbnailUrl?: string; // grid view; lazy-loaded
  icon?: ReactNode; // explicit icon override
  size?: number; // bytes; feeds the list "Size" column + sort
  modifiedAt?: number | Date; // feeds the list "Modified" column + sort
  meta?: Record<string, unknown>; // arbitrary consumer payload
  selectable?: boolean; // default true
  draggable?: boolean; // default true
  droppable?: boolean; // default: true for folders
  disabled?: boolean;
}
```

The `path` prop is a flat list of breadcrumb segments, oldest → newest:

```tsx
const path: AssetPathSegment[] = [
  { id: 'root', name: 'Assets' },
  { id: 'textures', name: 'Textures' },
];
```

## Views

`view` and `defaultView` toggle between **grid** and **list**. The toolbar exposes the same toggle. Selection is preserved when you switch.

**Grid view (default)**

**List view (DataTable bridge)**

```tsx
<AssetBrowser items={items} defaultView="list" />
```

## Thumbnails

The grid view sizes cells from `thumbnailSize` — `'sm'` (72 px), `'md'` (104 px, default), `'lg'` (144 px), or any number for raw pixels. Resolution order for the image is `renderThumbnail` → `item.thumbnailUrl` (lazy-loaded) → `item.icon` → a type-derived fallback icon.

**Thumbnail sizes**

Custom thumbnails — pass a `renderThumbnail` for canvas previews, gradient swatches, or anything that needs more than an `<img>`:

**Custom thumbnail via renderThumbnail**

```tsx
<AssetBrowser
  items={items}
  renderThumbnail={(item, { size }) => (
    <CanvasModelPreview src={item.meta?.url} px={size} />
  )}
/>
```

## Folder navigation

Provide a `folderTree` (a `TreeNodeData[]`, the same shape used by `TreeView`) for a sidebar, and a `path` for the breadcrumb bar. Respond to `onNavigate` by swapping the `items` prop — AssetBrowser never walks the tree itself.

**Folder navigation**

Double-click / Enter on a folder fires `onNavigate(id, 'open')`. Clicking a breadcrumb fires `onNavigate(id, 'breadcrumb')`. Clicking a sidebar node fires `onNavigate(id, 'sidebar')`. The `source` argument lets you distinguish them for analytics or undo.

### History (Back / Forward)

Set `history` to add Back/Forward toolbar buttons plus a `Backspace` / `Alt+ArrowUp` "go to parent" shortcut. AssetBrowser keeps an internal back/forward stack and reports moves through `onNavigate` with `source` `'back'` / `'forward'`. The stack also tracks the controlled `currentFolderId`: if your app navigates the browser elsewhere (a deep link, a "reveal in browser" action) by changing `currentFolderId` directly, that destination is pushed onto the stack so Back returns to where the user was.

**Back / forward history**

```tsx
<AssetBrowser
  items={contentsOf(folder)}
  path={pathTo(folder)}
  currentFolderId={folder}
  history
  onNavigate={(id, source) => {
    setFolder(id); // 'back' / 'forward' come pre-resolved to the target id
  }}
/>
```

## Selection

`selectionMode` is `'multiple'` by default; `'single'` and `false` are also supported. Selection is controlled via `selection` (+ `onSelectionChange`) or uncontrolled via `defaultSelection`. The callback reports the new ids and a `reason` describing which gesture caused the change.

**Multiple selection with modifiers**

**Single selection**

| Gesture                  | Result                                               |
| ------------------------ | ---------------------------------------------------- |
| Click                    | Replace selection with that item.                    |
| Ctrl/Cmd + click         | Toggle that item; keep the rest.                     |
| Shift + click            | Range-select from the anchor over displayed order.   |
| Click empty grid space   | Clear selection.                                     |
| Drag in empty grid space | Marquee select (additive with Ctrl/Cmd).             |
| `Ctrl/Cmd + A`           | Select every selectable displayed item.              |
| `Escape`                 | Clear selection (and cancel an in-progress marquee). |

## Search, filter, sort

Search, filters, and sort are managed internally by default (client-side, deferred for responsiveness). Pass `manualSearch` / `manualFilter` / `manualSort` to delegate any axis to the consumer — useful for server-side filtering.

**Search & filter**

The filter menu lists every distinct `assetType` present in `items`. Override that list with `filterableTypes`. Folders always pass the type filter so navigation stays intact.

**Sorting (list view)**

Click a list-view column header to sort; the grid view exposes the same sort via the toolbar menu. Folders always group before files within a direction.

## Drag & drop

Provide `onItemsMove` to enable dropping items onto folders, and `onFilesImport` to accept OS files dropped on the surface (or onto a folder). Items are also draggable out with a configurable `dataTransfer` payload (`dragOutMimeType`, default `application/x-entangle-asset`). The actual move/import mutation is yours — AssetBrowser only reports intent.

**Drag & drop with callback log**

```tsx
<AssetBrowser
  items={items}
  onItemsMove={({ itemIds, targetFolderId }) => move(itemIds, targetFolderId)}
  onFilesImport={({ files, targetFolderId }) => upload(files, targetFolderId)}
  getDragData={items => ({
    'application/x-my-app': JSON.stringify(items.map(i => i.id)),
  })}
/>
```

Folder cells highlight as drop targets while a compatible drag hovers them. When OS files are dragged over the surface a full-surface import overlay appears.

## Render props

`renderThumbnail` overrides just the image; `renderItem` replaces the entire grid cell content (you take over the inner layout — the cell still owns selection, focus, and drag wiring). The `state` argument carries `selected`, `focused`, `index`, `view`, and `dropTarget`.

**renderItem (full cell takeover)**

```tsx
<AssetBrowser
  items={items}
  renderItem={(item, state) => (
    <MyAssetCard
      item={item}
      selected={state.selected}
      focused={state.focused}
      dropTarget={state.dropTarget}
    />
  )}
/>
```

## Context menus

Pass `renderItemContextMenu` to populate a right-click menu over items, and `renderEmptyContextMenu` for the empty surface. Return `Menu.*` children — AssetBrowser wraps them in a `ContextMenu` positioned at the pointer. The item callback receives the **acted-on** items: the whole selection when you right-click a selected item, otherwise just the one under the cursor (right-clicking an unselected item also selects it first).

**Right-click menus (item + empty area)**

```tsx
import { Menu } from 'entangle-ui';

<AssetBrowser
  items={items}
  // `actions` wires the built-in rename / delete / duplicate flows, so you
  // don't need a ref to drive them.
  renderItemContextMenu={(selected, actions) => (
    <>
      <Menu.Item onClick={() => open(selected)}>
        Open{selected.length > 1 ? ` ${selected.length} items` : ''}
      </Menu.Item>
      <Menu.Item onClick={actions.rename} disabled={selected.length !== 1}>
        Rename
      </Menu.Item>
      <Menu.Separator />
      <Menu.Item onClick={actions.delete}>Delete</Menu.Item>
    </>
  )}
  renderEmptyContextMenu={() => (
    <Menu.Item onClick={createFolder}>New folder</Menu.Item>
  )}
/>;
```

## Mutations

AssetBrowser stays controlled and presentational for mutations too: it provides the affordances (inline editor, keyboard shortcuts, menu actions) and reports **intent** through callbacks — you apply the change to your data and pass back fresh `items`. Each callback's presence enables its affordance; omit it and the affordance disappears.

| Prop                          | Enables       | Triggers                                            |
| ----------------------------- | ------------- | --------------------------------------------------- |
| `onItemRename(item, newName)` | Inline rename | `F2`, the `Rename` action, `handle.beginRename(id)` |
| `onItemsDelete(items)`        | Delete        | `Delete` (and `⌘⌫`), the `Delete` action            |
| `onItemsDuplicate(items)`     | Duplicate     | `Ctrl/⌘ + D`, the `Duplicate` action                |
| `onCreateFolder(parentId)`    | New folder    | the empty-area `New folder` action                  |

**Rename, duplicate, delete, new folder**

Set `defaultItemActions` to auto-populate the context menus with `Rename` / `Duplicate` / `Delete` / `New folder` entries for whichever callbacks you pass — no `renderItemContextMenu` needed. The action labels come from the `labels` prop, so they localize with everything else.

```tsx
const [items, setItems] = useState(initialItems);

<AssetBrowser
  items={items}
  defaultItemActions
  onItemRename={(item, newName) => {
    setItems(prev =>
      prev.map(i => (i.id === item.id ? { ...i, name: newName } : i))
    );
  }}
  onItemsDelete={deleted => {
    const ids = new Set(deleted.map(i => i.id));
    setItems(prev => prev.filter(i => !ids.has(i.id)));
  }}
  onItemsDuplicate={dupes => setItems(prev => [...prev, ...copy(dupes)])}
  onCreateFolder={() => {
    const id = crypto.randomUUID();
    setItems(prev => [{ id, name: 'New Folder', kind: 'folder' }, ...prev]);
    ref.current?.beginRename(id); // create + immediately rename
  }}
/>;
```

**Rename flow.** Inline editing swaps the cell label for a text field. Enter (or blur with a changed, non-empty value) commits via `onItemRename`; Escape — or an unchanged/empty value — cancels silently. To **reject** a name (failed validation), return / resolve `false` and the editor stays open for another try:

```tsx
onItemRename={(item, newName) => {
  if (!isValid(newName)) return false; // keep editing
  void persist(item.id, newName);
}}
```

**New folder + rename** is the idiomatic create flow: insert a placeholder, then call `handle.beginRename(newId)` to drop the user straight into naming it (shown above).

> All mutation affordances work in **both** views: inline rename, the `F2` / `Delete` / `Ctrl+D` shortcuts, and the right-click menus behave identically in the grid and the list. (In the list, `F2` renames the sole selected row, since the list has no roving focus.)

## Compound slots

For full toolbar or sidebar replacement, use the compound slot components. The slots are marked with a Symbol (not `displayName`), so they survive `React.memo` and minification.

**Custom toolbar (AssetBrowser.Toolbar)**

**Custom sidebar (AssetBrowser.Sidebar)**

```tsx
<AssetBrowser items={items} search={q} onSearchChange={setQ}>
  <AssetBrowser.Toolbar>
    <MyBrandedToolbar query={q} onChange={setQ} onImport={openImport} />
  </AssetBrowser.Toolbar>
  <AssetBrowser.Sidebar>
    <MyFavoritesPanel />
  </AssetBrowser.Sidebar>
</AssetBrowser>
```

Omit a slot to keep the default rendering; provide one to replace it entirely.

## Custom columns (list view)

The default list columns are **Name**, **Type**, **Size**, **Modified**. Pass a `columns` prop to override them with any `DataTableColumn<AssetItem>[]` you like — sorting indicators, sticky-left, custom cells all work.

**Custom columns**

```tsx
const columns: DataTableColumn<AssetItem>[] = [
  {
    id: 'name',
    header: 'Asset',
    accessor: 'name',
    sortable: true,
    sticky: true,
  },
  { id: 'tags', header: 'Tags', accessor: row => row.meta?.tags?.join(', ') },
];

<AssetBrowser items={items} defaultView="list" columns={columns} />;
```

## States

AssetBrowser resolves four mutually exclusive content states, in priority order:

| State       | Trigger              | Renders                                                                                     |
| ----------- | -------------------- | ------------------------------------------------------------------------------------------- |
| **Error**   | `error` is truthy    | `error={true}` → built-in message (+ Retry when `onErrorRetry` is set); a node replaces it. |
| **Loading** | `loading` is true    | A skeleton grid of `loadingItemCount` cells (grid) or a spinner (list).                     |
| **Empty**   | `items.length === 0` | `emptyState`, or a default "This folder is empty." message.                                 |
| **Content** | otherwise            | The grid or list view.                                                                      |

`error` takes precedence over `loading`, which takes precedence over the empty state — so a failed refetch shows the error, not a stale spinner.

**Empty and loading**

The loading skeleton mirrors the real grid geometry (a thumbnail block + a label line per cell, sized to the current thumbnail scale) instead of a lone spinner, so the layout doesn't jump when data arrives.

**Error state with Retry**

```tsx
const { data, isLoading, error, refetch } = useFolder(folderId);

<AssetBrowser
  items={data ?? []}
  loading={isLoading}
  error={error ? true : false}
  onErrorRetry={refetch}
/>;
```

## Status bar & list density

`showStatusBar` reveals a footer with the displayed item count, selection size, and a thumbnail-size control (grid view only). `density` propagates to `DataTable` in list view.

**Status bar visible**

**List densities**

## Styling via theme tokens

Every color, border, radius, and surface in AssetBrowser reads from the `--etui-*` CSS custom properties that make up the theme contract. To re-skin the component (or a subtree of your app) override those variables on any ancestor element — no component-level prop drilling required.

**Default vs. custom token overrides**

```tsx
const warmTheme: CSSProperties = {
  '--etui-color-bg-primary': '#1f1612',
  '--etui-color-bg-secondary': '#2a1d18',
  '--etui-color-border-default': '#5a4423',
  '--etui-color-accent-primary': '#f59e0b',
  '--etui-color-surface-active': '#4a2f1f',
  '--etui-color-text-primary': '#f5e6d3',
  '--etui-borderRadius-md': '10px',
};

<div style={warmTheme}>
  <AssetBrowser items={items} />
</div>;
```

The tokens AssetBrowser reads most heavily:

| Token                         | Affects                                                 |
| ----------------------------- | ------------------------------------------------------- |
| `--etui-color-bg-primary`     | Main panel background.                                  |
| `--etui-color-bg-secondary`   | Sidebar background.                                     |
| `--etui-color-bg-inset`       | Thumbnail placeholder background.                       |
| `--etui-color-border-default` | Separators (toolbar, breadcrumbs, sidebar, status bar). |
| `--etui-color-border-focus`   | Focus ring and selected-cell outline.                   |
| `--etui-color-accent-primary` | Marquee, drop-target ring, import overlay border.       |
| `--etui-color-surface-hover`  | Cell hover background.                                  |
| `--etui-color-surface-active` | Selected cell background and active sidebar node.       |
| `--etui-color-text-primary`   | Cell labels, breadcrumb current segment.                |
| `--etui-color-text-muted`     | Status bar text, fallback icons, empty-state text.      |
| `--etui-borderRadius-md`      | Panel corner radius and grid cells.                     |

For a fully custom palette across the whole app, prefer `createCustomTheme(...)` from the public API — overriding `--etui-*` directly is the right pattern for a localized accent.

## Internationalization

Every built-in string (search placeholder, sort/filter menus, view tooltips, empty/loading/error messages, column headers, the live-region announcement) is overridable through the `labels` prop. It's a partial — anything you omit keeps its English default. The count strings are functions so you can handle pluralization per locale.

**Localized labels (Polish)**

```tsx
<AssetBrowser
  items={items}
  labels={{
    searchPlaceholder: 'Szukaj zasobów…',
    sort: 'Sortuj',
    filter: 'Filtruj',
    empty: 'Ten folder jest pusty.',
    sortFields: {
      name: 'Nazwa',
      type: 'Typ',
      size: 'Rozmiar',
      modified: 'Zmodyfikowano',
    },
    itemCount: n => `${n} ${n === 1 ? 'element' : 'elementów'}`,
    selectedCount: n => `, zaznaczono ${n}`,
  }}
/>
```

The default English set is exported as `DEFAULT_ASSET_BROWSER_LABELS` if you want to spread and tweak it, and the full key list is the `AssetBrowserLabels` type.

## Imperative handle

Pass a `ref` to get a typed `AssetBrowserHandle` with `focus()`, `selectAll()`, `clearSelection()`, `scrollToItem(id)`, `getSelectedItems()`, and `getElement()`.

```tsx
const ref = useRef<AssetBrowserHandle>(null);

useEffect(() => {
  ref.current?.scrollToItem('hero_character.fbx');
}, []);

<AssetBrowser ref={ref} items={items} />;
```

## Recipes

### Load a folder from a backend

AssetBrowser is presentational — own the data outside and swap `items` on navigation. Drive `loading` / `error` from your fetch state:

```tsx
function Browser() {
  const [folder, setFolder] = useState('root');
  const { data, isLoading, error, refetch } = useFolderContents(folder);

  return (
    <AssetBrowser
      items={data?.items ?? []}
      path={data?.path ?? []}
      currentFolderId={folder}
      history
      loading={isLoading}
      error={error ? true : false}
      onErrorRetry={refetch}
      onNavigate={setFolder}
      onItemOpen={openAsset}
    />
  );
}
```

### Server-side search, filter, and sort

For large catalogs, delegate the heavy axes to the backend with `manual*` and feed pre-shaped `items` back. AssetBrowser keeps the controls wired and reports intent:

```tsx
<AssetBrowser
  items={results}
  manualSearch
  manualFilter
  manualSort
  onSearchChange={setQuery}
  onFiltersChange={setFilters}
  onSortChange={setSort}
/>
```

### Drag an asset into a 3D viewport

Give the drag a payload your viewport understands and read it on drop:

```tsx
<AssetBrowser
  items={items}
  dragOutMimeType="application/x-myeditor-asset"
  getDragData={items => ({
    'application/x-myeditor-asset': JSON.stringify(items.map(i => i.id)),
  })}
/>;

// viewport drop target
<div
  onDragOver={e => e.preventDefault()}
  onDrop={e => {
    const ids = JSON.parse(
      e.dataTransfer.getData('application/x-myeditor-asset')
    );
    spawnInScene(ids);
  }}
/>;
```

### Right-click actions (open / rename / delete)

Wire `renderItemContextMenu` to your mutation handlers — see [Context menus](#context-menus). The callback hands you exactly the items the action should apply to.

## Tips & gotchas

- **Give the wrapper a fixed height.** AssetBrowser fills its container (`height: 100%`); without a sized ancestor the grid collapses. Every demo here sets an explicit height.
- **Keep `items` referentially stable** between renders (memoize derived lists). A new array each render re-runs the filter/sort pass and can churn the grid.
- **Use stable `id`s.** Selection, focus, and the back/forward anchor are tracked by `id`, so they survive a re-sort or re-filter only if ids are stable.
- **Virtualization auto-engages above `virtualizationThreshold` (200).** Force it with `virtualized` if you render a tall fixed grid below that count, or disable it for print/export.
- **`history` is required for the parent-folder shortcut.** `Backspace` / `Alt+ArrowUp` only navigate up when `history` is set.

## Accessibility

- The grid view is a `role="grid"` with `aria-multiselectable` (in multi-select mode) and `aria-rowcount` / `aria-colcount` reflecting the **true** totals (not just the virtualization window); cells are `role="gridcell"` with `aria-selected`, 1-based `aria-rowindex` / `aria-colindex`, and roving `tabIndex`.
- Arrow-key focus is announced via `aria-activedescendant` on the grid, so it works under windowing without moving DOM focus off the scroller.
- The list view inherits DataTable's `role="grid"` semantics; the wrapper does not double-wrap.
- The breadcrumb bar is a labelled `nav`; the current segment carries `aria-current="page"`.
- A visually-hidden live region announces the item count and selection size (translatable via `labels`).
- Thumbnails use empty `alt` (decorative) — the accessible name is on the gridcell — and fall back to a type icon if the image fails to load.
- Animations honour `prefers-reduced-motion: reduce` via the same transition tokens used by the rest of the library.

### Keyboard reference

| Key                          | Action                                                   |
| ---------------------------- | -------------------------------------------------------- |
| Arrow keys                   | Move roving focus (2D in grid, vertical in list).        |
| Home / End                   | Jump to the first / last item.                           |
| PageUp / PageDown            | Move by one viewport's worth of rows.                    |
| Enter                        | Activate — folder navigates, file emits `onItemOpen`.    |
| Space                        | Toggle selection of the focused item.                    |
| Shift + arrows / Shift+click | Extend range selection from the anchor.                  |
| Ctrl/Cmd + A                 | Select every selectable displayed item.                  |
| Escape                       | Clear selection (cancel a marquee / rename in progress). |
| F2                           | Inline-rename the focused item (needs `onItemRename`).   |
| Delete (⌘⌫ on macOS)         | Delete the selection (needs `onItemsDelete`).            |
| Ctrl/Cmd + D                 | Duplicate the selection (needs `onItemsDuplicate`).      |

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` *(required)* | `AssetItem[]` | — | Direct children of the current folder (files + sub-folders). |
| `path` | `AssetPathSegment[]` | — | Current location, oldest → newest. Drives the breadcrumb bar. |
| `folderTree` | `TreeNodeData[]` | — | Folder hierarchy for the sidebar. Omit to hide the sidebar. |
| `currentFolderId` | `string` | — | Id of the folder currently shown. Highlights the sidebar node. |
| `view` | `'grid' \| 'list'` | — | Controlled view mode. |
| `defaultView` | `'grid' \| 'list'` | `'grid'` | Uncontrolled initial view. |
| `onViewChange` | `(view) => void` | — | Fired when the view toggles. |
| `thumbnailSize` | `'sm' \| 'md' \| 'lg' \| number` | `'md'` | Grid thumbnail scale (number = px). |
| `density` | `'comfortable' \| 'compact' \| 'dense'` | `'comfortable'` | List-view row density. |
| `selectionMode` | `'single' \| 'multiple' \| false` | `'multiple'` | Selection behaviour. |
| `selection` | `string[]` | — | Controlled selected ids. |
| `defaultSelection` | `string[]` | — | Uncontrolled initial selection. |
| `onSelectionChange` | `(ids, { reason }) => void` | — | Fired when selection changes. |
| `search` | `string` | — | Controlled search query. |
| `onSearchChange` | `(query) => void` | — | Fired when the search input changes. |
| `manualSearch` | `boolean` | `false` | When true, you pre-filter items by name. |
| `filters` | `{ types?: string[] }` | — | Controlled type filters. |
| `onFiltersChange` | `(filters) => void` | — | Fired when filters change. |
| `filterableTypes` | `string[]` | — | Type values offered in the filter menu. Defaults to the distinct assetTypes present in items. |
| `sort` | `{ field, direction }` | — | Controlled sort state. |
| `defaultSort` | `{ field, direction }` | `{ field: 'name', direction: 'asc' }` | Uncontrolled initial sort. |
| `onSortChange` | `(sort) => void` | — | Fired when sort changes. |
| `onNavigate` | `(folderId, source) => void` | — | Fired when the user enters a folder. |
| `onItemOpen` | `(item) => void` | — | Fired when a file is activated (double-click / Enter). |
| `history` | `boolean` | `false` | Enable Back/Forward controls + Backspace/Alt+ArrowUp to parent. |
| `marquee` | `boolean` | `true` | Rubber-band marquee in empty grid space (multi-select only). |
| `columns` | `DataTableColumn[]` | — | Override the default list columns. |
| `onItemsMove` | `({ itemIds, targetFolderId }) => void` | — | Enables dropping items onto folders. |
| `onFilesImport` | `({ files, targetFolderId }) => void` | — | Enables external OS-file drop. |
| `dragOutMimeType` | `string` | `'application/x-entangle-asset'` | MIME type used when dragging items out. |
| `getDragData` | `(items) => Record<string, string>` | — | Override the drag-out dataTransfer payload. |
| `renderThumbnail` | `(item, ctx) => ReactNode` | — | Custom thumbnail (e.g. canvas preview). |
| `renderItem` | `(item, state) => ReactNode` | — | Fully replace a grid cell's content. |
| `renderItemContextMenu` | `(items, actions) => ReactNode` | — | Body of the item context menu. `actions` wires rename/delete/duplicate. |
| `renderEmptyContextMenu` | `() => ReactNode` | — | Body of the empty-area context menu. |
| `defaultItemActions` | `boolean` | `false` | Auto-build Rename/Duplicate/Delete/New-folder menu entries from the mutation callbacks. |
| `onItemRename` | `(item, newName) => boolean \| void \| Promise<…>` | — | Inline-rename commit. Enables F2 / rename action. Return false to reject. |
| `onItemsDelete` | `(items) => void` | — | Delete intent. Enables the Delete key + default action. |
| `onItemsDuplicate` | `(items) => void` | — | Duplicate intent. Enables Ctrl/Cmd+D + default action. |
| `onCreateFolder` | `(parentFolderId) => void` | — | Create-folder intent. Enables the empty-area New-folder action. |
| `loading` | `boolean` | `false` | Show a loading placeholder. |
| `loadingItemCount` | `number` | `12` | How many placeholder cells to draw while loading. |
| `emptyState` | `ReactNode` | — | Override the default empty view. |
| `error` | `boolean \| ReactNode` | — | true → built-in error message; a node replaces it. Takes precedence over loading/empty. |
| `onErrorRetry` | `() => void` | — | Adds a Retry button to the built-in error state. |
| `labels` | `Partial` | — | Override any built-in UI string (i18n). Merged onto the English defaults. |
| `virtualized` | `boolean \| 'auto'` | `'auto'` | Grid windowing; engages above the threshold. |
| `virtualizationThreshold` | `number` | `200` | Item count above which auto windowing engages. |
| `overscanRows` | `number` | `4` | Off-screen rows kept mounted during windowing. |
| `showStatusBar` | `boolean` | `false` | Show the count/selection footer + thumbnail-size control. |
| `aria-label` | `string` | `'Asset browser'` | Accessible name for the root region. |
| `ref` | `Ref` | — | Imperative handle: focus, selectAll, clearSelection, scrollToItem, getSelectedItems, getElement. |
