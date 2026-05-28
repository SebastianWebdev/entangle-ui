'use client';

import React, { useMemo, useRef, type ReactNode } from 'react';
import { Icon } from '@/components/primitives/Icon';
import { CloudUploadIcon } from '@/components/Icons';
import { cx } from '@/utils/cx';
import type { AssetBrowserProps } from './AssetBrowser.types';
import {
  AssetBrowserChromeContext,
  AssetBrowserContext,
  AssetBrowserStoreContext,
  useAssetDrag,
  type AssetBrowserChromeValue,
  type AssetBrowserContextValue,
} from './AssetBrowserContext';
import { AssetBrowserStore } from './AssetBrowserStore';
import { AssetBrowserToolbar } from './AssetBrowserToolbar';
import { AssetBrowserBreadcrumbs } from './AssetBrowserBreadcrumbs';
import { AssetBrowserSidebar } from './AssetBrowserSidebar';
import { AssetBrowserContent } from './AssetBrowserContent';
import { AssetBrowserStatusBar } from './AssetBrowserStatusBar';
import { useAssetDnd } from './useAssetDnd';
import { useAssetNavigation } from './useAssetNavigation';
import { useAssetSelectionController } from './useAssetSelectionController';
import { useAssetBrowserViewState } from './useAssetBrowserViewState';
import { useAssetBrowserHandle } from './useAssetBrowserHandle';
import { getSlotKind, markSlot } from './slots';
import { body, importOverlay, main, root, srOnly } from './AssetBrowser.css';

const DEFAULT_MIME = 'application/x-entangle-asset';

function ImportOverlay(): React.ReactElement | null {
  const drag = useAssetDrag();
  if (!drag.externalOver) return null;
  return (
    <div className={importOverlay}>
      <Icon size="lg" decorative>
        <CloudUploadIcon />
      </Icon>
      <span>Drop files to import</span>
    </div>
  );
}

interface SlotProps {
  children?: ReactNode;
}

const ToolbarSlot = markSlot(
  (() => null) as (props: SlotProps) => null,
  'toolbar'
);
const SidebarSlot = markSlot(
  (() => null) as (props: SlotProps) => null,
  'sidebar'
);

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
  const store = useMemo(() => new AssetBrowserStore(), []);

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
      columns,
      dnd,
      virtualized,
      virtualizationThreshold,
      overscanRows,
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
      columns,
      dnd,
      virtualized,
      virtualizationThreshold,
      overscanRows,
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
    ]
  );

  // Slot extraction.
  let toolbarSlot: ReactNode = null;
  let sidebarSlot: ReactNode = null;
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const kind = getSlotKind(child);
    const slotChildren = (child.props as SlotProps).children;
    if (kind === 'toolbar') toolbarSlot = slotChildren;
    else if (kind === 'sidebar') sidebarSlot = slotChildren;
  });

  const announcement = `${displayed.length} item${displayed.length === 1 ? '' : 's'}${
    selectionSet.size > 0 ? `, ${selectionSet.size} selected` : ''
  }`;

  return (
    <AssetBrowserStoreContext.Provider value={store}>
      <AssetBrowserChromeContext.Provider value={chromeValue}>
        <AssetBrowserContext.Provider value={itemValue}>
          <div
            ref={rootRef}
            className={cx(root, className)}
            style={style}
            data-testid={testId}
            tabIndex={-1}
            aria-label={ariaLabel}
            onKeyDown={handleRootKeyDown}
            {...rest}
          >
            {toolbarSlot ?? <AssetBrowserToolbar />}
            <AssetBrowserBreadcrumbs />
            <div className={body}>
              {sidebarSlot ?? <AssetBrowserSidebar />}
              <div
                className={main}
                onDragOver={dnd.onSurfaceDragOver}
                onDragLeave={dnd.onSurfaceDragLeave}
                onDrop={dnd.onSurfaceDrop}
              >
                <AssetBrowserContent />
                <ImportOverlay />
              </div>
            </div>
            {showStatusBar && (
              <AssetBrowserStatusBar
                announcement={announcement}
                thumbnailSize={thumbnailSize}
                setThumbnailSize={setThumbnailSize}
              />
            )}
            <div className={srOnly} aria-live="polite" role="status">
              {announcement}
            </div>
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
