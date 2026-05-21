import { describe, it, expect } from 'vitest';
import { hitTestItems } from './minimapHitTest';
import type { MinimapItem } from './Minimap.types';

describe('hitTestItems', () => {
  it('returns null on empty list', () => {
    expect(hitTestItems({ x: 0, y: 0 }, [], 4)).toBeNull();
  });

  it('hits a rect when point is inside', () => {
    const items: MinimapItem[] = [
      { id: 'a', type: 'rect', x: 0, y: 0, width: 100, height: 50 },
    ];
    expect(hitTestItems({ x: 30, y: 25 }, items, 4)).toBe('a');
  });

  it('misses a rect when point is outside', () => {
    const items: MinimapItem[] = [
      { id: 'a', type: 'rect', x: 0, y: 0, width: 10, height: 10 },
    ];
    expect(hitTestItems({ x: 50, y: 50 }, items, 4)).toBeNull();
  });

  it('hits a circle inside the radius', () => {
    const items: MinimapItem[] = [
      { id: 'c', type: 'circle', cx: 50, cy: 50, r: 10 },
    ];
    expect(hitTestItems({ x: 55, y: 55 }, items, 4)).toBe('c');
  });

  it('misses a circle outside the radius', () => {
    const items: MinimapItem[] = [
      { id: 'c', type: 'circle', cx: 50, cy: 50, r: 10 },
    ];
    expect(hitTestItems({ x: 80, y: 80 }, items, 4)).toBeNull();
  });

  it('hits a line within tolerance', () => {
    const items: MinimapItem[] = [
      { id: 'l', type: 'line', x1: 0, y1: 0, x2: 100, y2: 0 },
    ];
    expect(hitTestItems({ x: 50, y: 3 }, items, 5)).toBe('l');
  });

  it('misses a line outside tolerance', () => {
    const items: MinimapItem[] = [
      { id: 'l', type: 'line', x1: 0, y1: 0, x2: 100, y2: 0 },
    ];
    expect(hitTestItems({ x: 50, y: 20 }, items, 5)).toBeNull();
  });

  it('returns topmost (last-drawn) match when items overlap', () => {
    const items: MinimapItem[] = [
      { id: 'bottom', type: 'rect', x: 0, y: 0, width: 100, height: 100 },
      { id: 'top', type: 'rect', x: 20, y: 20, width: 30, height: 30 },
    ];
    expect(hitTestItems({ x: 25, y: 25 }, items, 4)).toBe('top');
  });

  it('hits a custom item via its bounds', () => {
    const items: MinimapItem[] = [
      {
        id: 'k',
        type: 'custom',
        bounds: { x: 100, y: 100, width: 50, height: 50 },
        draw: () => {},
      },
    ];
    expect(hitTestItems({ x: 125, y: 125 }, items, 4)).toBe('k');
    expect(hitTestItems({ x: 200, y: 200 }, items, 4)).toBeNull();
  });
});
