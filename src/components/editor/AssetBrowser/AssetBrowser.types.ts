import type { AssetBrowserLabels } from './assetBrowserLabels';
import type { TreeNodeData } from '@/components/controls/TreeView';
import type {
  DataTableColumn,
  DataTableDensity,
} from '@/components/data/DataTable';
import type { BaseComponent } from '@/types/common';
import type { Prettify, LiteralUnion } from '@/types/utilities';
import type React from 'react';

/** Whether an entry is a file/asset or a navigable folder. */
export type AssetKind = 'file' | 'folder';

/** Well-known asset types. Extensible — consumers may pass any string. */
export type AssetType = LiteralUnion<
  | 'image'
  | 'model'
  | 'material'
  | 'audio'
  | 'video'
  | 'text'
  | 'scene'
  | 'unknown'
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
  /** Image thumbnail URL for grid view. */
  thumbnailUrl?: string;
  /** Explicit icon override (files without a thumbnail, and folders). */
  icon?: React.ReactNode;
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
  'name' | 'type' | 'size' | 'modified'
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

/** Why a selection change fired — useful for analytics & undo. */
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
  /** Index within the displayed (filtered + sorted) list. */
  index: number;
  view: AssetView;
  /** A drag is currently hovering this item as a drop target. */
  dropTarget: boolean;
}

/** Imperative handle exposed via `ref`. */
export interface AssetBrowserHandle {
  focus: () => void;
  getElement: () => HTMLDivElement | null;
  selectAll: () => void;
  clearSelection: () => void;
  scrollToItem: (id: string) => void;
  getSelectedItems: () => AssetItem[];
  /**
   * Put the item into inline-rename mode (scrolls it into view + focuses the
   * field). No-op when `onItemRename` isn't set. Use after inserting a new
   * folder/file to immediately let the user name it.
   */
  beginRename: (id: string) => void;
}

/**
 * Return value of `onItemRename`. Return / resolve `false` to reject the new
 * name and keep the inline editor open; anything else — including returning
 * nothing — accepts it. `void` is a member so the common "just apply it"
 * handler needs no `return`; TS's void-assignability special case does not
 * fire when a union also contains a `Promise`, so it must be explicit here.
 */
