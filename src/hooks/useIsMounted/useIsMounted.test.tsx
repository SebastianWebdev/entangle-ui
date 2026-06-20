import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMounted } from './useIsMounted';

describe('useIsMounted', () => {
  it('reports true while the component is mounted', () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current()).toBe(true);
  });

  it('reports false after the component unmounts', () => {
    const { result, unmount } = renderHook(() => useIsMounted());
    const isMounted = result.current;
    expect(isMounted()).toBe(true);

    unmount();
    expect(isMounted()).toBe(false);
  });

  it('preserves the same getter identity across renders', () => {
    const { result, rerender } = renderHook(() => useIsMounted());
    const first = result.current;

    rerender();
    expect(result.current).toBe(first);
  });
});
