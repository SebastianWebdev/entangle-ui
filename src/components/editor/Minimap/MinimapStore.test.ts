import { describe, it, expect, vi } from 'vitest';
import { MinimapStore } from './MinimapStore';

const BOUNDS = { x: 0, y: 0, width: 100, height: 100 };
const SIZE = { width: 50, height: 50 };
const TRANSFORM = { x: 0, y: 0, zoom: 1 };

describe('MinimapStore', () => {
  describe('geometry slice', () => {
    it('exposes default zero-state via getGeometry', () => {
      const store = new MinimapStore();
      const g = store.getGeometry();
      expect(g.transform).toEqual({ x: 0, y: 0, zoom: 1 });
      expect(g.viewportSize).toEqual({ width: 0, height: 0 });
      expect(g.worldBounds).toEqual({ x: 0, y: 0, width: 0, height: 0 });
      expect(g.minimapSize).toEqual({ width: 0, height: 0 });
    });

    it('setGeometry merges partials', () => {
      const store = new MinimapStore();
      store.setGeometry({ worldBounds: BOUNDS });
      expect(store.getGeometry().worldBounds).toBe(BOUNDS);
      store.setGeometry({ viewportSize: { width: 800, height: 400 } });
      expect(store.getGeometry().worldBounds).toBe(BOUNDS); // preserved
      expect(store.getGeometry().viewportSize).toEqual({
        width: 800,
        height: 400,
      });
    });

    it('notifies geometry listeners on relevant change', () => {
      const store = new MinimapStore();
      const cb = vi.fn();
      store.subscribeGeometry(cb);
      store.setGeometry({ worldBounds: BOUNDS });
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('does NOT notify when value-equivalent geometry is set', () => {
      const store = new MinimapStore();
      store.setGeometry({
        worldBounds: BOUNDS,
        viewportSize: SIZE,
        minimapSize: SIZE,
        transform: TRANSFORM,
      });
      const cb = vi.fn();
      store.subscribeGeometry(cb);
      // Equivalent object — different identity but same field values.
      store.setGeometry({
        worldBounds: { ...BOUNDS },
        viewportSize: { ...SIZE },
        minimapSize: { ...SIZE },
        transform: TRANSFORM,
      });
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('hover slice', () => {
    it('updates hover and notifies hover listeners only', () => {
      const store = new MinimapStore();
      const geomCb = vi.fn();
      const hoverCb = vi.fn();
      store.subscribeGeometry(geomCb);
      store.subscribeHover(hoverCb);
      store.setHover({ hoverWorldPoint: { x: 5, y: 5 }, hoveredItemId: 'A' });
      expect(hoverCb).toHaveBeenCalledTimes(1);
      expect(geomCb).not.toHaveBeenCalled();
    });

    it('no-ops on value-equivalent hover state', () => {
      const store = new MinimapStore();
      store.setHover({ hoverWorldPoint: { x: 5, y: 5 }, hoveredItemId: 'A' });
      const cb = vi.fn();
      store.subscribeHover(cb);
      store.setHover({ hoverWorldPoint: { x: 5, y: 5 }, hoveredItemId: 'A' });
      expect(cb).not.toHaveBeenCalled();
    });

    it('no-ops when clearing already-null hover', () => {
      const store = new MinimapStore();
      const cb = vi.fn();
      store.subscribeHover(cb);
      store.setHover({ hoverWorldPoint: null, hoveredItemId: null });
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('drag slice', () => {
    it('updates drag and notifies drag listeners only', () => {
      const store = new MinimapStore();
      const dragCb = vi.fn();
      const hoverCb = vi.fn();
      store.subscribeDrag(dragCb);
      store.subscribeHover(hoverCb);
      store.setIsDragging(true);
      expect(dragCb).toHaveBeenCalledTimes(1);
      expect(hoverCb).not.toHaveBeenCalled();
    });

    it('no-ops when state is unchanged', () => {
      const store = new MinimapStore();
      const cb = vi.fn();
      store.subscribeDrag(cb);
      store.setIsDragging(false);
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('full snapshot + subscribe', () => {
    it('snapshot reference is stable across no-op mutations', () => {
      const store = new MinimapStore();
      const a = store.getSnapshot();
      store.setIsDragging(false); // no-op
      const b = store.getSnapshot();
      expect(a).toBe(b);
    });

    it('snapshot changes on any slice mutation', () => {
      const store = new MinimapStore();
      const a = store.getSnapshot();
      store.setIsDragging(true);
      const b = store.getSnapshot();
      expect(a).not.toBe(b);
      expect(b.isDragging).toBe(true);
    });

    it('all-listener fires on any slice change', () => {
      const store = new MinimapStore();
      const cb = vi.fn();
      store.subscribe(cb);
      store.setIsDragging(true);
      store.setHover({ hoverWorldPoint: { x: 1, y: 1 }, hoveredItemId: null });
      store.setGeometry({ worldBounds: BOUNDS });
      expect(cb).toHaveBeenCalledTimes(3);
    });
  });

  describe('handle', () => {
    it('worldToMinimap / minimapToWorld round-trip after geometry set', () => {
      const store = new MinimapStore();
      store.setGeometry({
        worldBounds: { x: 0, y: 0, width: 200, height: 100 },
        minimapSize: { width: 100, height: 50 },
      });
      const onMap = store.handle.worldToMinimap({ x: 100, y: 50 });
      expect(onMap).toEqual({ x: 50, y: 25 });
      const back = store.handle.minimapToWorld(onMap);
      expect(back.x).toBeCloseTo(100);
      expect(back.y).toBeCloseTo(50);
    });

    it('focus / getElement proxy to configured callbacks', () => {
      const store = new MinimapStore();
      const el = document.createElement('div');
      const focus = vi.fn();
      store.configureHandle({ focus, getElement: () => el });
      store.handle.focus();
      expect(focus).toHaveBeenCalled();
      expect(store.handle.getElement()).toBe(el);
    });

    it('getElement returns null before configureHandle', () => {
      const store = new MinimapStore();
      expect(store.handle.getElement()).toBeNull();
    });
  });
});
