import { describe, it, expect } from 'vitest';
import { indexRange, nextGridIndex } from './assetBrowserKeyboard';

const params = { columns: 4, count: 10, rowsPerPage: 2 };

describe('assetBrowserKeyboard', () => {
  describe('nextGridIndex', () => {
    it('returns -1 for an empty grid', () => {
      expect(nextGridIndex(0, 'ArrowRight', { ...params, count: 0 })).toBe(-1);
    });

    it('lands on the first item from an unfocused state', () => {
      expect(nextGridIndex(-1, 'ArrowDown', params)).toBe(0);
      expect(nextGridIndex(-1, 'End', params)).toBe(9);
    });

    it('moves horizontally within bounds', () => {
      expect(nextGridIndex(0, 'ArrowRight', params)).toBe(1);
      expect(nextGridIndex(9, 'ArrowRight', params)).toBe(9); // clamped at end
      expect(nextGridIndex(0, 'ArrowLeft', params)).toBe(0); // clamped at start
    });

    it('moves vertically by one column count', () => {
      expect(nextGridIndex(0, 'ArrowDown', params)).toBe(4);
      expect(nextGridIndex(4, 'ArrowUp', params)).toBe(0);
    });

    it('does not move down past the last row', () => {
      expect(nextGridIndex(8, 'ArrowDown', params)).toBe(8);
    });

    it('jumps to Home and End', () => {
      expect(nextGridIndex(5, 'Home', params)).toBe(0);
      expect(nextGridIndex(5, 'End', params)).toBe(9);
    });

    it('pages by columns * rowsPerPage, clamped', () => {
      expect(nextGridIndex(0, 'PageDown', params)).toBe(8);
      expect(nextGridIndex(8, 'PageDown', params)).toBe(9);
      expect(nextGridIndex(9, 'PageUp', params)).toBe(1);
      expect(nextGridIndex(1, 'PageUp', params)).toBe(0);
    });

    it('ignores non-navigation keys', () => {
      expect(nextGridIndex(3, 'a', params)).toBe(3);
    });
  });

  describe('indexRange', () => {
    it('orders the pair ascending', () => {
      expect(indexRange(2, 5)).toEqual([2, 5]);
      expect(indexRange(5, 2)).toEqual([2, 5]);
    });
  });
});
