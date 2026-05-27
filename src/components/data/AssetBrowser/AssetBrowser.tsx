'use client';

import React, {
  useCallback,
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
  AssetItem,
  AssetSelectionReason,
  AssetSortState,
  AssetThumbnailSize,
  AssetView,
} from './AssetBrowser.types';
import {
  AssetBrowserContext,
  AssetBrowserStoreContext,
  useAssetDrag,
  type AssetBrowserContextValue,
} from './AssetBrowserContext';
import { AssetBrowserStore } from './AssetBrowserStore';
import { AssetBrowserToolbar } from './AssetBrowserToolbar';
import { AssetBrowserBreadcrumbs } from './AssetBrowserBreadcrumbs';
import { AssetBrowserSidebar } from './AssetBrowserSidebar';
import { AssetBrowserGrid } from './AssetBrowserGrid';
import { AssetBrowserList } from './AssetBrowserList';
import { useAssetDnd } from './useAssetDnd';
import { collectTypes, shapeAssets } from './assetBrowserFilter';
import { resolveThumbPx } from './assetBrowserGeometry';
import { indexRange } from './assetBrowserKeyboard';
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
    ...rest
  } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const store = useMemo(() => new AssetBrowserStore(), []);
  const anchorRef = useRef<number | null>(null);

  const [view, setView] = useControlledState<AssetView>({
    value: props.view,
    defaultValue: props.defaultView,
    onChange: props.onViewChange,
    fallback: 'grid',
  });
  const [thumbnailSize, setThumbnailSize] =
    useControlledState<AssetThumbnailSize>({
      value: props.thumbnailSize,
      defaultValue: props.defaultThumbnailSize,
      onChange: props.onThumbnailSizeChange,
      fallback: 'md',
    });
  const [search, setSearch] = useControlledState<string>({
    value: props.search,
    defaultValue: props.defaultSearch,
    onChange: props.onSearchChange,
    fallback: '',
  });
  const [filters, setFilters] = useControlledState<AssetFilterState>({
    value: props.filters,
    defaultValue: props.defaultFilters,
    onChange: props.onFiltersChange,
    fallback: {},
  });
  const [sort, setSort] = useControlledState<AssetSortState>({
    value: props.sort,
    defaultValue: props.defaultSort,
    onChange: props.onSortChange,
    fallback: DEFAULT_SORT,
  });
  const [selectionArr, setSelectionArr] = useControlledState<readonly string[]>(
    {
      value: props.selection,
      defaultValue: props.defaultSelection,
      fallback: [],
    }
  );

  const deferredSearch = useDeferredValue(search);
  const thumbnailSizePx = resolveThumbPx(thumbnailSize);

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

  const selectionSet = useMemo(() => new Set(selectionArr), [selectionArr]);

  // Stable refs so handlers never re-create (consumer inline callbacks ok).
  const displayedRef = useLatest(displayed);
  const itemsRef = useLatest(items);
  const selectionRef = useLatest(selectionSet);
  const setSelArrRef = useLatest(setSelectionArr);
  const onSelectionChangeRef = useLatest(props.onSelectionChange);
  const onItemOpenRef = useLatest(props.onItemOpen);
  const onNavigateRef = useLatest(props.onNavigate);
  const selectionModeRef = useLatest(selectionMode);

  const selectableIds = useCallback(
    (list: readonly AssetItem[]): string[] =>
      list.filter(it => it.selectable !== false).map(it => it.id),
    []
  );

  const commitSelection = useCallback(
    (ids: string[], reason: AssetSelectionReason): void => {
      setSelArrRef.current(ids);
      onSelectionChangeRef.current?.(ids, { reason });
    },
    [setSelArrRef, onSelectionChangeRef]
  );

  const handleItemClick = useCallback(
    (item: AssetItem, index: number, event: React.MouseEvent): void => {
      store.setFocusedId(item.id);
      const mode = selectionModeRef.current;
      if (mode === false || item.selectable === false || item.disabled) return;
      if (mode === 'single') {
        commitSelection([item.id], 'click');
        anchorRef.current = index;
        return;
      }
      if (event.shiftKey && anchorRef.current !== null) {
        const [a, b] = indexRange(anchorRef.current, index);
        commitSelection(
          selectableIds(displayedRef.current.slice(a, b + 1)),
          'click'
        );
        return;
      }
      if (event.ctrlKey || event.metaKey) {
        const set = new Set(selectionRef.current);
        if (set.has(item.id)) set.delete(item.id);
        else set.add(item.id);
        commitSelection(Array.from(set), 'click');
        anchorRef.current = index;
        return;
      }
      commitSelection([item.id], 'click');
      anchorRef.current = index;
    },
    [
      store,
      commitSelection,
      selectableIds,
      displayedRef,
      selectionModeRef,
      selectionRef,
    ]
  );

  const selectByKeyboard = useCallback(
    (index: number, extend: boolean): void => {
      const item = displayedRef.current[index];
      if (!item) return;
      if (extend && anchorRef.current !== null) {
        const [a, b] = indexRange(anchorRef.current, index);
        commitSelection(
          selectableIds(displayedRef.current.slice(a, b + 1)),
          'keyboard'
        );
        return;
      }
      commitSelection(item.selectable === false ? [] : [item.id], 'keyboard');
      anchorRef.current = index;
    },
    [commitSelection, selectableIds, displayedRef]
  );

  const toggleSelectId = useCallback(
    (id: string): void => {
      const set = new Set(selectionRef.current);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      commitSelection(Array.from(set), 'keyboard');
    },
    [commitSelection, selectionRef]
  );

  const setSelectionIds = useCallback(
    (ids: string[], reason: AssetSelectionReason): void => {
      commitSelection(ids, reason);
    },
    [commitSelection]
  );

  const commitMarquee = useCallback(
    (ids: string[], additive: boolean): void => {
      if (additive) {
        const set = new Set(selectionRef.current);
        ids.forEach(id => set.add(id));
        commitSelection(Array.from(set), 'marquee');
        return;
      }
      commitSelection(ids, 'marquee');
    },
    [commitSelection, selectionRef]
  );

  const selectAll = useCallback(() => {
    commitSelection(selectableIds(displayedRef.current), 'selectAll');
  }, [commitSelection, selectableIds, displayedRef]);

  const clearSelection = useCallback(() => {
    commitSelection([], 'clear');
  }, [commitSelection]);

  const contextMenuSelect = useCallback(
    (item: AssetItem, index: number): void => {
      store.setFocusedId(item.id);
      if (!selectionRef.current.has(item.id) && item.selectable !== false) {
        commitSelection([item.id], 'contextMenu');
      }
      anchorRef.current = index;
    },
    [store, commitSelection, selectionRef]
  );

  const navigate = useCallback(
    (
      folderId: string,
      source: Parameters<NonNullable<AssetBrowserProps['onNavigate']>>[1]
    ): void => {
      onNavigateRef.current?.(folderId, source);
    },
    [onNavigateRef]
  );

  const activateItem = useCallback(
    (item: AssetItem): void => {
      if (item.kind === 'folder') navigate(item.id, 'open');
      else onItemOpenRef.current?.(item);
    },
    [navigate, onItemOpenRef]
  );

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

  const contextValue = useMemo<AssetBrowserContextValue>(
    () => ({
      displayedItems: displayed,
      rawCount: items.length,
      view,
      setView,
      thumbnailSize,
      thumbnailSizePx,
      setThumbnailSize,
      density,
      selectionMode,
      selection: selectionSet,
      selectionCount: selectionSet.size,
      search,
      setSearch,
      filters,
      setFilters,
      filterableTypes,
      sort,
      setSort,
      handleItemClick,
      activateItem,
      selectAll,
      clearSelection,
      contextMenuSelect,
      selectByKeyboard,
      toggleSelectId,
      setSelectionIds,
      commitMarquee,
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
      items.length,
      view,
      setView,
      thumbnailSize,
      thumbnailSizePx,
      setThumbnailSize,
      density,
      selectionMode,
      selectionSet,
      search,
      setSearch,
      filters,
      setFilters,
      filterableTypes,
      sort,
      setSort,
      handleItemClick,
      activateItem,
      selectAll,
      clearSelection,
      contextMenuSelect,
      selectByKeyboard,
      toggleSelectId,
      setSelectionIds,
      commitMarquee,
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

  useImperativeHandle(
    ref,
    (): AssetBrowserHandle => ({
      focus: () => rootRef.current?.focus(),
      getElement: () => rootRef.current,
      selectAll,
      clearSelection,
      scrollToItem: (id: string) => {
        store.setFocusedId(id);
        const el = rootRef.current?.querySelector(
          `[data-asset-id="${cssEscape(id)}"]`
        );
        el?.scrollIntoView({ block: 'nearest' });
      },
      getSelectedItems: () =>
        itemsRef.current.filter(it => selectionRef.current.has(it.id)),
    }),
    [selectAll, clearSelection, store, itemsRef, selectionRef]
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
      <AssetBrowserContext.Provider value={contextValue}>
        <div
          ref={rootRef}
          className={cx(root, className)}
          style={style}
          data-testid={testId}
          tabIndex={-1}
          aria-label={ariaLabel}
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
    </AssetBrowserStoreContext.Provider>
  );
}

AssetBrowserRoot.displayName = 'AssetBrowser';

export const AssetBrowser = /*#__PURE__*/ Object.assign(AssetBrowserRoot, {
  Toolbar: ToolbarSlot,
  Sidebar: SidebarSlot,
});
