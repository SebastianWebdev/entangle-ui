import { describe, it, expect } from 'vitest';
import {
  collectTypes,
  filterBySearch,
  filterByType,
  shapeAssets,
  sortItems,
} from './assetBrowserFilter';
import type { AssetItem } from './AssetBrowser.types';

const item = (over: Partial<AssetItem> & Pick<AssetItem, 'id'>): AssetItem => ({
  name: over.id,
  kind: 'file',
  ...over,
});

const items: AssetItem[] = [
  item({
    id: 'wood',
    name: 'Wood',
    assetType: 'image',
    size: 30,
    modifiedAt: 3,
  }),
  item({
    id: 'stone',
    name: 'Stone',
    assetType: 'image',
    size: 10,
    modifiedAt: 1,
  }),
  item({
    id: 'beep',
    name: 'Beep',
    assetType: 'audio',
    size: 20,
    modifiedAt: 2,
  }),
  item({ id: 'sub', name: 'Subfolder', kind: 'folder' }),
];

describe('assetBrowserFilter', () => {
  describe('filterBySearch', () => {
    it('keeps every item for a blank query', () => {
      expect(filterBySearch(items, '   ')).toHaveLength(items.length);
    });

    it('matches name case-insensitively', () => {
      const result = filterBySearch(items, 'oo');
      expect(result.map(i => i.id)).toEqual(['wood']);
    });

    it('does not mutate the input', () => {
      const copy = items.slice();
      filterBySearch(items, 'x');
      expect(items).toEqual(copy);
    });
  });

  describe('filterByType', () => {
    it('keeps every item when no types given', () => {
      expect(filterByType(items, [])).toHaveLength(items.length);
      expect(filterByType(items, undefined)).toHaveLength(items.length);
    });

    it('filters files by type but always keeps folders', () => {
      const result = filterByType(items, ['audio']);
      expect(result.map(i => i.id).sort()).toEqual(['beep', 'sub']);
    });
  });

  describe('sortItems', () => {
    it('groups folders before files regardless of field', () => {
      const result = sortItems(items, { field: 'name', direction: 'asc' });
      expect(result[0]?.kind).toBe('folder');
    });

    it('sorts files by name ascending', () => {
      const files = items.filter(i => i.kind === 'file');
      const result = sortItems(files, { field: 'name', direction: 'asc' });
      expect(result.map(i => i.id)).toEqual(['beep', 'stone', 'wood']);
    });

    it('sorts by size descending', () => {
      const files = items.filter(i => i.kind === 'file');
      const result = sortItems(files, { field: 'size', direction: 'desc' });
      expect(result.map(i => i.id)).toEqual(['wood', 'beep', 'stone']);
    });

    it('sorts by modified date ascending', () => {
      const files = items.filter(i => i.kind === 'file');
      const result = sortItems(files, { field: 'modified', direction: 'asc' });
      expect(result.map(i => i.id)).toEqual(['stone', 'beep', 'wood']);
    });
  });

  describe('shapeAssets', () => {
    const opts = {
      search: '',
      filters: {},
      sort: { field: 'name', direction: 'asc' } as const,
      manualSearch: false,
      manualFilter: false,
      manualSort: false,
    };

    it('applies search, filter, and sort together', () => {
      const result = shapeAssets(items, {
        ...opts,
        search: 'o',
        filters: { types: ['image'] },
      });
      // 'o' matches Wood, Stone, Subfolder; type image keeps files+folder.
      expect(result.map(i => i.id)).toEqual(['sub', 'stone', 'wood']);
    });

    it('skips an axis when its manual flag is set', () => {
      const result = shapeAssets(items, {
        ...opts,
        search: 'zzz',
        manualSearch: true,
      });
      expect(result).toHaveLength(items.length);
    });
  });

  describe('collectTypes', () => {
    it('returns distinct file types in first-seen order', () => {
      expect(collectTypes(items)).toEqual(['image', 'audio']);
    });
  });
});
