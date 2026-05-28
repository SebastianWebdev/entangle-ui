'use client';

import { useDeferredValue, useMemo } from 'react';
import { useControlledState } from '@/hooks';
import type {
  AssetFilterState,
  AssetItem,
  AssetSortState,
  AssetThumbnailSize,
  AssetType,
  AssetView,
} from './AssetBrowser.types';
import { collectTypes, shapeAssets } from './assetBrowserFilter';
import { resolveThumbPx } from './assetBrowserGeometry';

const DEFAULT_SORT: AssetSortState = { field: 'name', direction: 'asc' };

export interface UseAssetBrowserViewStateOptions {
  items: readonly AssetItem[];
  selectionMode: 'single' | 'multiple' | false;
  marquee: boolean;

  view?: AssetView;
  defaultView?: AssetView;
  onViewChange?: (view: AssetView) => void;

  thumbnailSize?: AssetThumbnailSize;
  defaultThumbnailSize?: AssetThumbnailSize;
  onThumbnailSizeChange?: (size: AssetThumbnailSize) => void;

  search?: string;
  defaultSearch?: string;
  onSearchChange?: (query: string) => void;
  manualSearch: boolean;

  filters?: AssetFilterState;
  defaultFilters?: AssetFilterState;
  onFiltersChange?: (filters: AssetFilterState) => void;
  manualFilter: boolean;

  sort?: AssetSortState;
  defaultSort?: AssetSortState;
  onSortChange?: (sort: AssetSortState) => void;
  manualSort: boolean;

  filterableTypesProp?: AssetType[];
}

export interface AssetBrowserViewState {
  view: AssetView;
  setView: (view: AssetView) => void;
  thumbnailSize: AssetThumbnailSize;
  setThumbnailSize: (size: AssetThumbnailSize) => void;
  thumbnailSizePx: number;
  search: string;
  setSearch: (query: string) => void;
  filters: AssetFilterState;
  setFilters: (filters: AssetFilterState) => void;
  sort: AssetSortState;
  setSort: (sort: AssetSortState) => void;
  filterableTypes: string[];
  /** Search (deferred) + filter + sort applied — what the views render. */
  displayed: AssetItem[];
  /** Resolved from `selectionMode === 'multiple'` and the `marquee` prop. */
  marqueeEnabled: boolean;
}

/**
 * View-state aggregate for `AssetBrowser`. Wraps the five `useControlledState`
 * pairs (view / thumbnailSize / search / filters / sort) and computes the
 * derived values (`thumbnailSizePx`, `filterableTypes`, `displayed`,
 * `marqueeEnabled`). Search is run through `useDeferredValue` so heavy filter
 * + sort passes can lag behind responsive keystrokes.
 */
export function useAssetBrowserViewState(
  options: UseAssetBrowserViewStateOptions
): AssetBrowserViewState {
  const [view, setView] = useControlledState<AssetView>({
    value: options.view,
    defaultValue: options.defaultView,
    onChange: options.onViewChange,
    fallback: 'grid',
  });
  const [thumbnailSize, setThumbnailSize] =
    useControlledState<AssetThumbnailSize>({
      value: options.thumbnailSize,
      defaultValue: options.defaultThumbnailSize,
      onChange: options.onThumbnailSizeChange,
      fallback: 'md',
    });
  const [search, setSearch] = useControlledState<string>({
    value: options.search,
    defaultValue: options.defaultSearch,
    onChange: options.onSearchChange,
    fallback: '',
  });
  const [filters, setFilters] = useControlledState<AssetFilterState>({
    value: options.filters,
    defaultValue: options.defaultFilters,
    onChange: options.onFiltersChange,
    fallback: {},
  });
  const [sort, setSort] = useControlledState<AssetSortState>({
    value: options.sort,
    defaultValue: options.defaultSort,
    onChange: options.onSortChange,
    fallback: DEFAULT_SORT,
  });

  const deferredSearch = useDeferredValue(search);
  const thumbnailSizePx = resolveThumbPx(thumbnailSize);
  const marqueeEnabled =
    options.selectionMode === 'multiple' && options.marquee !== false;

  const filterableTypes = useMemo(
    () => options.filterableTypesProp ?? collectTypes(options.items),
    [options.filterableTypesProp, options.items]
  );

  const displayed = useMemo(
    () =>
      shapeAssets(options.items, {
        search: deferredSearch,
        filters,
        sort,
        manualSearch: options.manualSearch,
        manualFilter: options.manualFilter,
        manualSort: options.manualSort,
      }),
    [
      options.items,
      deferredSearch,
      filters,
      sort,
      options.manualSearch,
      options.manualFilter,
      options.manualSort,
    ]
  );

  return useMemo(
    () => ({
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
    }),
    [
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
    ]
  );
}
