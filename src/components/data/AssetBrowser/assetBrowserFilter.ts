import type {
  AssetFilterState,
  AssetItem,
  AssetSortState,
} from './AssetBrowser.types';

/** Case-insensitive name match. An empty/blank query keeps every item. */
export function filterBySearch(
  items: readonly AssetItem[],
  query: string
): AssetItem[] {
  const q = query.trim().toLowerCase();
  if (q === '') return items.slice();
  return items.filter(item => item.name.toLowerCase().includes(q));
}

/**
 * Type filter. Folders always pass (they have no asset type and must stay
 * navigable). An empty/undefined `types` list keeps every item.
 */
export function filterByType(
  items: readonly AssetItem[],
  types: readonly string[] | undefined
): AssetItem[] {
  if (!types || types.length === 0) return items.slice();
  const set = new Set(types);
  return items.filter(
    item => item.kind === 'folder' || set.has(item.assetType ?? 'unknown')
  );
}

function toTime(value: number | Date | undefined): number {
  if (value === undefined) return Number.NEGATIVE_INFINITY;
  return value instanceof Date ? value.getTime() : value;
}

function compareField(a: AssetItem, b: AssetItem, field: string): number {
  switch (field) {
    case 'name':
      return a.name.localeCompare(b.name);
    case 'type':
      return (a.assetType ?? '').localeCompare(b.assetType ?? '');
    case 'size':
      return (a.size ?? 0) - (b.size ?? 0);
    case 'modified':
      return toTime(a.modifiedAt) - toTime(b.modifiedAt);
    default: {
      const av = a.meta?.[field];
      const bv = b.meta?.[field];
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      const as = typeof av === 'string' ? av : '';
      const bs = typeof bv === 'string' ? bv : '';
      return as.localeCompare(bs);
    }
  }
}

/**
 * Sort a stable copy. Folders always group before files; within a group the
 * chosen field + direction applies. Name is the tiebreaker for equal fields.
 */
export function sortItems(
  items: readonly AssetItem[],
  sort: AssetSortState
): AssetItem[] {
  const dir = sort.direction === 'desc' ? -1 : 1;
  return items.slice().sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
    const primary = compareField(a, b, sort.field);
    if (primary !== 0) return primary * dir;
    return a.name.localeCompare(b.name) * dir;
  });
}

export interface ShapeAssetsOptions {
  search: string;
  filters: AssetFilterState;
  sort: AssetSortState;
  manualSearch: boolean;
  manualFilter: boolean;
  manualSort: boolean;
}

/**
 * Apply the non-manual axes (search → filter → sort) to produce the displayed
 * list. Manual axes trust `items` as already shaped for that axis.
 */
export function shapeAssets(
  items: readonly AssetItem[],
  options: ShapeAssetsOptions
): AssetItem[] {
  let result: AssetItem[] = items.slice();
  if (!options.manualSearch) result = filterBySearch(result, options.search);
  if (!options.manualFilter)
    result = filterByType(result, options.filters.types);
  if (!options.manualSort) result = sortItems(result, options.sort);
  return result;
}

/** Distinct asset types present among files, in first-seen order. */
export function collectTypes(items: readonly AssetItem[]): string[] {
  const seen: string[] = [];
  const set = new Set<string>();
  for (const item of items) {
    if (item.kind !== 'file') continue;
    const type = item.assetType ?? 'unknown';
    if (!set.has(type)) {
      set.add(type);
      seen.push(type);
    }
  }
  return seen;
}
