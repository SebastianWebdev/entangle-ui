import type { AssetSortField } from './AssetBrowser.types';

/**
 * Every user-facing string in the AssetBrowser chrome. Pass a partial
 * `labels` prop to translate or reword any subset; unspecified keys fall back
 * to {@link DEFAULT_ASSET_BROWSER_LABELS} (English).
 *
 * The `*Aria` keys are accessible names (screen-reader only); the rest are
 * visible text. `sortFields` maps each sortable field id to its menu/column
 * label. `itemCount` / `selectedCount` build the live-region announcement and
 * receive the relevant counts.
 */
export interface AssetBrowserLabels {
  /** Search input placeholder. @default "Search assets…" */
  searchPlaceholder: string;
  /** Accessible name of the view-mode toggle. @default "View mode" */
  viewModeAria: string;
  /** Grid-view tooltip. @default "Grid view" */
  gridViewTooltip: string;
  /** List-view tooltip. @default "List view" */
  listViewTooltip: string;
  /** Accessible name of the grid region. @default "Assets" */
  gridAria: string;
  /** Sort menu trigger. @default "Sort" */
  sort: string;
  /** Ascending radio item. @default "Ascending" */
  sortAscending: string;
  /** Descending radio item. @default "Descending" */
  sortDescending: string;
  /** Filter menu trigger. @default "Filter" */
  filter: string;
  /** Back button accessible name. @default "Back" */
  back: string;
  /** Forward button accessible name. @default "Forward" */
  forward: string;
  /** Thumbnail-size control accessible name. @default "Thumbnail size" */
  thumbnailSizeAria: string;
  /** Default empty-folder message. @default "This folder is empty." */
  empty: string;
  /** Loading message (list view) / skeleton aria. @default "Loading assets…" */
  loading: string;
  /** Built-in error title. @default "Couldn’t load assets" */
  errorTitle: string;
  /** Built-in error description. */
  errorDescription: string;
  /** Retry button. @default "Retry" */
  retry: string;
  /** File-import drop overlay. @default "Drop files to import" */
  importOverlay: string;
  /** List "Type" value for folders. @default "Folder" */
  folder: string;
  /** Per-sort-field labels (also the list column headers). */
  sortFields: Record<AssetSortField, string>;
  /** Live-region item count, e.g. `n => \`${n} items\``. */
  itemCount: (count: number) => string;
  /** Live-region selected count suffix, e.g. `n => \`, ${n} selected\``. */
  selectedCount: (count: number) => string;
}

export const DEFAULT_ASSET_BROWSER_LABELS: AssetBrowserLabels = {
  searchPlaceholder: 'Search assets…',
  viewModeAria: 'View mode',
  gridViewTooltip: 'Grid view',
  listViewTooltip: 'List view',
  gridAria: 'Assets',
  sort: 'Sort',
  sortAscending: 'Ascending',
  sortDescending: 'Descending',
  filter: 'Filter',
  back: 'Back',
  forward: 'Forward',
  thumbnailSizeAria: 'Thumbnail size',
  empty: 'This folder is empty.',
  loading: 'Loading assets…',
  errorTitle: 'Couldn’t load assets',
  errorDescription: 'Something went wrong while loading this folder.',
  retry: 'Retry',
  importOverlay: 'Drop files to import',
  folder: 'Folder',
  sortFields: {
    name: 'Name',
    type: 'Type',
    size: 'Size',
    modified: 'Modified',
  },
  itemCount: count => `${count} item${count === 1 ? '' : 's'}`,
  selectedCount: count => `, ${count} selected`,
};

/**
 * Merge a consumer's partial `labels` onto the English defaults. `sortFields`
 * is merged one level deep so overriding a single column label keeps the rest.
 */
export function resolveLabels(
  overrides: Partial<AssetBrowserLabels> | undefined
): AssetBrowserLabels {
  if (!overrides) return DEFAULT_ASSET_BROWSER_LABELS;
  return {
    ...DEFAULT_ASSET_BROWSER_LABELS,
    ...overrides,
    sortFields: {
      ...DEFAULT_ASSET_BROWSER_LABELS.sortFields,
      ...overrides.sortFields,
    },
  };
}
