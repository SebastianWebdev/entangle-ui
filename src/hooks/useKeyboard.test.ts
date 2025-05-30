// src/hooks/useKeyboard.test.ts
import { renderHook, act } from '@testing-library/react';
import { useKeyboard } from './useKeyboard';
import { vi } from 'vitest';

// Helper function to create keyboard events
const createKeyboardEvent = (type: 'keydown' | 'keyup', key: string, modifiers?: {
  controlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}): KeyboardEvent => {
  const event = new KeyboardEvent(type, {
    key,
    ctrlKey: modifiers?. controlKey ?? false,
    shiftKey: modifiers?.shiftKey ?? false,
    altKey: modifiers?.altKey ?? false,
    metaKey: modifiers?.metaKey ?? false,
    bubbles: true,
    cancelable: true,
  });
  return event;
};

describe('useKeyboard', () => {
  beforeEach(() => {
    // Spy on window event listeners
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    // Clean up all spies
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should return initial empty state', () => {
      const { result } = renderHook(() => useKeyboard());

      expect(result.current).toEqual({
        pressedKeys: [],
        modifiers: {
           control: false,
          shift: false,
          alt: false,
          meta: false,
        },
      });
    });

    it('should add event listeners on mount', () => {
      renderHook(() => useKeyboard());

      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    it('should remove event listeners on unmount', () => {
      const { unmount } = renderHook(() => useKeyboard());

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
    });
  });

  describe('modifier keys tracking', () => {
    it('should track  control key press and release', () => {
      const { result } = renderHook(() => useKeyboard());

      // Press  control
      act(() => {
        const event = createKeyboardEvent('keydown', 'Control');
        window.dispatchEvent(event);
      });

      expect(result.current.modifiers. control).toBe(true);
      expect(result.current.modifiers.shift).toBe(false);

      // Release  control
      act(() => {
        const event = createKeyboardEvent('keyup', 'Control');
        window.dispatchEvent(event);
      });

      expect(result.current.modifiers. control).toBe(false);
    });

    it('should track shift key press and release', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        const event = createKeyboardEvent('keydown', 'Shift');
        window.dispatchEvent(event);
      });

      expect(result.current.modifiers.shift).toBe(true);

      act(() => {
        const event = createKeyboardEvent('keyup', 'Shift');
        window.dispatchEvent(event);
      });

      expect(result.current.modifiers.shift).toBe(false);
    });

    it('should track alt key press and release', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        const event = createKeyboardEvent('keydown', 'Alt');
        window.dispatchEvent(event);
      });

      expect(result.current.modifiers.alt).toBe(true);

      act(() => {
        const event = createKeyboardEvent('keyup', 'Alt');
        window.dispatchEvent(event);
      });

      expect(result.current.modifiers.alt).toBe(false);
    });

    it('should track meta key press and release', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        const event = createKeyboardEvent('keydown', 'Meta');
        window.dispatchEvent(event);
      });

      expect(result.current.modifiers.meta).toBe(true);

      act(() => {
        const event = createKeyboardEvent('keyup', 'Meta');
        window.dispatchEvent(event);
      });

      expect(result.current.modifiers.meta).toBe(false);
    });

    it('should track multiple modifier keys simultaneously', () => {
      const { result } = renderHook(() => useKeyboard());

      // Press  control and shift
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'Control'));
        window.dispatchEvent(createKeyboardEvent('keydown', 'Shift'));
      });

      expect(result.current.modifiers. control).toBe(true);
      expect(result.current.modifiers.shift).toBe(true);
      expect(result.current.modifiers.alt).toBe(false);
      expect(result.current.modifiers.meta).toBe(false);

      // Release only  control
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', 'Control'));
      });

      expect(result.current.modifiers. control).toBe(false);
      expect(result.current.modifiers.shift).toBe(true);
    });
  });

  describe('regular key tracking', () => {
    it('should track regular key presses', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'a'));
      });
      console.log(result.current)
      expect(result.current.pressedKeys).toContain('a');

      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', 'a'));
      });

      expect(result.current.pressedKeys).not.toContain('a');
    });

    it('should track multiple regular keys', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'a'));
        window.dispatchEvent(createKeyboardEvent('keydown', 'b'));
        window.dispatchEvent(createKeyboardEvent('keydown', 'c'));
      });

      expect(result.current.pressedKeys).toEqual(expect.arrayContaining(['a', 'b', 'c']));
      expect(result.current.pressedKeys).toHaveLength(3);

      // Release one key
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', 'b'));
      });

      expect(result.current.pressedKeys).toEqual(expect.arrayContaining(['a', 'c']));
      expect(result.current.pressedKeys).not.toContain('b');
      expect(result.current.pressedKeys).toHaveLength(2);
    });

    it('should handle special keys like Space and Enter', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', ' ')); // Space
        window.dispatchEvent(createKeyboardEvent('keydown', 'Enter'));
        window.dispatchEvent(createKeyboardEvent('keydown', 'Escape'));
      });

      expect(result.current.pressedKeys).toEqual(expect.arrayContaining([' ', 'enter', 'escape']));
    });
  });

  describe('mixed modifier and regular keys', () => {
    it('should track modifiers and regular keys separately', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'Control'));
        window.dispatchEvent(createKeyboardEvent('keydown', 'a'));
        window.dispatchEvent(createKeyboardEvent('keydown', 'Shift'));
        window.dispatchEvent(createKeyboardEvent('keydown', 'b'));
      });

      expect(result.current.modifiers. control).toBe(true);
      expect(result.current.modifiers.shift).toBe(true);
      expect(result.current.pressedKeys).toEqual(expect.arrayContaining(['a', 'b']));
      expect(result.current.pressedKeys).toHaveLength(2);
    });

    it('should handle  control+key combinations correctly', () => {
      const { result } = renderHook(() => useKeyboard());

      

      // Simulate  control+S
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'Control'));
        window.dispatchEvent(createKeyboardEvent('keydown', 's'));
      });

      console.log(result.current)

      expect(result.current.modifiers. control).toBe(true);
      expect(result.current.pressedKeys).toContain('s');

      // Release both
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', 'Control'));
        window.dispatchEvent(createKeyboardEvent('keyup', 's'));
      });

      expect(result.current.modifiers. control).toBe(false);
      expect(result.current.pressedKeys).not.toContain('s');
    });
  });

  describe('edge cases', () => {
    it('should not add duplicate keys when pressed multiple times', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'a'));
        window.dispatchEvent(createKeyboardEvent('keydown', 'a'));
        window.dispatchEvent(createKeyboardEvent('keydown', 'a'));
      });

      expect(result.current.pressedKeys.filter(key => key === 'a')).toHaveLength(1);
    });

    it('should handle keyup without corresponding keydown', () => {
      const { result } = renderHook(() => useKeyboard());

      // Try to release a key that was never pressed
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', 'a'));
      });

      expect(result.current.pressedKeys).not.toContain('a');
      expect(result.current.pressedKeys).toHaveLength(0);
    });

    it('should handle case sensitivity correctly', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'A')); // Uppercase
      });

      expect(result.current.pressedKeys).toContain('a'); // Should be lowercase

      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', 'A'));
      });

      expect(result.current.pressedKeys).not.toContain('a');
    });
  });

  describe('memory stability', () => {
    it('should maintain reference stability when state does not change', () => {
      const { result, rerender } = renderHook(() => useKeyboard());

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('should return new object when state changes', () => {
      const { result } = renderHook(() => useKeyboard());

      const initialResult = result.current;

      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', 'a'));
      });

      expect(result.current).not.toBe(initialResult);
    });
  });
});