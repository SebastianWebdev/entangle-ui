// src/hooks/useKeyboard.test.ts
import { renderHook, act } from '@testing-library/react';
import { useKeyboard, useKeyPressed, useModifierKeys } from './useKeyboard';

 const createKeyboardEvent = (
    type: 'keydown' | 'keyup',
    options: {
      code?: string;
      key?: string;
      ctrlKey?: boolean;
      shiftKey?: boolean;
      altKey?: boolean;
      metaKey?: boolean;
    } = {}
  ) => {
    return new KeyboardEvent(type, {
      code: options.code ?? 'KeyA',
      key: options.key ?? 'a',
      ctrlKey: options.ctrlKey ?? false,
      shiftKey: options.shiftKey ?? false,
      altKey: options.altKey ?? false,
      metaKey: options.metaKey ?? false,
      bubbles: true,
    });
  };
import { vi } from 'vitest';

/**
 * Test suite for useKeyboard hook family
 * 
 * Covers:
 * - Basic keyboard state tracking
 * - Modifier key detection
 * - Key press/release cycles
 * - Configuration options
 * - Window focus/blur handling
 * - Performance optimization utilities
 * - Edge cases and cleanup
 */
describe('useKeyboard', () => {
  // Mock keyboard events
 

  // Cleanup after each test
  afterEach(() => {
    // Reset any pressed keys
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
  });

  describe('Basic Functionality', () => {
    it('initializes with empty state', () => {
      const { result } = renderHook(() => useKeyboard());
      
      expect(result.current.pressedKeys).toEqual([]);
      expect(result.current.ctrl).toBe(false);
      expect(result.current.shift).toBe(false);
      expect(result.current.alt).toBe(false);
      expect(result.current.meta).toBe(false);
    });

    it('tracks key press and release', () => {
      const { result } = renderHook(() => useKeyboard());
      
      // Press key
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyA' }));
      });
      
      expect(result.current.pressedKeys).toContain('KeyA');
      
      // Release key
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', { code: 'KeyA' }));
      });
      
      expect(result.current.pressedKeys).not.toContain('KeyA');
    });

    it('tracks multiple simultaneous key presses', () => {
      const { result } = renderHook(() => useKeyboard());
      
      // Press multiple keys
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyA' }));
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyB' }));
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'Space' }));
      });
      
      expect(result.current.pressedKeys).toEqual(['KeyA', 'KeyB', 'Space']);
      
      // Release one key
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', { code: 'KeyB' }));
      });
      
      expect(result.current.pressedKeys).toEqual(['KeyA', 'Space']);
    });

    it('prevents duplicate key entries', () => {
      const { result } = renderHook(() => useKeyboard());
      
      // Press same key multiple times
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyA' }));
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyA' }));
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyA' }));
      });
      
      expect(result.current.pressedKeys).toEqual(['KeyA']);
    });
  });

  describe('Modifier Keys', () => {
    it('tracks Ctrl key', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { 
          code: 'ControlLeft',
          ctrlKey: true 
        }));
      });
      
      expect(result.current.ctrl).toBe(true);
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', { 
          code: 'ControlLeft',
          ctrlKey: false 
        }));
      });
      
      expect(result.current.ctrl).toBe(false);
    });

    it('tracks Shift key', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { 
          code: 'ShiftLeft',
          shiftKey: true 
        }));
      });
      
      expect(result.current.shift).toBe(true);
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', { 
          code: 'ShiftLeft',
          shiftKey: false 
        }));
      });
      
      expect(result.current.shift).toBe(false);
    });

    it('tracks Alt key', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { 
          code: 'AltLeft',
          altKey: true 
        }));
      });
      
      expect(result.current.alt).toBe(true);
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', { 
          code: 'AltLeft',
          altKey: false 
        }));
      });
      
      expect(result.current.alt).toBe(false);
    });

    it('tracks Meta key', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { 
          code: 'MetaLeft',
          metaKey: true 
        }));
      });
      
      expect(result.current.meta).toBe(true);
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keyup', { 
          code: 'MetaLeft',
          metaKey: false 
        }));
      });
      
      expect(result.current.meta).toBe(false);
    });

    it('tracks multiple modifiers simultaneously', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { 
          code: 'KeyA',
          ctrlKey: true,
          shiftKey: true,
          altKey: true 
        }));
      });
      
      expect(result.current.ctrl).toBe(true);
      expect(result.current.shift).toBe(true);
      expect(result.current.alt).toBe(true);
      expect(result.current.meta).toBe(false);
    });
  });

  describe('Configuration Options', () => {
    it('can be disabled', () => {
      const { result } = renderHook(() => useKeyboard({ enabled: false }));
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyA' }));
      });
      
      expect(result.current.pressedKeys).toEqual([]);
      expect(result.current.ctrl).toBe(false);
    });

    it('can track only specific keys', () => {
      const { result } = renderHook(() => useKeyboard({
        trackAllKeys: false,
        trackedKeys: ['Space', 'Enter']
      }));
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyA' }));
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'Space' }));
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'Enter' }));
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyB' }));
      });
      
      expect(result.current.pressedKeys).toEqual(['Space', 'Enter']);
    });

    it('tracks all keys by default', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyA' }));
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'Space' }));
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'Digit1' }));
      });
      
      expect(result.current.pressedKeys).toEqual(['KeyA', 'Space', 'Digit1']);
    });

    it('respects dynamic option changes', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useKeyboard({ enabled }),
        { initialProps: { enabled: true } }
      );
      
      // Initially enabled
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyA' }));
      });
      expect(result.current.pressedKeys).toContain('KeyA');
      
      // Disable hook
      rerender({ enabled: false });
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyB' }));
      });
      expect(result.current.pressedKeys).toEqual(['KeyA']); // No new keys added
    });
  });

  describe('Window Focus/Blur Handling', () => {
    it('resets state on window blur', () => {
      const { result } = renderHook(() => useKeyboard());
      
      // Press some keys
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { 
          code: 'KeyA',
          ctrlKey: true,
          shiftKey: true
        }));
      });
      
      expect(result.current.pressedKeys).toContain('KeyA');
      expect(result.current.ctrl).toBe(true);
      expect(result.current.shift).toBe(true);
      
      // Simulate window blur
      act(() => {
        window.dispatchEvent(new Event('blur'));
      });
      
      expect(result.current.pressedKeys).toEqual([]);
      expect(result.current.ctrl).toBe(false);
      expect(result.current.shift).toBe(false);
      expect(result.current.alt).toBe(false);
      expect(result.current.meta).toBe(false);
    });

    it('resets state on window focus', () => {
      const { result } = renderHook(() => useKeyboard());
      
      // Press some keys
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { 
          code: 'KeyA',
          ctrlKey: true
        }));
      });
      
      expect(result.current.pressedKeys).toContain('KeyA');
      expect(result.current.ctrl).toBe(true);
      
      // Simulate window focus
      act(() => {
        window.dispatchEvent(new Event('focus'));
      });
      
      expect(result.current.pressedKeys).toEqual([]);
      expect(result.current.ctrl).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useKeyboard());
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('does not add listeners when disabled', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      renderHook(() => useKeyboard({ enabled: false }));
      
      expect(addEventListenerSpy).not.toHaveBeenCalled();
      
      addEventListenerSpy.mockRestore();
    });
  });
});

