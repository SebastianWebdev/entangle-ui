import { describe, it, expect } from 'vitest';
import {
  computeFitTransform,
  computeCenterTransform,
  computeZoomTowardPivot,
  normalizeRect,
} from './viewportMath';
import type { ViewportTransform } from './Viewport.types';

const LIMITS = { minZoom: 0.1, maxZoom: 8 };

describe('viewportMath', () => {
  describe('computeFitTransform', () => {
    it('fits a square bounds into a square viewport with zoom=1', () => {
      const t = computeFitTransform(
        { x: 0, y: 0, width: 100, height: 100 },
        { width: 100, height: 100 },
        0,
        LIMITS
      );
      expect(t.zoom).toBe(1);
      // Center of bounds (50,50) -> center of viewport (50,50)
      expect(t.x).toBe(0);
      expect(t.y).toBe(0);
    });

    it('picks the smaller axis zoom (uniform scale)', () => {
      // bounds is wide and short; viewport is square -> width is limiting
      const t = computeFitTransform(
        { x: 0, y: 0, width: 200, height: 50 },
        { width: 100, height: 100 },
        0,
        LIMITS
      );
      expect(t.zoom).toBeCloseTo(0.5);
      // Bounds center (100, 25) -> viewport center (50, 50) under zoom 0.5
      // x = 50 - 100 * 0.5 = 0; y = 50 - 25 * 0.5 = 37.5
      expect(t.x).toBeCloseTo(0);
      expect(t.y).toBeCloseTo(37.5);
    });

    it('applies padding to inner area', () => {
      const t = computeFitTransform(
        { x: 0, y: 0, width: 100, height: 100 },
        { width: 100, height: 100 },
        10,
        LIMITS
      );
      // Inner area becomes 80x80; zoom = 80/100 = 0.8
      expect(t.zoom).toBeCloseTo(0.8);
    });

    it('clamps to max zoom', () => {
      const t = computeFitTransform(
        { x: 0, y: 0, width: 1, height: 1 },
        { width: 1000, height: 1000 },
        0,
        { minZoom: 0.1, maxZoom: 4 }
      );
      expect(t.zoom).toBe(4);
    });

    it('clamps to min zoom', () => {
      const t = computeFitTransform(
        { x: 0, y: 0, width: 100000, height: 100000 },
        { width: 100, height: 100 },
        0,
        { minZoom: 0.5, maxZoom: 8 }
      );
      expect(t.zoom).toBe(0.5);
    });

    it('handles degenerate (zero-size) bounds without dividing by zero', () => {
      const t = computeFitTransform(
        { x: 50, y: 50, width: 0, height: 0 },
        { width: 100, height: 100 },
        0,
        LIMITS
      );
      expect(Number.isFinite(t.x)).toBe(true);
      expect(Number.isFinite(t.y)).toBe(true);
      expect(Number.isFinite(t.zoom)).toBe(true);
    });
  });

  describe('computeCenterTransform', () => {
    it('places the point at the viewport center', () => {
      const current: ViewportTransform = { x: 0, y: 0, zoom: 1 };
      const t = computeCenterTransform(
        { x: 200, y: 200 },
        { width: 100, height: 100 },
        current,
        LIMITS
      );
      expect(t.x).toBe(50 - 200);
      expect(t.y).toBe(50 - 200);
      expect(t.zoom).toBe(1);
    });

    it('applies optional new zoom', () => {
      const current: ViewportTransform = { x: 0, y: 0, zoom: 1 };
      const t = computeCenterTransform(
        { x: 100, y: 100 },
        { width: 200, height: 200 },
        current,
        LIMITS,
        2
      );
      expect(t.zoom).toBe(2);
      expect(t.x).toBe(100 - 200);
      expect(t.y).toBe(100 - 200);
    });

    it('clamps new zoom to limits', () => {
      const current: ViewportTransform = { x: 0, y: 0, zoom: 1 };
      const t = computeCenterTransform(
        { x: 0, y: 0 },
        { width: 100, height: 100 },
        current,
        { minZoom: 0.5, maxZoom: 2 },
        100
      );
      expect(t.zoom).toBe(2);
    });
  });

  describe('computeZoomTowardPivot', () => {
    it('keeps the world point under the pivot after zoom', () => {
      const current: ViewportTransform = { x: 0, y: 0, zoom: 1 };
      const pivot = { x: 50, y: 50 };
      const next = computeZoomTowardPivot(pivot, 2, current, LIMITS);

      // world point under pivot before zoom is (50, 50) (since identity).
      // After zoom 2, that world point should still appear at pivot (50, 50).
      const screenAfter = {
        x: 50 * next.zoom + next.x,
        y: 50 * next.zoom + next.y,
      };
      expect(screenAfter.x).toBeCloseTo(50);
      expect(screenAfter.y).toBeCloseTo(50);
      expect(next.zoom).toBe(2);
    });

    it('respects zoom limits', () => {
      const current: ViewportTransform = { x: 0, y: 0, zoom: 4 };
      const next = computeZoomTowardPivot({ x: 10, y: 10 }, 10, current, {
        minZoom: 0.1,
        maxZoom: 8,
      });
      expect(next.zoom).toBe(8);
    });
  });

  describe('normalizeRect', () => {
    it('keeps positive dimensions as-is', () => {
      expect(normalizeRect({ x: 1, y: 2, width: 30, height: 40 })).toEqual({
        x: 1,
        y: 2,
        width: 30,
        height: 40,
      });
    });

    it('flips negative width to positive and shifts origin', () => {
      expect(normalizeRect({ x: 10, y: 5, width: -10, height: 7 })).toEqual({
        x: 0,
        y: 5,
        width: 10,
        height: 7,
      });
    });

    it('flips negative height', () => {
      expect(normalizeRect({ x: 0, y: 10, width: 5, height: -7 })).toEqual({
        x: 0,
        y: 3,
        width: 5,
        height: 7,
      });
    });
  });
});
