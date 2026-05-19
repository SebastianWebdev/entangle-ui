import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useThrottledCallback } from './useThrottledCallback';

describe('useThrottledCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires the first call immediately by default', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(fn, 100));

    act(() => {
      result.current('a');
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('throttles intermediate calls and fires the latest at the end of the window', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(fn, 100));

    act(() => {
      result.current('a');
    });
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(50);
      result.current('b');
      result.current('c');
    });
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
  });

  it('with leading=false, defers the first call', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, 100, { leading: false })
    );

    act(() => {
      result.current('a');
    });
    expect(fn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('with trailing=false, drops calls inside the window', () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(fn, 100, { trailing: false })
    );

    act(() => {
      result.current('a');
      result.current('b');
      result.current('c');
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('allows another call after delay elapses without activity', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(fn, 100));

    act(() => {
      result.current('a');
    });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    act(() => {
      result.current('b');
    });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('b');
  });

  it('cancel() clears the pending trailing call', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(fn, 100));

    act(() => {
      result.current('a');
      result.current('b');
      result.current.cancel();
      vi.advanceTimersByTime(200);
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('cleans up timers on unmount', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useThrottledCallback(fn, 100));

    act(() => {
      result.current('a');
      result.current('b');
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
