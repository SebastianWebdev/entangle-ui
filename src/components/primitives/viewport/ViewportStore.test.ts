import { describe, it, expect, vi } from 'vitest';
import { ViewportStore } from './ViewportStore';
import type { ViewportTransform } from './Viewport.types';

describe('ViewportStore', () => {
  it('starts with identity transform and zero size', () => {
    const s = new ViewportStore();
    expect(s.getTransform()).toEqual({ x: 0, y: 0, zoom: 1 });
    expect(s.getSize()).toEqual({ width: 0, height: 0 });
    expect(s.getIsPanning()).toBe(false);
    expect(s.getMarqueeRect()).toBeNull();
  });

  it('returns a stable snapshot reference when nothing changes', () => {
    const s = new ViewportStore();
    expect(s.getSnapshot()).toBe(s.getSnapshot());
  });

  it('produces a new snapshot reference after a mutation', () => {
    const s = new ViewportStore();
    const before = s.getSnapshot();
    s.setSize({ width: 100, height: 100 });
    expect(s.getSnapshot()).not.toBe(before);
  });

  it('no-ops setTransform when called with identical reference', () => {
    const s = new ViewportStore();
    const listener = vi.fn();
    s.subscribeTransform(listener);
    const t: ViewportTransform = { x: 1, y: 2, zoom: 3 };
    s.setTransform(t);
    s.setTransform(t);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('no-ops setSize when dimensions are unchanged', () => {
    const s = new ViewportStore();
    const listener = vi.fn();
    s.subscribeSize(listener);
    s.setSize({ width: 400, height: 300 });
    s.setSize({ width: 400, height: 300 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires only the slice listeners + allListeners on a slice change', () => {
    const s = new ViewportStore();
    const transformCb = vi.fn();
    const sizeCb = vi.fn();
    const allCb = vi.fn();
    s.subscribeTransform(transformCb);
    s.subscribeSize(sizeCb);
    s.subscribe(allCb);

    s.setTransform({ x: 5, y: 5, zoom: 1 });

    expect(transformCb).toHaveBeenCalledTimes(1);
    expect(sizeCb).not.toHaveBeenCalled();
    expect(allCb).toHaveBeenCalledTimes(1);
  });

  it('routes isPanning and marquee changes to their slice listeners only', () => {
    const s = new ViewportStore();
    const panningCb = vi.fn();
    const marqueeCb = vi.fn();
    s.subscribeIsPanning(panningCb);
    s.subscribeMarquee(marqueeCb);

    s.setIsPanning(true);
    s.setMarqueeRect({ x: 0, y: 0, width: 10, height: 10 });

    expect(panningCb).toHaveBeenCalledTimes(1);
    expect(marqueeCb).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes correctly', () => {
    const s = new ViewportStore();
    const cb = vi.fn();
    const unsub = s.subscribeTransform(cb);
    s.setTransform({ x: 1, y: 1, zoom: 1 });
    unsub();
    s.setTransform({ x: 2, y: 2, zoom: 1 });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('invalidate(name) fires only that layer listener', () => {
    const s = new ViewportStore();
    const bg = vi.fn();
    const content = vi.fn();
    s.subscribeLayer('bg', bg);
    s.subscribeLayer('content', content);

    s.invalidate('bg');

    expect(bg).toHaveBeenCalledTimes(1);
    expect(content).not.toHaveBeenCalled();
  });

  it('invalidate() with no argument fires every layer listener', () => {
    const s = new ViewportStore();
    const bg = vi.fn();
    const content = vi.fn();
    s.subscribeLayer('bg', bg);
    s.subscribeLayer('content', content);

    s.invalidate();

    expect(bg).toHaveBeenCalledTimes(1);
    expect(content).toHaveBeenCalledTimes(1);
  });

  it('cleans up empty layer listener sets', () => {
    const s = new ViewportStore();
    const cb = vi.fn();
    const unsub = s.subscribeLayer('bg', cb);
    unsub();
    // After unsub the set is removed; invalidate should be a no-op
    s.invalidate('bg');
    expect(cb).not.toHaveBeenCalled();
  });

  it('snapshot reflects the current slice values', () => {
    const s = new ViewportStore();
    s.setTransform({ x: 5, y: 7, zoom: 2 });
    s.setSize({ width: 200, height: 100 });
    s.setIsPanning(true);
    s.setMarqueeRect({ x: 1, y: 2, width: 3, height: 4 });

    expect(s.getSnapshot()).toEqual({
      transform: { x: 5, y: 7, zoom: 2 },
      size: { width: 200, height: 100 },
      isPanning: true,
      marqueeRect: { x: 1, y: 2, width: 3, height: 4 },
    });
  });
});
