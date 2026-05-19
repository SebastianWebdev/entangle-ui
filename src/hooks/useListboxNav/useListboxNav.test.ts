import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useListboxNav } from './useListboxNav';

interface Item {
  id: string;
  disabled?: boolean;
}

function fakeEvent(key: string): {
  event: KeyboardEvent;
  preventDefault: ReturnType<typeof vi.fn>;
} {
  const event = new KeyboardEvent('keydown', { key });
  const preventDefault = vi.fn();
  Object.defineProperty(event, 'preventDefault', { value: preventDefault });
  return { event, preventDefault };
}

describe('useListboxNav', () => {
  describe('Navigation', () => {
    it('starts with activeIndex = -1 by default', () => {
      const items: Item[] = [{ id: 'a' }, { id: 'b' }];
      const { result } = renderHook(() => useListboxNav({ items }));
      expect(result.current.activeIndex).toBe(-1);
    });

    it('respects defaultActiveIndex', () => {
      const items: Item[] = [{ id: 'a' }, { id: 'b' }];
      const { result } = renderHook(() =>
        useListboxNav({ items, defaultActiveIndex: 1 })
      );
      expect(result.current.activeIndex).toBe(1);
    });

    it('next() moves through items', () => {
      const items: Item[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const { result } = renderHook(() => useListboxNav({ items }));
      act(() => {
        result.current.next();
      });
      expect(result.current.activeIndex).toBe(0);
      act(() => {
        result.current.next();
      });
      expect(result.current.activeIndex).toBe(1);
    });

    it('next() loops to first by default', () => {
      const items: Item[] = [{ id: 'a' }, { id: 'b' }];
      const { result } = renderHook(() =>
        useListboxNav({ items, defaultActiveIndex: 1 })
      );
      act(() => {
        result.current.next();
      });
      expect(result.current.activeIndex).toBe(0);
    });

    it('next() clamps when loop=false', () => {
      const items: Item[] = [{ id: 'a' }, { id: 'b' }];
      const { result } = renderHook(() =>
        useListboxNav({ items, loop: false, defaultActiveIndex: 1 })
      );
      act(() => {
        result.current.next();
      });
      expect(result.current.activeIndex).toBe(1);
    });

    it('prev() loops to last by default', () => {
      const items: Item[] = [{ id: 'a' }, { id: 'b' }];
      const { result } = renderHook(() =>
        useListboxNav({ items, defaultActiveIndex: 0 })
      );
      act(() => {
        result.current.prev();
      });
      expect(result.current.activeIndex).toBe(1);
    });

    it('first()/last() jump to ends', () => {
      const items: Item[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const { result } = renderHook(() => useListboxNav({ items }));
      act(() => {
        result.current.last();
      });
      expect(result.current.activeIndex).toBe(2);
      act(() => {
        result.current.first();
      });
      expect(result.current.activeIndex).toBe(0);
    });

    it('skips disabled items', () => {
      const items: Item[] = [
        { id: 'a' },
        { id: 'b', disabled: true },
        { id: 'c' },
      ];
      const { result } = renderHook(() =>
        useListboxNav({ items, isItemDisabled: i => Boolean(i.disabled) })
      );
      act(() => {
        result.current.first();
      });
      expect(result.current.activeIndex).toBe(0);
      act(() => {
        result.current.next();
      });
      expect(result.current.activeIndex).toBe(2);
    });

    it('returns -1 when all items are disabled', () => {
      const items: Item[] = [
        { id: 'a', disabled: true },
        { id: 'b', disabled: true },
      ];
      const { result } = renderHook(() =>
        useListboxNav({ items, isItemDisabled: i => Boolean(i.disabled) })
      );
      act(() => {
        result.current.first();
      });
      expect(result.current.activeIndex).toBe(-1);
    });
  });

  describe('Selection', () => {
    it('selectActive() calls onSelect with the active item', () => {
      const items: Item[] = [{ id: 'a' }, { id: 'b' }];
      const onSelect = vi.fn();
      const { result } = renderHook(() =>
        useListboxNav({ items, onSelect, defaultActiveIndex: 1 })
      );
      act(() => {
        result.current.selectActive();
      });
      expect(onSelect).toHaveBeenCalledWith({ id: 'b' }, 1);
    });

    it('selectActive() does nothing when active item is disabled', () => {
      const items: Item[] = [{ id: 'a', disabled: true }];
      const onSelect = vi.fn();
      const { result } = renderHook(() =>
        useListboxNav({
          items,
          onSelect,
          defaultActiveIndex: 0,
          isItemDisabled: i => Boolean(i.disabled),
        })
      );
      act(() => {
        result.current.selectActive();
      });
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Reset on items change', () => {
    it('resets activeIndex when items reference changes', () => {
      const items1: Item[] = [{ id: 'a' }, { id: 'b' }];
      const items2: Item[] = [{ id: 'c' }];
      const { result, rerender } = renderHook(
        ({ items }: { items: Item[] }) =>
          useListboxNav({ items, defaultActiveIndex: 0 }),
        { initialProps: { items: items1 } }
      );
      act(() => {
        result.current.next();
      });
      expect(result.current.activeIndex).toBe(1);
      rerender({ items: items2 });
      expect(result.current.activeIndex).toBe(0);
    });

    it('does not reset when resetOnItemsChange is false', () => {
      const items1: Item[] = [{ id: 'a' }, { id: 'b' }];
      const items2: Item[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const { result, rerender } = renderHook(
        ({ items }: { items: Item[] }) =>
          useListboxNav({ items, resetOnItemsChange: false }),
        { initialProps: { items: items1 } }
      );
      act(() => {
        result.current.last();
      });
      expect(result.current.activeIndex).toBe(1);
      rerender({ items: items2 });
      expect(result.current.activeIndex).toBe(1);
    });
  });

  describe('Keyboard handler', () => {
    it('handles ArrowDown / ArrowUp', () => {
      const items: Item[] = [{ id: 'a' }, { id: 'b' }];
      const { result } = renderHook(() => useListboxNav({ items }));

      const down = fakeEvent('ArrowDown');
      act(() => {
        result.current.handleKeyDown(down.event);
      });
      expect(down.preventDefault).toHaveBeenCalled();
      expect(result.current.activeIndex).toBe(0);

      const up = fakeEvent('ArrowUp');
      act(() => {
        result.current.handleKeyDown(up.event);
      });
      expect(up.preventDefault).toHaveBeenCalled();
    });

    it('handles Home / End', () => {
      const items: Item[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const { result } = renderHook(() => useListboxNav({ items }));
      act(() => {
        result.current.handleKeyDown(fakeEvent('End').event);
      });
      expect(result.current.activeIndex).toBe(2);
      act(() => {
        result.current.handleKeyDown(fakeEvent('Home').event);
      });
      expect(result.current.activeIndex).toBe(0);
    });

    it('Enter triggers onSelect', () => {
      const items: Item[] = [{ id: 'a' }, { id: 'b' }];
      const onSelect = vi.fn();
      const { result } = renderHook(() =>
        useListboxNav({ items, onSelect, defaultActiveIndex: 0 })
      );
      act(() => {
        result.current.handleKeyDown(fakeEvent('Enter').event);
      });
      expect(onSelect).toHaveBeenCalledWith({ id: 'a' }, 0);
    });

    it('Escape calls onEscape and reports handled', () => {
      const items: Item[] = [{ id: 'a' }];
      const onEscape = vi.fn();
      const { result } = renderHook(() => useListboxNav({ items, onEscape }));
      let handled = false;
      act(() => {
        handled = result.current.handleKeyDown(fakeEvent('Escape').event);
      });
      expect(handled).toBe(true);
      expect(onEscape).toHaveBeenCalled();
    });

    it('Escape without onEscape returns false (unhandled)', () => {
      const items: Item[] = [{ id: 'a' }];
      const { result } = renderHook(() => useListboxNav({ items }));
      const e = fakeEvent('Escape');
      let handled = true;
      act(() => {
        handled = result.current.handleKeyDown(e.event);
      });
      expect(handled).toBe(false);
      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('returns false for unrelated keys', () => {
      const items: Item[] = [{ id: 'a' }];
      const { result } = renderHook(() => useListboxNav({ items }));
      let handled = true;
      act(() => {
        handled = result.current.handleKeyDown(fakeEvent('a').event);
      });
      expect(handled).toBe(false);
    });
  });
});
