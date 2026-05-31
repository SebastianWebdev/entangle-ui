'use client';

import React, { useMemo, useRef, useState } from 'react';

import { cx } from '@/utils/cx';

import { body, root } from './AssetBrowser.css';
import { AssetBrowserAnnouncementLive } from './AssetBrowserAnnouncementLive';
import { AssetBrowserBreadcrumbs } from './AssetBrowserBreadcrumbs';
import {
  AssetBrowserChromeContext,
  AssetBrowserContext,
  AssetBrowserStoreContext,
} from './AssetBrowserContext';
import { resolveLabels } from './assetBrowserLabels';
import { AssetBrowserSidebar } from './AssetBrowserSidebar';
import { AssetBrowserStatusBar } from './AssetBrowserStatusBar';
import { AssetBrowserStore } from './AssetBrowserStore';
import { AssetBrowserSurface } from './AssetBrowserSurface';
import { AssetBrowserToolbar } from './AssetBrowserToolbar';
import { getSlotKind, markSlot } from './slots';
import { useAssetBrowserHandle } from './useAssetBrowserHandle';
import { useAssetBrowserViewState } from './useAssetBrowserViewState';
import { useAssetDnd } from './useAssetDnd';
import { useAssetNavigation } from './useAssetNavigation';
import { useAssetSelectionController } from './useAssetSelectionController';

import type { AssetBrowserProps } from './AssetBrowser.types';
import type {
  AssetBrowserChromeValue,
  AssetBrowserContextValue,
} from './AssetBrowserContext';
import type { ReactNode } from 'react';

const DEFAULT_MIME = 'application/x-entangle-asset';

interface SlotProps {
  children?: ReactNode;
}

const ToolbarSlot = markSlot(() => null, 'toolbar');
const SidebarSlot = markSlot(() => null, 'sidebar');

/**
 * Pull the optional `Toolbar` / `Sidebar` slot children out of `children`.
 * Returns through an explicit type so the slots stay `ReactNode` at the call
 * site (a `let x: ReactNode = null` assigned only inside the forEach callback
 * would otherwise stay flow-narrowed to `null`).
 */
function extractSlots(children: ReactNode): {
  toolbarSlot: ReactNode;
  sidebarSlot: ReactNode;
} {
  let toolbarSlot: ReactNode = null;
  let sidebarSlot: ReactNode = null;
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const kind = getSlotKind(child);
    const slotChildren = (child.props as SlotProps).children;
    if (kind === 'toolbar') toolbarSlot = slotChildren;
    else if (kind === 'sidebar') sidebarSlot = slotChildren;
  });
  return { toolbarSlot, sidebarSlot };
}

