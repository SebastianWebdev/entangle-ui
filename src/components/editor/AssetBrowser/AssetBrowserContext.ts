'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

import type {
  AssetFilterState,
  AssetItem,
  AssetItemState,
  AssetNavigationSource,
  AssetPathSegment,
  AssetSelectionReason,
  AssetSortState,
  AssetView,
} from './AssetBrowser.types';
import type { AssetBrowserLabels } from './assetBrowserLabels';
import type {
  AssetBrowserStore,
  DragState,
  MarqueeState,
} from './AssetBrowserStore';
import type { TreeNodeData } from '@/components/controls/TreeView';
import type {
  DataTableColumn,
  DataTableDensity,
} from '@/components/data/DataTable';
import type { ReactNode } from 'react';
import type React from 'react';

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

/**
 * Per-id focus slice: `true` only for the roving-focus item. Returns a boolean
 * so arrow-key navigation re-renders just the two affected cells, not the whole
 * grid.
 */
export function useAssetFocused(id: string): boolean {
  const store = useAssetBrowserStore();
  return useSyncExternalStore(
    store.subscribeFocus,
    () => store.getFocusedId() === id
  );
}

export function useAssetMarquee(): MarqueeState {
  const store = useAssetBrowserStore();
  return useSyncExternalStore(store.subscribeMarquee, store.getMarquee);
}

export function useAssetDrag(): DragState {
  const store = useAssetBrowserStore();
  return useSyncExternalStore(store.subscribeDrag, store.getDrag);
}

/** Per-id drop-target slice: `true` while an active drag hovers this folder. */
export function useAssetDropTarget(id: string): boolean {
  const store = useAssetBrowserStore();
  return useSyncExternalStore(store.subscribeDrag, () => {
    const drag = store.getDrag();
    return drag.active && drag.dropTargetId === id;
  });
}

/** The full selection set (whole-set consumers: list view, status bar). */
export function useAssetSelection(): ReadonlySet<string> {
  const store = useAssetBrowserStore();
  return useSyncExternalStore(store.subscribeSelection, store.getSelection);
}

/**
 * Per-id selection slice. Returns a boolean so selecting an item re-renders
 * only the cells whose state actually flipped.
 */
export function useAssetSelected(id: string): boolean {
  const store = useAssetBrowserStore();
  return useSyncExternalStore(store.subscribeSelection, () =>
    store.getSelection().has(id)
  );
}

// ── Item context (data + interaction; consumed by every grid cell) ──────────

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

  // layout / mode (read by cells)
  thumbnailSizePx: number;
  density: DataTableDensity;
  selectionMode: 'single' | 'multiple' | false;
  /** Whether rubber-band marquee selection is active (multiple + `marquee`). */
  marqueeEnabled: boolean;

  // interaction handlers
  handleItemClick: (
    item: AssetItem,
    index: number,
    event: React.MouseEvent
  ) => void;
  activateItem: (item: AssetItem) => void;
  selectAll: () => void;
  clearSelection: () => void;
  contextMenuSelect: (item: AssetItem) => void;
  /** Select-or-extend driven by keyboard navigation over displayed order. */
  selectByKeyboard: (index: number, extend: boolean) => void;
  /** Toggle a single id (Space / Ctrl-click parity). */
  toggleSelectId: (id: string) => void;
  /** Replace selection with a raw id list (DataTable bridge). */
  setSelectionIds: (ids: string[], reason: AssetSelectionReason) => void;
  /** Commit a marquee result (additive merges with current selection). */
  commitMarquee: (ids: string[], additive: boolean) => void;

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
  error?: ReactNode;
  onErrorRetry?: () => void;
  columns?: readonly DataTableColumn<AssetItem>[];

  // drag & drop
  dnd: AssetDndContext;

  // virtualization
  virtualized: boolean | 'auto';
  virtualizationThreshold: number;
  overscanRows: number;

  // i18n (resolved: defaults merged with the consumer's overrides)
  labels: AssetBrowserLabels;
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

// ── Chrome context (view / search / filter / sort / history) ────────────────
// Split from the item context so typing in the search box (a per-keystroke
// update) re-renders only the toolbar, not every grid cell.

export interface AssetBrowserChromeValue {
  view: AssetView;
  setView: (view: AssetView) => void;

  search: string;
  setSearch: (query: string) => void;
  filters: AssetFilterState;
  setFilters: (filters: AssetFilterState) => void;
  filterableTypes: string[];
  sort: AssetSortState;
  setSort: (sort: AssetSortState) => void;

  // history (only meaningful when the `history` prop is enabled)
  history: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;

  // i18n (resolved: defaults merged with the consumer's overrides)
  labels: AssetBrowserLabels;
}

export const AssetBrowserChromeContext =
  /*#__PURE__*/ createContext<AssetBrowserChromeValue | null>(null);

export function useAssetBrowserChrome(): AssetBrowserChromeValue {
  const value = useContext(AssetBrowserChromeContext);
  if (!value) {
    throw new Error(
      'AssetBrowser chrome subcomponents must be used inside an <AssetBrowser>.'
    );
  }
  return value;
}
