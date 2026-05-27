'use client';

import type React from 'react';
import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type {
  DataTableColumn,
  DataTableDensity,
} from '@/components/data/DataTable';
import type { TreeNodeData } from '@/components/controls/TreeView';
import type {
  AssetBrowserStore,
  DragState,
  MarqueeState,
} from './AssetBrowserStore';
import type {
  AssetFilterState,
  AssetItem,
  AssetItemState,
  AssetNavigationSource,
  AssetPathSegment,
  AssetSortState,
  AssetThumbnailSize,
  AssetView,
} from './AssetBrowser.types';

// ── Store context (hot path) ─────────────────────────────────────────────

export const AssetBrowserStoreContext =
  /*#__PURE__*/ createContext<AssetBrowserStore | null>(null);

export function useAssetBrowserStore(): AssetBrowserStore {
  const store = useContext(AssetBrowserStoreContext);
  if (!store) {
    throw new Error(
      'AssetBrowser slice hooks must be used inside an <AssetBrowser> subtree.'
    );
  }
  return store;
}

export function useAssetFocus(): string | null {
  const store = useAssetBrowserStore();
  return useSyncExternalStore(store.subscribeFocus, store.getFocusedId);
}

export function useAssetMarquee(): MarqueeState {
  const store = useAssetBrowserStore();
  return useSyncExternalStore(store.subscribeMarquee, store.getMarquee);
}

export function useAssetDrag(): DragState {
  const store = useAssetBrowserStore();
  return useSyncExternalStore(store.subscribeDrag, store.getDrag);
}

// ── Config / handler context (low frequency) ───────────────────────────────

export interface AssetDndContext {
  internalEnabled: boolean;
  externalEnabled: boolean;
  onItemDragStart: (item: AssetItem, event: React.DragEvent) => void;
  onItemDragEnd: (item: AssetItem, event: React.DragEvent) => void;
  onFolderDragOver: (folderId: string, event: React.DragEvent) => void;
  onFolderDragLeave: (folderId: string, event: React.DragEvent) => void;
  onFolderDrop: (folderId: string, event: React.DragEvent) => void;
  onSurfaceDragOver: (event: React.DragEvent) => void;
  onSurfaceDragLeave: (event: React.DragEvent) => void;
  onSurfaceDrop: (event: React.DragEvent) => void;
}

export interface AssetBrowserContextValue {
  // data
  displayedItems: readonly AssetItem[];
  rawCount: number;

  // view config
  view: AssetView;
  setView: (view: AssetView) => void;
  thumbnailSize: AssetThumbnailSize;
  thumbnailSizePx: number;
  setThumbnailSize: (size: AssetThumbnailSize) => void;
  density: DataTableDensity;

  // selection
  selectionMode: 'single' | 'multiple' | false;
  selection: ReadonlySet<string>;
  selectionCount: number;

  // search / filter / sort
  search: string;
  setSearch: (query: string) => void;
  filters: AssetFilterState;
  setFilters: (filters: AssetFilterState) => void;
  filterableTypes: string[];
  sort: AssetSortState;
  setSort: (sort: AssetSortState) => void;

  // interaction handlers
  handleItemClick: (
    item: AssetItem,
    index: number,
    event: React.MouseEvent
  ) => void;
  activateItem: (item: AssetItem) => void;
  selectAll: () => void;
  clearSelection: () => void;
  contextMenuSelect: (item: AssetItem, index: number) => void;

  // navigation
  path: readonly AssetPathSegment[];
  folderTree?: readonly TreeNodeData[];
  currentFolderId?: string;
  navigate: (folderId: string, source: AssetNavigationSource) => void;

  // render props
  renderThumbnail?: (
    item: AssetItem,
    ctx: { size: number; selected: boolean }
  ) => ReactNode;
  renderItem?: (item: AssetItem, state: AssetItemState) => ReactNode;
  renderItemContextMenu?: (items: AssetItem[]) => ReactNode;
  renderEmptyContextMenu?: () => ReactNode;

  // states
  loading: boolean;
  loadingItemCount: number;
  emptyState?: ReactNode;
  columns?: readonly DataTableColumn<AssetItem>[];

  // drag & drop
  dnd: AssetDndContext;

  // virtualization
  virtualized: boolean | 'auto';
  virtualizationThreshold: number;
  overscanRows: number;
}

export const AssetBrowserContext =
  /*#__PURE__*/ createContext<AssetBrowserContextValue | null>(null);

export function useAssetBrowserContext(): AssetBrowserContextValue {
  const value = useContext(AssetBrowserContext);
  if (!value) {
    throw new Error(
      'AssetBrowser subcomponents must be used inside an <AssetBrowser>.'
    );
  }
  return value;
}
