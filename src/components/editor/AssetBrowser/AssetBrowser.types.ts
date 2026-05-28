import type React from 'react';
import type { Prettify, LiteralUnion } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import type { TreeNodeData } from '@/components/controls/TreeView';
import type {
  DataTableColumn,
  DataTableDensity,
} from '@/components/data/DataTable';

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
}

export interface AssetBrowserBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
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

  // ── States ───────────────────────────────────────────────────────────────
  loading?: boolean;
  loadingItemCount?: number;
  emptyState?: React.ReactNode;

  // ── Render props ──────────────────────────────────────────────────────────
  /** Custom thumbnail (e.g. canvas 3D preview). Falls back to thumbnailUrl → icon → type icon. */
  renderThumbnail?: (
    item: AssetItem,
    ctx: { size: number; selected: boolean }
  ) => React.ReactNode;
  /** Fully replace a grid cell's inner content (advanced). */
  renderItem?: (item: AssetItem, state: AssetItemState) => React.ReactNode;
  /** Returns the body of the item context menu (Menu.* children). Receives the selected items. */
  renderItemContextMenu?: (items: AssetItem[]) => React.ReactNode;
  /** Returns the body of the empty-area context menu. */
  renderEmptyContextMenu?: () => React.ReactNode;

  // ── Virtualization (grid) ─────────────────────────────────────────────────
  virtualized?: boolean | 'auto';
  virtualizationThreshold?: number;
  overscanRows?: number;

  // ── A11y ──────────────────────────────────────────────────────────────────
  'aria-label'?: string;

  /** Compound slots only (`AssetBrowser.Toolbar`, `AssetBrowser.Sidebar`). */
  children?: React.ReactNode;
}

export type AssetBrowserProps = Prettify<AssetBrowserBaseProps>;