function AssetBrowserRoot(props: AssetBrowserProps): React.ReactElement {
  const {
    items,
    path = [],
    folderTree,
    currentFolderId,
    selectionMode = 'multiple',
    density = 'comfortable',
    showStatusBar = false,
    manualSearch = false,
    manualFilter = false,
    manualSort = false,
    filterableTypes: filterableTypesProp,
    loading = false,
    loadingItemCount = 12,
    emptyState,
    error,
    onErrorRetry,
    columns,
    marquee = true,
    history = false,
    renderThumbnail,
    renderItem,
    renderItemContextMenu,
    renderEmptyContextMenu,
    virtualized = 'auto',
    virtualizationThreshold = 200,
    overscanRows = 4,
    dragOutMimeType = DEFAULT_MIME,
    getDragData,
    onItemDragStart,
    onItemDragEnd,
    onItemsMove,
    onFilesImport,
    className,
    style,
    testId,
    children,
    ref,
    labels: labelsProp,
    'aria-label': ariaLabel = 'Asset browser',
    // Controlled-state props — destructured so they don't leak onto the DOM
    // root via `...rest`. Consumed by the view-state / selection / navigation
    // hooks below.
    view: viewProp,
    defaultView,
    onViewChange,
    thumbnailSize: thumbnailSizeProp,
    defaultThumbnailSize,
    onThumbnailSizeChange,
    search: searchProp,
    defaultSearch,
    onSearchChange,
    filters: filtersProp,
    defaultFilters,
    onFiltersChange,
    sort: sortProp,
    defaultSort,
    onSortChange,
    selection: selectionProp,
    defaultSelection,
    onSelectionChange,
    onItemOpen,
    onNavigate,
    ...rest
  } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  // Lazy `useState` initializer (not `useMemo`) so the per-instance store
  // identity is guaranteed stable for the component's lifetime — `useMemo` may
  // legally drop its cache, which would orphan every slice subscription. Mirrors
  // `useNavigationHistory`'s store-creation idiom.
  const [store] = useState(() => new AssetBrowserStore());

  const labels = useMemo(() => resolveLabels(labelsProp), [labelsProp]);

  const {
    view,
    setView,
    thumbnailSize,
    setThumbnailSize,
    thumbnailSizePx,
    search,
    setSearch,
    filters,
    setFilters,
    sort,
    setSort,
    filterableTypes,
    displayed,
    marqueeEnabled,
  } = useAssetBrowserViewState({
    items,
    selectionMode,
    marquee,
    view: viewProp,
    defaultView,
    onViewChange,
    thumbnailSize: thumbnailSizeProp,
    defaultThumbnailSize,
    onThumbnailSizeChange,
    search: searchProp,
    defaultSearch,
    onSearchChange,
    manualSearch,
    filters: filtersProp,
    defaultFilters,
    onFiltersChange,
    manualFilter,
    sort: sortProp,
    defaultSort,
    onSortChange,
    manualSort,
    filterableTypesProp,
  });

  const { selectionSet, handlers } = useAssetSelectionController({
    store,
    displayed,
    selectionMode,
    selection: selectionProp,
    defaultSelection,
    onSelectionChange,
  });

  const {
    navigate,
    activateItem,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    handleRootKeyDown,
  } = useAssetNavigation({
    history,
    path,
    currentFolderId,
    onNavigate,
    onItemOpen,
  });

  const dnd = useAssetDnd({
    store,
    mime: dragOutMimeType,
    items,
    selection: selectionSet,
    currentFolderId,
    getDragData,
    onItemDragStart,
    onItemDragEnd,
    onItemsMove,
    onFilesImport,
  });

  useAssetBrowserHandle({
    ref,
    rootRef,
    store,
    items,
    displayed,
    selectAll: handlers.selectAll,
    clearSelection: handlers.clearSelection,
  });

  // Render-props are forwarded through the item context as-is. They are called
  // during render (by grid/list cells), so they can't be stabilized with a
  // render-phase ref write (react-hooks/refs) or `useLatest` (its ref updates
  // in an effect, one render late). Consumers that pass inline render-props and
  // care about per-cell render cost should memoize them, mirroring `TreeView`.
  const itemValue = useMemo<AssetBrowserContextValue>(
    () => ({
      displayedItems: displayed,
      thumbnailSizePx,
      density,
      selectionMode,
      marqueeEnabled,
      handleItemClick: handlers.handleItemClick,
      activateItem,
      selectAll: handlers.selectAll,
      clearSelection: handlers.clearSelection,
      contextMenuSelect: handlers.contextMenuSelect,
      selectByKeyboard: handlers.selectByKeyboard,
      toggleSelectId: handlers.toggleSelectId,
      setSelectionIds: handlers.setSelectionIds,
      commitMarquee: handlers.commitMarquee,
      path,
      folderTree,
      currentFolderId,
      navigate,
      renderThumbnail,
      renderItem,
      renderItemContextMenu,
      renderEmptyContextMenu,
      loading,
      loadingItemCount,
      emptyState,
      error,
      onErrorRetry,
      columns,
      dnd,
      virtualized,
      virtualizationThreshold,
      overscanRows,
      labels,
    }),
    [
      displayed,
      thumbnailSizePx,
      density,
      selectionMode,
      marqueeEnabled,
      handlers,
      activateItem,
      path,
      folderTree,
      currentFolderId,
      navigate,
      renderThumbnail,
      renderItem,
      renderItemContextMenu,
      renderEmptyContextMenu,
      loading,
      loadingItemCount,
      emptyState,
      error,
      onErrorRetry,
      columns,
      dnd,
      virtualized,
      virtualizationThreshold,
      overscanRows,
      labels,
    ]
  );

  const chromeValue = useMemo<AssetBrowserChromeValue>(
    () => ({
      view,
      setView,
      search,
      setSearch,
      filters,
      setFilters,
      filterableTypes,
      sort,
      setSort,
      history,
      canGoBack,
      canGoForward,
      goBack,
      goForward,
      labels,
    }),
    [
      view,
      setView,
      search,
      setSearch,
      filters,
      setFilters,
      filterableTypes,
      sort,
      setSort,
      history,
      canGoBack,
      canGoForward,
      goBack,
      goForward,
      labels,
    ]
  );

  // Slot extraction.
  const { toolbarSlot, sidebarSlot } = extractSlots(children);

  return (
    <AssetBrowserStoreContext.Provider value={store}>
      <AssetBrowserChromeContext.Provider value={chromeValue}>
        <AssetBrowserContext.Provider value={itemValue}>
          {/* The root is a labelled region that hosts the asset-browser widget;
              its onKeyDown adds widget-level shortcuts (Backspace / Alt+ArrowUp
              → parent folder), so the handler on a non-interactive role is
              intentional. */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <div
            ref={rootRef}
            className={cx(root, className)}
            style={style}
            data-testid={testId}
            role="region"
            tabIndex={-1}
            aria-label={ariaLabel}
            onKeyDown={handleRootKeyDown}
            {...rest}
          >
            {toolbarSlot ?? <AssetBrowserToolbar />}
            <AssetBrowserBreadcrumbs />
            <div className={body}>
              {sidebarSlot ?? <AssetBrowserSidebar />}
              <AssetBrowserSurface
                onDragOver={dnd.onSurfaceDragOver}
                onDragLeave={dnd.onSurfaceDragLeave}
                onDrop={dnd.onSurfaceDrop}
              />
            </div>
            {showStatusBar && (
              <AssetBrowserStatusBar
                view={view}
                thumbnailSize={thumbnailSize}
                setThumbnailSize={setThumbnailSize}
              />
            )}
            <AssetBrowserAnnouncementLive />
          </div>
        </AssetBrowserContext.Provider>
      </AssetBrowserChromeContext.Provider>
    </AssetBrowserStoreContext.Provider>
  );
}

AssetBrowserRoot.displayName = 'AssetBrowser';

export const AssetBrowser = /*#__PURE__*/ Object.assign(AssetBrowserRoot, {
  Toolbar: ToolbarSlot,
  Sidebar: SidebarSlot,
});
