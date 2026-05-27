# AssetBrowser

> Controlled content browser for files and folders — grid/list views, thumbnails, folder navigation, search, filter, sort, selection, and drag-and-drop.

The content browser of a professional editor — the surface that lists assets (textures, models, materials, audio, arbitrary files) and the folders that hold them, like the Unreal Content Browser or the Unity Project window. It composes the existing `DataTable` (list view), `Card` grid (grid view), `TreeView` (folder sidebar), and `Breadcrumbs` (path bar).

AssetBrowser is **controlled and presentational**: it does not own a filesystem. You feed it the contents of the _current folder_ plus a _folder tree_, and it reports navigation, selection, and drag intent through callbacks. Lazy loading and any backend (local FS, S3, an in-memory catalog) work out of the box.

**Live Preview**

## Import

```tsx
import { AssetBrowser } from 'entangle-ui';
import type { AssetItem, AssetPathSegment, AssetSortState } from 'entangle-ui';
```

## Usage

Pass the current folder's `items`, the `path` for the breadcrumb bar, and a `folderTree` for the sidebar. Respond to `onNavigate` by swapping `items` for the entered folder — AssetBrowser never walks a tree itself.

```tsx
const [folder, setFolder] = useState('root');
const [selection, setSelection] = useState<string[]>([]);

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
  onItemOpen={item => openAsset(item)}
/>;
```

Each entry is an `AssetItem` discriminated by `kind` (`'file'` or `'folder'`). Activating a folder (double-click / Enter) fires `onNavigate`; activating a file fires `onItemOpen`.

```tsx
const items: AssetItem[] = [
  { id: 'textures', name: 'Textures', kind: 'folder' },
  {
    id: 'wood',
    name: 'wood.png',
    kind: 'file',
    assetType: 'image',
    size: 204800,
    thumbnailUrl: '/thumbs/wood.png',
  },
];
```

## Views

Toggle between a thumbnail **grid** and a **list** with the toolbar control (or the `view` / `defaultView` props). The grid windows its rows so thousands of thumbnails stay smooth; the list reuses `DataTable`'s virtualization. Selection is preserved when you switch.

**Grid view**

**List view**

## Thumbnails

Resolution order is `renderThumbnail` → `thumbnailUrl` (lazy-loaded) → `item.icon` → a type-derived fallback icon. Use `renderThumbnail` for canvas-rendered previews (e.g. a 3D model preview):

```tsx
<AssetBrowser
  items={items}
  renderThumbnail={(item, { size }) => (
    <ModelPreview src={item.meta?.url} px={size} />
  )}
/>
```

## Selection

`selectionMode` is `'multiple'` by default (`'single'` or `false` also supported). Click replaces, Ctrl/Cmd-click toggles, Shift-click range-selects, and dragging in empty grid space draws a marquee. `onSelectionChange` reports the new ids plus a `reason`.

## Drag & drop

Provide `onItemsMove` to enable dropping items onto folders, and `onFilesImport` to accept OS files dropped onto the surface. Items are also draggable out with a configurable `dataTransfer` payload (`dragOutMimeType`). The actual move/import mutation is yours — AssetBrowser only reports intent.

```tsx
<AssetBrowser
  items={items}
  onItemsMove={({ itemIds, targetFolderId }) => move(itemIds, targetFolderId)}
  onFilesImport={({ files, targetFolderId }) => upload(files, targetFolderId)}
/>
```

## States

Set `loading` for a loading placeholder, or pass `emptyState` to override the default empty message shown when there are no items.

**Empty**

## Accessibility

- Grid view is a `role="grid"` with `aria-multiselectable`; cells are `role="gridcell"` with `aria-selected` and a roving tabindex.
- Arrow keys move focus in 2D; Home/End jump to the first/last item; PageUp/PageDown page by a viewport; Enter opens; Space toggles selection; Ctrl/Cmd+A selects all; Escape clears.
- The breadcrumb bar is a labelled `nav`; the current segment is `aria-current="page"`.
- A visually-hidden live region announces the item count and selection size.

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
| `sort` | `{ field, direction }` | — | Controlled sort state. |
| `onSortChange` | `(sort) => void` | — | Fired when sort changes. |
| `onNavigate` | `(folderId, source) => void` | — | Fired when the user enters a folder. |
| `onItemOpen` | `(item) => void` | — | Fired when a file is activated (double-click / Enter). |
| `columns` | `DataTableColumn[]` | — | Override the default list columns. |
| `onItemsMove` | `({ itemIds, targetFolderId }) => void` | — | Enables dropping items onto folders. |
| `onFilesImport` | `({ files, targetFolderId }) => void` | — | Enables external OS-file drop. |
| `renderThumbnail` | `(item, ctx) => ReactNode` | — | Custom thumbnail (e.g. canvas preview). |
| `renderItem` | `(item, state) => ReactNode` | — | Fully replace a grid cell's content. |
| `renderItemContextMenu` | `(items) => ReactNode` | — | Body of the item context menu. |
| `loading` | `boolean` | `false` | Show a loading placeholder. |
| `emptyState` | `ReactNode` | — | Override the default empty view. |
| `virtualized` | `boolean \| 'auto'` | `'auto'` | Grid windowing; engages above the threshold. |
| `virtualizationThreshold` | `number` | `200` | Item count above which auto windowing engages. |
| `showStatusBar` | `boolean` | `false` | Show the count/selection footer + thumbnail-size control. |
