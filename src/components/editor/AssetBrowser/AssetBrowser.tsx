'use client';

import React, {
  useDeferredValue,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useControlledState, useLatest } from '@/hooks';
import { EmptyState } from '@/components/feedback/EmptyState';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/navigation/SegmentedControl';
import { Icon } from '@/components/primitives/Icon';
import { CloudUploadIcon } from '@/components/Icons';
import { cx } from '@/utils/cx';
import type {
  AssetBrowserHandle,
  AssetBrowserProps,
  AssetFilterState,
  AssetSortState,
  AssetThumbnailSize,
  AssetView,
} from './AssetBrowser.types';
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
import { AssetBrowserGrid } from './AssetBrowserGrid';
import { AssetBrowserList } from './AssetBrowserList';
import { useAssetDnd } from './useAssetDnd';
import { useAssetNavigation } from './useAssetNavigation';
import { useAssetSelectionController } from './useAssetSelectionController';
import { collectTypes, shapeAssets } from './assetBrowserFilter';
import { resolveThumbPx } from './assetBrowserGeometry';
import { getSlotKind, markSlot } from './slots';
import {
  body,
  emptyText,
  emptyWrap,
  importOverlay,
  main,
  root,
  srOnly,
  statusBar,
  statusSpacer,
} from './AssetBrowser.css';

const DEFAULT_MIME = 'application/x-entangle-asset';
const DEFAULT_SORT: AssetSortState = { field: 'name', direction: 'asc' };

function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, '\\$&');
}

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
    // root via `...rest`.
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

  const [view, setView] = useControlledState<AssetView>({
    value: viewProp,
    defaultValue: defaultView,
    onChange: onViewChange,
    fallback: 'grid',
  });
  const [thumbnailSize, setThumbnailSize] =
    useControlledState<AssetThumbnailSize>({
      value: thumbnailSizeProp,
      defaultValue: defaultThumbnailSize,
      onChange: onThumbnailSizeChange,
      fallback: 'md',
    });
  const [search, setSearch] = useControlledState<string>({
    value: searchProp,
    defaultValue: defaultSearch,
    onChange: onSearchChange,
    fallback: '',
  });
  const [filters, setFilters] = useControlledState<AssetFilterState>({
    value: filtersProp,
    defaultValue: defaultFilters,
    onChange: onFiltersChange,
    fallback: {},
  });
  const [sort, setSort] = useControlledState<AssetSortState>({
    value: sortProp,
    defaultValue: defaultSort,
    onChange: onSortChange,
    fallback: DEFAULT_SORT,
  });

  const deferredSearch = useDeferredValue(search);
  const thumbnailSizePx = resolveThumbPx(thumbnailSize);
  const marqueeEnabled = selectionMode === 'multiple' && marquee !== false;

  const filterableTypes = useMemo(
    () => filterableTypesProp ?? collectTypes(items),
    [filterableTypesProp, items]
  );

  const displayed = useMemo(
    () =>
      shapeAssets(items, {
        search: deferredSearch,
        filters,
        sort,
        manualSearch,
        manualFilter,
        manualSort,
      }),
    [
      items,
      deferredSearch,
      filters,
      sort,
      manualSearch,
      manualFilter,
      manualSort,
    ]
  );

  const itemsRef = useLatest(items);
  const displayedRef = useLatest(displayed);

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

  useImperativeHandle(
    ref,
    (): AssetBrowserHandle => ({
      focus: () => rootRef.current?.focus(),
      getElement: () => rootRef.current,
      selectAll: handlers.selectAll,
      clearSelection: handlers.clearSelection,
      scrollToItem: (id: string) => {
        store.setFocusedId(id);
        const index = displayedRef.current.findIndex(it => it.id === id);
        if (index >= 0 && store.scrollToIndex(index)) return;
        const el = rootRef.current?.querySelector(
          `[data-asset-id="${cssEscape(id)}"]`
        );
        el?.scrollIntoView({ block: 'nearest' });
      },
      getSelectedItems: () =>
        itemsRef.current.filter(it => store.getSelection().has(it.id)),
    }),
    [handlers.selectAll, handlers.clearSelection, store, itemsRef, displayedRef]
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

  let content: ReactNode;
  if (loading) {
    content = (
      <div className={emptyWrap}>
        <EmptyState loading title="Loading assets…" />
      </div>
    );
  } else if (displayed.length === 0) {
    content = (
      <div className={emptyWrap}>
        {emptyState ?? <span className={emptyText}>This folder is empty.</span>}
      </div>
    );
  } else if (view === 'grid') {
    content = <AssetBrowserGrid />;
  } else {
    content = <AssetBrowserList />;
  }

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
                {content}
                <ImportOverlay />
              </div>
            </div>
            {showStatusBar && (
              <div className={statusBar}>
                <span>{announcement}</span>
                <span className={statusSpacer} />
                {view === 'grid' && (
                  <SegmentedControl
                    value={
                      typeof thumbnailSize === 'string' ? thumbnailSize : 'md'
                    }
                    onChange={value =>
                      setThumbnailSize(value as AssetThumbnailSize)
                    }
                    size="sm"
                    aria-label="Thumbnail size"
                  >
                    <SegmentedControlItem value="sm">S</SegmentedControlItem>
                    <SegmentedControlItem value="md">M</SegmentedControlItem>
                    <SegmentedControlItem value="lg">L</SegmentedControlItem>
                  </SegmentedControl>
                )}
              </div>
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
