import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useNavigationHistory } from './useNavigationHistory';

describe('useNavigationHistory', () => {
  it('starts empty when no initial entry is provided', () => {
    const { result } = renderHook(() => useNavigationHistory<string>());
    expect(result.current.current).toBeUndefined();
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  it('seeds the stack with the initial entry', () => {
    const { result } = renderHook(() =>
      useNavigationHistory<string>({ initial: 'root' })
    );
    expect(result.current.current).toBe('root');
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  it('push extends the stack and enables Back', () => {
    const { result } = renderHook(() =>
      useNavigationHistory<string>({ initial: 'root' })
    );
    act(() => {
      result.current.push('folder1');
    });
    expect(result.current.current).toBe('folder1');
    expect(result.current.canGoBack).toBe(true);
    expect(result.current.canGoForward).toBe(false);
  });

  it('goBack / goForward walk the stack and return the new current entry', () => {
    const { result } = renderHook(() =>
      useNavigationHistory<string>({ initial: 'root' })
    );
    act(() => {
      result.current.push('a');
      result.current.push('b');
    });

    let target: string | undefined;
    act(() => {
      target = result.current.goBack();
    });
    expect(target).toBe('a');
    expect(result.current.current).toBe('a');
    expect(result.current.canGoForward).toBe(true);

    act(() => {
      target = result.current.goForward();
    });
    expect(target).toBe('b');
    expect(result.current.canGoForward).toBe(false);
  });

  it('push after goBack truncates the forward branch', () => {
    const { result } = renderHook(() =>
      useNavigationHistory<string>({ initial: 'root' })
    );
    act(() => {
      result.current.push('a');
      result.current.push('b');
      result.current.goBack(); // back to 'a'
      result.current.push('c'); // 'b' should be discarded
    });
    expect(result.current.current).toBe('c');
    expect(result.current.canGoForward).toBe(false);

    act(() => {
      result.current.goBack();
    });
    expect(result.current.current).toBe('a'); // 'b' is gone
  });

  it('pushing the current entry is a no-op', () => {
    const { result } = renderHook(() =>
      useNavigationHistory<string>({ initial: 'root' })
    );
    act(() => {
      result.current.push('root');
    });
    expect(result.current.canGoBack).toBe(false);
  });

  it('goBack at index 0 / goForward at end return undefined', () => {
    const { result } = renderHook(() =>
      useNavigationHistory<string>({ initial: 'root' })
    );
    let target: string | undefined = 'placeholder';
    act(() => {
      target = result.current.goBack();
    });
    expect(target).toBeUndefined();
    act(() => {
      target = result.current.goForward();
    });
    expect(target).toBeUndefined();
  });

  it('reset(entry) replaces the stack with a single entry', () => {
    const { result } = renderHook(() =>
      useNavigationHistory<string>({ initial: 'root' })
    );
    act(() => {
      result.current.push('a');
      result.current.push('b');
      result.current.reset('home');
    });
    expect(result.current.current).toBe('home');
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  it('reset() clears the stack', () => {
    const { result } = renderHook(() =>
      useNavigationHistory<string>({ initial: 'root' })
    );
    act(() => {
      result.current.reset();
    });
    expect(result.current.current).toBeUndefined();
  });

  it('enabled=false masks canGoBack/canGoForward and makes mutations no-op', () => {
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useNavigationHistory<string>({ initial: 'root', enabled }),
      { initialProps: { enabled: true } }
    );

    act(() => {
      result.current.push('a');
    });
    expect(result.current.canGoBack).toBe(true);

    rerender({ enabled: false });
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);

    // Mutations no-op while disabled — re-enable to inspect the underlying state.
    act(() => {
      result.current.push('b');
    });
    rerender({ enabled: true });
    expect(result.current.current).toBe('a'); // 'b' was never pushed
  });

  it('reset is allowed even when disabled (escape hatch for re-seeding)', () => {
    const { result } = renderHook(() =>
      useNavigationHistory<string>({ initial: 'root', enabled: false })
    );
    act(() => {
      result.current.reset('home');
    });
    expect(result.current.current).toBe('home');
  });
});