describe('useKeyPressed', () => {
  afterEach(() => {
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
  });

  it('returns false initially', () => {
    const { result } = renderHook(() => useKeyPressed('Space'));
    
    expect(result.current).toBe(false);
  });

  it('returns true when specified key is pressed', () => {
    const { result } = renderHook(() => useKeyPressed('Space'));
    
    act(() => {
      window.dispatchEvent(createKeyboardEvent('keydown', { code: 'Space' }));
    });
    
    expect(result.current).toBe(true);
  });

  it('returns false after key is released', () => {
    const { result } = renderHook(() => useKeyPressed('Space'));
    
    act(() => {
      window.dispatchEvent(createKeyboardEvent('keydown', { code: 'Space' }));
    });
    expect(result.current).toBe(true);
    
    act(() => {
      window.dispatchEvent(createKeyboardEvent('keyup', { code: 'Space' }));
    });
    expect(result.current).toBe(false);
  });

  it('ignores other keys', () => {
    const { result } = renderHook(() => useKeyPressed('Space'));
    
    act(() => {
      window.dispatchEvent(createKeyboardEvent('keydown', { code: 'KeyA' }));
      window.dispatchEvent(createKeyboardEvent('keydown', { code: 'Enter' }));
    });
    
    expect(result.current).toBe(false);
  });

  it('works with different key codes', () => {
    const testCases = ['Enter', 'Escape', 'KeyA', 'Digit1', 'ArrowUp'];
    
    testCases.forEach(keyCode => {
      const { result, unmount } = renderHook(() => useKeyPressed(keyCode));
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('keydown', { code: keyCode }));
      });
      
      expect(result.current).toBe(true);
      
      unmount();
    });
  });
});