// prettier-ignore
export type AssetRenameResult =
  | boolean
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- `void` is required so a no-return rename handler stays assignable (the Promise member defeats TS's implicit void-return rule)
  | void
  | Promise<boolean | undefined>;

/**
 * Mutation actions handed to `renderItemContextMenu`, so a custom menu can wire
 * the built-in flows without juggling a ref. Each is a no-op when its backing
 * callback (`onItemRename` / `onItemsDelete` / `onItemsDuplicate`) is absent.
 */
export interface AssetItemActions {
  /** The items the action applies to (the right-clicked selection). */
  items: AssetItem[];
  /** Enter inline-rename on the first item. */
  rename: () => void;
  /** Delete `items` via `onItemsDelete`. */
  delete: () => void;
  /** Duplicate `items` via `onItemsDuplicate`. */
  duplicate: () => void;
}

export interface AssetBrowserBaseProps extends Omit<
  BaseComponent,
  'ref' | 'onChange'
> {
  ref?: React.Ref<AssetBrowserHandle>;

  // ── Data ──────────────────────────────────────────────────────────────
  /** Direct children of the current folder (files + sub-folders). */
  items: readonly AssetItem[];
  /** Current location, oldest → newest. Drives the breadcrumb bar. */
  path?: readonly AssetPathSegment[];
  /** Folder hierarchy for the sidebar. Reuses TreeView's node shape. Omit to hide the sidebar. */
  folderTree?: readonly TreeNodeData[];
  /** Id of the folder currently shown. Highlights the sidebar node. */
  currentFolderId?: string;

  // ── View ──────────────────────────────────────────────────────────────
  view?: AssetView;
  defaultView?: AssetView;
  onViewChange?: (view: AssetView) => void;
  thumbnailSize?: AssetThumbnailSize;
  defaultThumbnailSize?: AssetThumbnailSize;
  onThumbnailSizeChange?: (size: AssetThumbnailSize) => void;
  /** List-view row density (passthrough to DataTable). @default "comfortable" */
  density?: DataTableDensity;
  /** Show the "N items · M selected" footer + thumbnail-size control. @default false */
  showStatusBar?: boolean;

  // ── Selection ─────────────────────────────────────────────────────────
  selectionMode?: 'single' | 'multiple' | false;
  selection?: readonly string[];
  defaultSelection?: readonly string[];
  onSelectionChange?: (
    ids: string[],
    meta: { reason: AssetSelectionReason }
  ) => void;
  /** Rubber-band marquee selection in grid empty space. @default true for 'multiple' */
  marquee?: boolean;

  // ── Search / filter / sort ──────────────────────────────────────────────
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (query: string) => void;
  /** When true, the consumer pre-filters `items` by name. @default false */
  manualSearch?: boolean;
  filters?: AssetFilterState;
  defaultFilters?: AssetFilterState;
  onFiltersChange?: (filters: AssetFilterState) => void;
  manualFilter?: boolean;
  /** Type values offered in the filter menu. Defaults to distinct `assetType`s in `items`. */
  filterableTypes?: AssetType[];
  sort?: AssetSortState;
  defaultSort?: AssetSortState;
  manualSort?: boolean;
  onSortChange?: (sort: AssetSortState) => void;

  // ── Navigation ───────────────────────────────────────────────────────────
  /** Fires when the user enters a folder (open / breadcrumb / sidebar / history). */
  onNavigate?: (folderId: string, source: AssetNavigationSource) => void;
  /** Fires when a FILE is activated (double-click / Enter). Folders go through onNavigate. */
  onItemOpen?: (item: AssetItem) => void;
  /** Enable Back/Forward + Backspace-to-parent. @default false */
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
  /** MIME type used when dragging items out. @default 'application/x-entangle-asset' */
  dragOutMimeType?: string;
  /** Override the drag-out dataTransfer payload. */
  getDragData?: (items: AssetItem[]) => Record<string, string>;
  onItemDragStart?: (items: AssetItem[], event: React.DragEvent) => void;
  onItemDragEnd?: (items: AssetItem[], event: React.DragEvent) => void;

  // ── Mutations ──────────────────────────────────────────────────────────────
  /**
   * Inline-rename commit. Fires when the user confirms a new name (Enter / blur
   * with a changed, non-empty value). Presence enables the rename affordance
   * (F2, double-click-to-rename, the `Rename` default action, and
   * `handle.beginRename`). Return / resolve `false` to reject the name and keep
   * the editor open (e.g. failed validation); `void` / `true` accepts it. Apply
   * the rename to your data source — AssetBrowser only reports intent.
   */
  onItemRename?: (item: AssetItem, newName: string) => AssetRenameResult;
  /** Delete intent for the acted-on items (the selection). Enables Delete key + default action. */
  onItemsDelete?: (items: AssetItem[]) => void;
  /** Create-folder intent in the current folder. Enables the empty-area `New folder` default action. */
  onCreateFolder?: (parentFolderId: string | null) => void;
  /** Duplicate intent for the acted-on items. Enables Ctrl/Cmd+D + default action. */
  onItemsDuplicate?: (items: AssetItem[]) => void;
  /**
   * Auto-populate the item / empty-area context menus with Rename / Duplicate /
   * Delete / New folder entries for whichever mutation callbacks are present.
   * Ignored for a menu you supply yourself via `renderItemContextMenu` /
   * `renderEmptyContextMenu`. @default false
   */
  defaultItemActions?: boolean;

  // ── States ───────────────────────────────────────────────────────────────
  loading?: boolean;
  /** Number of skeleton cells shown in grid view while `loading`. @default 12 */
  loadingItemCount?: number;
  emptyState?: React.ReactNode;
  /**
   * Error state. `true` renders the built-in error message (with a Retry button
   * when `onErrorRetry` is set); any other `ReactNode` fully replaces it;
   * `false` / `undefined` means no error. Takes precedence over `loading` and
   * the empty state. (Typed as `ReactNode`, which subsumes `boolean`.)
   */
  error?: React.ReactNode;
  /** Retry handler shown as a button in the built-in error state (`error={true}`). */
  onErrorRetry?: () => void;

  // ── Render props ──────────────────────────────────────────────────────────
  /** Custom thumbnail (e.g. canvas 3D preview). Falls back to thumbnailUrl → icon → type icon. */
  renderThumbnail?: (
    item: AssetItem,
    ctx: { size: number; selected: boolean }
  ) => React.ReactNode;
  /** Fully replace a grid cell's inner content (advanced). */
  renderItem?: (item: AssetItem, state: AssetItemState) => React.ReactNode;
  /**
   * Returns the body of the item context menu (`Menu.*` children). Receives the
   * acted-on items (the whole selection when right-clicking a selected item,
   * else just that item) plus an `actions` object wiring the built-in
   * rename / delete / duplicate flows.
   */
  renderItemContextMenu?: (
    items: AssetItem[],
    actions: AssetItemActions
  ) => React.ReactNode;
  /** Returns the body of the empty-area context menu. */
  renderEmptyContextMenu?: () => React.ReactNode;

  // ── Virtualization (grid) ─────────────────────────────────────────────────
  virtualized?: boolean | 'auto';
  virtualizationThreshold?: number;
  overscanRows?: number;

  // ── A11y ──────────────────────────────────────────────────────────────────
  'aria-label'?: string;

  // ── i18n ──────────────────────────────────────────────────────────────────
  /**
   * Override any of the built-in English UI strings (search placeholder, sort /
   * filter menus, empty / loading / error messages, column headers, the live
   * announcement, …). Merged onto the defaults, so you can translate a subset.
   */
  labels?: Partial<AssetBrowserLabels>;

  /** Compound slots only (`AssetBrowser.Toolbar`, `AssetBrowser.Sidebar`). */
  children?: React.ReactNode;
}

export type AssetBrowserProps = Prettify<AssetBrowserBaseProps>;
