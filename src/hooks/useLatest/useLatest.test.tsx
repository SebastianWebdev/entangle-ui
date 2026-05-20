import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLatest } from './useLatest';

describe('useLatest', () => {
  it('returns a ref whose current matches the initial value', () => {
    const { result } = renderHook(() => useLatest('initial'));
    expect(result.current.current).toBe('initial');
  });

  it('updates ref.current after each render', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 1 },
    });
    expect(result.current.current).toBe(1);

    rerender({ value: 2 });
    expect(result.current.current).toBe(2);

    rerender({ value: 3 });
    expect(result.current.current).toBe(3);
  });

  it('preserves the same ref identity across renders', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 'a' },
    });
    const firstRef = result.current;
    rerender({ value: 'b' });
    expect(result.current).toBe(firstRef);
  });

  it('keeps the latest function reference for use in handlers', () => {
    const first = (): string => 'first';
    const second = (): string => 'second';

    const { result, rerender } = renderHook(({ fn }) => useLatest(fn), {
      initialProps: { fn: first },
    });
    expect(result.current.current()).toBe('first');

    rerender({ fn: second });
    expect(result.current.current()).toBe('second');
  });

  it('handles null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string | null | undefined }) => useLatest(value),
      { initialProps: { value: 'x' as string | null | undefined } }
    );
    expect(result.current.current).toBe('x');

    rerender({ value: null });
    expect(result.current.current).toBeNull();

    rerender({ value: undefined });
    expect(result.current.current).toBeUndefined();
  });

  it('updates ref synchronously when consumer triggers a re-render', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 0 },
    });

    act(() => {
      rerender({ value: 42 });
    });
    expect(result.current.current).toBe(42);
  });
});
