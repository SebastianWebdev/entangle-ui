import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventCallback } from './useEventCallback';

describe('useEventCallback', () => {
  it('returns a function that forwards arguments and return value', () => {
    const { result } = renderHook(() =>
      useEventCallback((a: number, b: number) => a + b)
    );
    expect(result.current(2, 3)).toBe(5);
  });

  it('preserves the same function identity across renders', () => {
    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: () => 'a' },
    });
    const first = result.current;

    rerender({ fn: () => 'b' });
    expect(result.current).toBe(first);

    rerender({ fn: () => 'c' });
    expect(result.current).toBe(first);
  });

  it('always invokes the most recently rendered callback', () => {
    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: () => 'first' },
    });
    expect(result.current()).toBe('first');

    rerender({ fn: () => 'second' });
    expect(result.current()).toBe('second');
  });

  it('reads the latest closed-over value, not the one from when it was created', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useEventCallback(() => value),
      { initialProps: { value: 1 } }
    );
    const stable = result.current;

    rerender({ value: 2 });
    rerender({ value: 3 });

    // Same function identity, but it reports the latest committed value.
    expect(stable).toBe(result.current);
    expect(stable()).toBe(3);
  });

  it('keeps the stable identity usable after the consumer re-renders', () => {
    const spy = vi.fn();
    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: spy },
    });

    act(() => {
      rerender({ fn: spy });
      result.current('x');
    });

    expect(spy).toHaveBeenCalledWith('x');
  });
});
