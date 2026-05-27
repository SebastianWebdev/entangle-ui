import { describe, it, expect, vi } from 'vitest';
import { TimelineStore } from './TimelineStore';

describe('TimelineStore', () => {
  describe('geometry slice', () => {
    it('exposes defaults', () => {
      const store = new TimelineStore();
      const g = store.getGeometry();
      expect(g.view).toEqual({ startFrame: 0, endFrame: 1 });
      expect(g.size).toEqual({ width: 0, height: 0 });
      expect(g.mode).toBe('dope-sheet');
    });

    it('merges partials and notifies geometry + all listeners', () => {
      const store = new TimelineStore();
      const geo = vi.fn();
      const all = vi.fn();
      store.subscribeGeometry(geo);
      store.subscribe(all);
      store.setGeometry({ view: { startFrame: 0, endFrame: 100 } });
      expect(store.getGeometry().view).toEqual({
        startFrame: 0,
        endFrame: 100,
      });
      expect(geo).toHaveBeenCalledTimes(1);
      expect(all).toHaveBeenCalledTimes(1);
      store.setGeometry({ size: { width: 640, height: 200 } });
      // unrelated slice fields are preserved
      expect(store.getGeometry().view).toEqual({
        startFrame: 0,
        endFrame: 100,
      });
    });

    it('is a no-op when geometry is unchanged', () => {
      const store = new TimelineStore();
      store.setGeometry({ view: { startFrame: 0, endFrame: 100 } });
      const geo = vi.fn();
      store.subscribeGeometry(geo);
      store.setGeometry({ view: { startFrame: 0, endFrame: 100 } });
      expect(geo).not.toHaveBeenCalled();
    });
  });

  describe('playhead slice', () => {
    it('updates frame + playing and notifies', () => {
      const store = new TimelineStore();
      const ph = vi.fn();
      store.subscribePlayhead(ph);
      store.setPlayhead({ frame: 42 });
      expect(store.getPlayhead().frame).toBe(42);
      expect(store.getPlayhead().playing).toBe(false);
      store.setPlayhead({ playing: true });
      expect(store.getPlayhead()).toEqual({ frame: 42, playing: true });
      expect(ph).toHaveBeenCalledTimes(2);
    });

    it('is a no-op when unchanged', () => {
      const store = new TimelineStore();
      store.setPlayhead({ frame: 5 });
      const ph = vi.fn();
      store.subscribePlayhead(ph);
      store.setPlayhead({ frame: 5 });
      expect(ph).not.toHaveBeenCalled();
    });
  });

  describe('selection slice', () => {
    it('tracks selection and membership', () => {
      const store = new TimelineStore();
      const sel = vi.fn();
      store.subscribeSelection(sel);
      store.setSelection([{ trackId: 't1', keyframeId: 'k1' }]);
      expect(store.isSelected({ trackId: 't1', keyframeId: 'k1' })).toBe(true);
      expect(store.isSelected({ trackId: 't1', keyframeId: 'k2' })).toBe(false);
      expect(sel).toHaveBeenCalledTimes(1);
    });

    it('is a no-op when the set is equal regardless of order', () => {
      const store = new TimelineStore();
      store.setSelection([
        { trackId: 't1', keyframeId: 'k1' },
        { trackId: 't2', keyframeId: 'k2' },
      ]);
      const sel = vi.fn();
      store.subscribeSelection(sel);
      store.setSelection([
        { trackId: 't2', keyframeId: 'k2' },
        { trackId: 't1', keyframeId: 'k1' },
      ]);
      expect(sel).not.toHaveBeenCalled();
    });
  });

  describe('imperative handle', () => {
    it('proxies seek/play/pause/toggle to wired handlers', () => {
      const store = new TimelineStore();
      const seek = vi.fn();
      const setPlaying = vi.fn();
      store.configureHandle({
        focus: vi.fn(),
        getElement: () => null,
        seek,
        setPlaying,
        zoomToFit: vi.fn(),
        zoomToSelection: vi.fn(),
      });
      store.handle.seek(10);
      expect(seek).toHaveBeenCalledWith(10);
      store.handle.play();
      expect(setPlaying).toHaveBeenLastCalledWith(true);
      store.handle.pause();
      expect(setPlaying).toHaveBeenLastCalledWith(false);
      store.setPlayhead({ playing: true });
      store.handle.toggle();
      expect(setPlaying).toHaveBeenLastCalledWith(false);
    });

    it('frameToX/xToFrame/getView reflect current geometry', () => {
      const store = new TimelineStore();
      store.setGeometry({
        view: { startFrame: 0, endFrame: 100 },
        size: { width: 200, height: 100 },
      });
      expect(store.handle.frameToX(50)).toBe(100);
      expect(store.handle.xToFrame(100)).toBeCloseTo(50);
      expect(store.handle.getView()).toEqual({ startFrame: 0, endFrame: 100 });
    });

    it('getElement falls back to null without handlers', () => {
      const store = new TimelineStore();
      expect(store.handle.getElement()).toBeNull();
    });
  });

  describe('snapshot', () => {
    it('reflects geometry + playhead + selection', () => {
      const store = new TimelineStore();
      store.setGeometry({
        view: { startFrame: 0, endFrame: 100 },
        size: { width: 200, height: 100 },
        fps: 24,
      });
      store.setPlayhead({ frame: 25 });
      const snap = store.getSnapshot();
      expect(snap.fps).toBe(24);
      expect(snap.frame).toBe(25);
      expect(snap.frameToX(50)).toBe(100);
    });
  });
});