describe('useModifierKeys', () => {
  const createKeyboardEvent = (
    type: 'keydown' | 'keyup',
    options: {
      code?: string;
      ctrlKey?: boolean;
      shiftKey?: boolean;
      altKey?: boolean;
      metaKey?: boolean;
    } = {}
  ) => {
    return new KeyboardEvent(type, {
      code: options.code ?? 'KeyA',
      ctrlKey: options.ctrlKey ?? false,
      shiftKey: options.shiftKey ?? false,
      altKey: options.altKey ?? false,
      metaKey: options.metaKey ?? false,
      bubbles: true,
    });
  };

  afterEach(() => {
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
  });

  it('returns all modifier states as false initially', () => {
    const { result } = renderHook(() => useModifierKeys());
    
    expect(result.current.ctrl).toBe(false);
    expect(result.current.shift).toBe(false);
    expect(result.current.alt).toBe(false);
    expect(result.current.meta).toBe(false);
  });

  it('tracks modifier key changes', () => {
    const { result } = renderHook(() => useModifierKeys());
    
    act(() => {
      window.dispatchEvent(createKeyboardEvent('keydown', { 
        ctrlKey: true,
        shiftKey: true
      }));
    });
    
    expect(result.current.ctrl).toBe(true);
    expect(result.current.shift).toBe(true);
    expect(result.current.alt).toBe(false);
    expect(result.current.meta).toBe(false);
  });

  it('updates when modifiers are released', () => {
    const { result } = renderHook(() => useModifierKeys());
    
    // Press modifiers
    act(() => {
      window.dispatchEvent(createKeyboardEvent('keydown', { 
        ctrlKey: true,
        shiftKey: true,
        altKey: true
      }));
    });
    
    expect(result.current.ctrl).toBe(true);
    expect(result.current.shift).toBe(true);
    expect(result.current.alt).toBe(true);
    
    // Release some modifiers
    act(() => {
      window.dispatchEvent(createKeyboardEvent('keyup', { 
        ctrlKey: false,
        shiftKey: true,
        altKey: true
      }));
    });
    
    expect(result.current.ctrl).toBe(false);
    expect(result.current.shift).toBe(true);
    expect(result.current.alt).toBe(true);
  });

  it('resets on window blur', () => {
    const { result } = renderHook(() => useModifierKeys());
    
    act(() => {
      window.dispatchEvent(createKeyboardEvent('keydown', { 
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
        metaKey: true
      }));
    });
    
    expect(result.current.ctrl).toBe(true);
    expect(result.current.shift).toBe(true);
    expect(result.current.alt).toBe(true);
    expect(result.current.meta).toBe(true);
    
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    
    expect(result.current.ctrl).toBe(false);
    expect(result.current.shift).toBe(false);
    expect(result.current.alt).toBe(false);
    expect(result.current.meta).toBe(false);
  });

  it('is more performant than full useKeyboard (does not track individual keys)', () => {
    const { result } = renderHook(() => useModifierKeys());
    
    act(() => {
      window.dispatchEvent(createKeyboardEvent('keydown', { 
        code: 'KeyA',
        ctrlKey: true
      }));
    });
    
    expect(result.current.ctrl).toBe(true);
    // Should not have pressedKeys property
    expect('pressedKeys' in result.current).toBe(false);
  });
});

describe('Edge Cases and Error Handling', () => {
  it('handles rapid key events correctly', () => {
    const { result } = renderHook(() => useKeyboard());
    
    // Rapid key presses
    act(() => {
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(createKeyboardEvent('keydown', { code: `Key${String.fromCharCode(65 + i)}` }));
      }
    });
    
    expect(result.current.pressedKeys).toHaveLength(10);
    
    // Rapid key releases
    act(() => {
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(createKeyboardEvent('keyup', { code: `Key${String.fromCharCode(65 + i)}` }));
      }
    });
    
    expect(result.current.pressedKeys).toHaveLength(0);
  });

  it('handles malformed key events gracefully', () => {
    const { result } = renderHook(() => useKeyboard());
    
    // Event without code property - should be filtered out by hook
    act(() => {
      const event = new KeyboardEvent('keydown', { bubbles: true });
      window.dispatchEvent(event);
    });
    
    // Should not add empty or undefined keys
    expect(result.current.pressedKeys).toEqual([]);
    expect(result.current.pressedKeys.every(key => key && key.length > 0)).toBe(true);
  });

  it('handles re-renders without losing state', () => {
    const { result, rerender } = renderHook(
      (props) => useKeyboard(props),
      { initialProps: {} }
    );
    
    act(() => {
      window.dispatchEvent(createKeyboardEvent('keydown', { 
        code: 'KeyA',
        ctrlKey: true
      }));
    });
    
    expect(result.current.pressedKeys).toContain('KeyA');
    expect(result.current.ctrl).toBe(true);
    
    // Force re-render with same props
    rerender({});
    
    expect(result.current.pressedKeys).toContain('KeyA');
    expect(result.current.ctrl).toBe(true);
  });
});
