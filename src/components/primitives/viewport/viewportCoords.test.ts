import { describe, it, expect } from 'vitest';
import {
  worldToScreen,
  screenToWorld,
  getViewportPointerPosition,
} from './viewportCoords';
import type { ViewportTransform } from './Viewport.types';

const IDENTITY: ViewportTransform = { x: 0, y: 0, zoom: 1 };

describe('viewportCoords', () => {
  describe('worldToScreen', () => {
    it('returns the same coordinates for identity transform', () => {
      expect(worldToScreen({ x: 10, y: 20 }, IDENTITY)).toEqual({
        x: 10,
        y: 20,
      });
    });

    it('applies translation', () => {
      const t: ViewportTransform = { x: 50, y: 100, zoom: 1 };
      expect(worldToScreen({ x: 10, y: 20 }, t)).toEqual({ x: 60, y: 120 });
    });

    it('applies zoom around world origin', () => {
      const t: ViewportTransform = { x: 0, y: 0, zoom: 2 };
      expect(worldToScreen({ x: 10, y: 20 }, t)).toEqual({ x: 20, y: 40 });
    });

    it('applies translation after scaling', () => {
      const t: ViewportTransform = { x: 5, y: 7, zoom: 2 };
      expect(worldToScreen({ x: 10, y: 20 }, t)).toEqual({ x: 25, y: 47 });
    });
  });

  describe('screenToWorld', () => {
    it('inverts identity transform', () => {
      expect(screenToWorld({ x: 10, y: 20 }, IDENTITY)).toEqual({
        x: 10,
        y: 20,
      });
    });

    it('inverts translation + zoom', () => {
      const t: ViewportTransform = { x: 5, y: 7, zoom: 2 };
      expect(screenToWorld({ x: 25, y: 47 }, t)).toEqual({ x: 10, y: 20 });
    });

    it('round-trips through worldToScreen', () => {
      const t: ViewportTransform = { x: -30, y: 45, zoom: 1.7 };
      const start = { x: 123.4, y: -56.7 };
      const screen = worldToScreen(start, t);
      const back = screenToWorld(screen, t);
      expect(back.x).toBeCloseTo(start.x, 6);
      expect(back.y).toBeCloseTo(start.y, 6);
    });

    it('falls back to zoom=1 when zoom is zero', () => {
      const t: ViewportTransform = { x: 0, y: 0, zoom: 0 };
      expect(screenToWorld({ x: 10, y: 20 }, t)).toEqual({ x: 10, y: 20 });
    });
  });

  describe('getViewportPointerPosition', () => {
    it('subtracts the viewport rect origin', () => {
      const el = document.createElement('div');
      el.getBoundingClientRect = (): DOMRect =>
        ({
          left: 30,
          top: 60,
          width: 200,
          height: 100,
          right: 230,
          bottom: 160,
          x: 30,
          y: 60,
          toJSON: () => ({}),
        }) as DOMRect;

      expect(
        getViewportPointerPosition({ clientX: 50, clientY: 80 }, el)
      ).toEqual({ x: 20, y: 20 });
    });
  });
});
