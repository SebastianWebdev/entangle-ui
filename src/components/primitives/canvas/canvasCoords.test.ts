import { describe, it, expect, vi } from 'vitest';
import {
  domainToCanvas,
  canvasToDomain,
  hitTestPoint,
  getCanvasPointerPosition,
} from './canvasCoords';
import type { CanvasViewport, Point2D } from './canvas.types';

describe('canvasCoords', () => {
  const viewport: CanvasViewport = {
    viewX: [0, 1],
    viewY: [0, 1],
  };
  const W = 320;
  const H = 200;

  describe('domainToCanvas', () => {
    it('maps domain origin (0,0) to bottom-left', () => {
      const result = domainToCanvas(0, 0, viewport, W, H);
      expect(result.px).toBe(0);
      expect(result.py).toBe(H); // Y flipped
    });

    it('maps domain (1,1) to top-right', () => {
      const result = domainToCanvas(1, 1, viewport, W, H);
      expect(result.px).toBe(W);
      expect(result.py).toBe(0);
    });

    it('maps domain center (0.5, 0.5) to canvas center', () => {
      const result = domainToCanvas(0.5, 0.5, viewport, W, H);
      expect(result.px).toBe(W / 2);
      expect(result.py).toBe(H / 2);
    });

    it('handles negative domain ranges', () => {
      const vp: CanvasViewport = { viewX: [-1, 1], viewY: [-1, 1] };
      const result = domainToCanvas(0, 0, vp, 400, 400);
      expect(result.px).toBe(200);
      expect(result.py).toBe(200);
    });

    it('handles zero-size viewport gracefully (no NaN)', () => {
      const vp: CanvasViewport = { viewX: [5, 5], viewY: [5, 5] };
      const result = domainToCanvas(5, 5, vp, W, H);
      expect(Number.isFinite(result.px)).toBe(true);
      expect(Number.isFinite(result.py)).toBe(true);
    });
  });

  describe('canvasToDomain', () => {
    it('maps bottom-left pixel to domain origin', () => {
      const result = canvasToDomain(0, H, viewport, W, H);
      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(0, 5);
    });

    it('maps top-right pixel to domain (1,1)', () => {
      const result = canvasToDomain(W, 0, viewport, W, H);
      expect(result.x).toBeCloseTo(1, 5);
      expect(result.y).toBeCloseTo(1, 5);
    });

    it('maps center pixel to domain center', () => {
      const result = canvasToDomain(W / 2, H / 2, viewport, W, H);
      expect(result.x).toBeCloseTo(0.5, 5);
      expect(result.y).toBeCloseTo(0.5, 5);
    });
  });

  describe('round-trip', () => {
    it('domainToCanvas -> canvasToDomain preserves values', () => {
      const original = { x: 0.3, y: 0.7 };
      const canvas = domainToCanvas(original.x, original.y, viewport, W, H);
      const domain = canvasToDomain(canvas.px, canvas.py, viewport, W, H);
      expect(domain.x).toBeCloseTo(original.x, 10);
      expect(domain.y).toBeCloseTo(original.y, 10);
    });

    it('canvasToDomain -> domainToCanvas preserves values', () => {
      const original = { px: 100, py: 75 };
      const domain = canvasToDomain(original.px, original.py, viewport, W, H);
      const canvas = domainToCanvas(domain.x, domain.y, viewport, W, H);
      expect(canvas.px).toBeCloseTo(original.px, 10);
      expect(canvas.py).toBeCloseTo(original.py, 10);
    });

    it('round-trip with offset viewport', () => {
      const vp: CanvasViewport = { viewX: [10, 20], viewY: [-5, 5] };
      const original = { x: 15, y: 2.5 };
      const canvas = domainToCanvas(original.x, original.y, vp, W, H);
      const domain = canvasToDomain(canvas.px, canvas.py, vp, W, H);
      expect(domain.x).toBeCloseTo(original.x, 10);
      expect(domain.y).toBeCloseTo(original.y, 10);
    });
  });

  describe('hitTestPoint', () => {
    it('returns distance when within tolerance', () => {
      const point: Point2D = { x: 0.5, y: 0.5 };
      // Canvas center should be exactly at the point
      const dist = hitTestPoint(W / 2, H / 2, point, viewport, W, H, 10);
      expect(dist).toBeCloseTo(0, 5);
    });

    it('returns Infinity when outside tolerance', () => {
      const point: Point2D = { x: 0.5, y: 0.5 };
      // Far from the point
      const dist = hitTestPoint(0, 0, point, viewport, W, H, 5);
      expect(dist).toBe(Infinity);
    });

    it('returns distance for near miss', () => {
      const point: Point2D = { x: 0.5, y: 0.5 };
      // 5 pixels to the right of center
      const dist = hitTestPoint(W / 2 + 5, H / 2, point, viewport, W, H, 10);
      expect(dist).toBeCloseTo(5, 0);
      expect(dist).toBeLessThanOrEqual(10);
    });

    it('respects custom tolerance', () => {
      const point: Point2D = { x: 0, y: 0 };
      // 15 pixels away, default tolerance is 10 -> Infinity
      const dist1 = hitTestPoint(15, H - 15, point, viewport, W, H, 10);
      expect(dist1).toBe(Infinity);

      // Same distance, larger tolerance -> actual distance
      const dist2 = hitTestPoint(15, H - 15, point, viewport, W, H, 30);
      expect(dist2).toBeLessThan(30);
    });
  });

  describe('getCanvasPointerPosition', () => {
    it('computes correct offset from rect', () => {
      const mockCanvas = {
        getBoundingClientRect: vi.fn(() => ({
          left: 50,
          top: 100,
          width: W,
          height: H,
          right: 50 + W,
          bottom: 100 + H,
          x: 50,
          y: 100,
          toJSON: vi.fn(),
        })),
      } as unknown as HTMLCanvasElement;

      const event = { clientX: 200, clientY: 250 };
      const result = getCanvasPointerPosition(event, mockCanvas);
      expect(result.px).toBe(150); // 200 - 50
      expect(result.py).toBe(150); // 250 - 100
    });
  });
});
