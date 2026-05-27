import { describe, it, expect, vi } from 'vitest';
import { AssetBrowserStore } from './AssetBrowserStore';

describe('AssetBrowserStore', () => {
  describe('focus slice', () => {
    it('notifies focus listeners only on change', () => {
      const store = new AssetBrowserStore();
      const listener = vi.fn();
      store.subscribeFocus(listener);

      store.setFocusedId('a');
      store.setFocusedId('a'); // no-op
      store.setFocusedId('b');

      expect(listener).toHaveBeenCalledTimes(2);
      expect(store.getFocusedId()).toBe('b');
    });

    it('does not notify other slices', () => {
      const store = new AssetBrowserStore();
      const marquee = vi.fn();
      store.subscribeMarquee(marquee);

      store.setFocusedId('a');
      expect(marquee).not.toHaveBeenCalled();
    });
  });

  describe('marquee slice', () => {
    it('skips notification for an equal rect', () => {
      const store = new AssetBrowserStore();
      const listener = vi.fn();
      store.subscribeMarquee(listener);

      const rect = { x: 0, y: 0, width: 10, height: 10 };
      store.setMarquee({ active: true, rect, additive: false });
      store.setMarquee({ active: true, rect: { ...rect }, additive: false });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('clears back to the inactive default', () => {
      const store = new AssetBrowserStore();
      store.setMarquee({
        active: true,
        rect: { x: 1, y: 1, width: 2, height: 2 },
        additive: true,
      });
      store.clearMarquee();
      expect(store.getMarquee()).toEqual({
        active: false,
        rect: null,
        additive: false,
      });
    });
  });

  describe('drag slice', () => {
    it('no-ops when drag state is unchanged', () => {
      const store = new AssetBrowserStore();
      const listener = vi.fn();
      store.subscribeDrag(listener);

      store.setDrag({
        active: true,
        draggingIds: ['a', 'b'],
        dropTargetId: 'f1',
        externalOver: false,
      });
      store.setDrag({
        active: true,
        draggingIds: ['a', 'b'],
        dropTargetId: 'f1',
        externalOver: false,
      });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('detects dropTarget changes', () => {
      const store = new AssetBrowserStore();
      const listener = vi.fn();
      store.subscribeDrag(listener);

      store.setDrag({
        active: true,
        draggingIds: ['a'],
        dropTargetId: 'f1',
        externalOver: false,
      });
      store.setDrag({
        active: true,
        draggingIds: ['a'],
        dropTargetId: 'f2',
        externalOver: false,
      });

      expect(listener).toHaveBeenCalledTimes(2);
      expect(store.getDrag().dropTargetId).toBe('f2');
    });

    it('unsubscribes cleanly', () => {
      const store = new AssetBrowserStore();
      const listener = vi.fn();
      const off = store.subscribeDrag(listener);
      off();
      store.setDrag({
        active: true,
        draggingIds: [],
        dropTargetId: null,
        externalOver: true,
      });
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
