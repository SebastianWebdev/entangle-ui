import { describe, it, expect } from 'vitest';
import { computeBoundsFromItems } from './computeBoundsFromItems';
import type { MinimapItem } from './Minimap.types';

describe('computeBoundsFromItems', () => {
  it('returns a zero-area rect at origin for empty input', () => {
    expect(computeBoundsFromItems([])).toEqual({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  });

  it('computes tight bbox for a single rect', () => {
    const items: MinimapItem[] = [
      { id: 'a', type: 'rect', x: 10, y: 20, width: 30, height: 40 },
    ];
    expect(computeBoundsFromItems(items)).toEqual({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    });
  });

  it('computes tight bbox for a single circle', () => {
    const items: MinimapItem[] = [
      { id: 'a', type: 'circle', cx: 100, cy: 50, r: 10 },
    ];
    expect(computeBoundsFromItems(items)).toEqual({
      x: 90,
      y: 40,
      width: 20,
      height: 20,
    });
  });

  it('computes tight bbox for a line regardless of point order', () => {
    const items: MinimapItem[] = [
      { id: 'a', type: 'line', x1: 50, y1: 10, x2: 20, y2: 80 },
    ];
    expect(computeBoundsFromItems(items)).toEqual({
      x: 20,
      y: 10,
      width: 30,
      height: 70,
    });
  });

  it('unions bbox across mixed item types', () => {
    const items: MinimapItem[] = [
      { id: 'r', type: 'rect', x: 0, y: 0, width: 100, height: 100 },
      { id: 'c', type: 'circle', cx: 200, cy: 50, r: 20 },
      { id: 'l', type: 'line', x1: 50, y1: -30, x2: 80, y2: 150 },
    ];
    expect(computeBoundsFromItems(items)).toEqual({
      x: 0,
      y: -30,
      width: 220,
      height: 180,
    });
  });

  it('applies uniform padding on every side', () => {
    const items: MinimapItem[] = [
      { id: 'a', type: 'rect', x: 10, y: 20, width: 30, height: 40 },
    ];
    expect(computeBoundsFromItems(items, 5)).toEqual({
      x: 5,
      y: 15,
      width: 40,
      height: 50,
    });
  });

  it('handles negative coordinates', () => {
    const items: MinimapItem[] = [
      { id: 'a', type: 'rect', x: -50, y: -30, width: 20, height: 10 },
    ];
    expect(computeBoundsFromItems(items)).toEqual({
      x: -50,
      y: -30,
      width: 20,
      height: 10,
    });
  });
});
