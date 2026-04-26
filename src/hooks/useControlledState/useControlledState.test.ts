import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useControlledState } from './useControlledState';

describe('useControlledState', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('controlled mode', () => {
    it('returns the controlled value', () => {
      const { result } = renderHook(() =>
        useControlledState({ value: 'hello', fallback: '' })
      );
      expect(result.current[0]).toBe('hello');
    });

    it('updates returned value when controlled prop changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useControlledState({ value, fallback: '' }),
        { initialProps: { value: 'first' } }
      );
      expect(result.current[0]).toBe('first');

      rerender({ value: 'second' });
      expect(result.current[0]).toBe('second');
    });

    it('setValue calls onChange but does not change the returned value', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControlledState({
          value: 'locked',
          onChange,
          fallback: '',
        })
      );

      act(() => {
        result.current[1]('changed');
      });

      expect(onChange).toHaveBeenCalledWith('changed');
      expect(result.current[0]).toBe('locked');
    });

    it('functional setter receives the controlled value as prev', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControlledState({
          value: 5,
          onChange,
          fallback: 0,
        })
      );

      act(() => {
        result.current[1](prev => prev + 10);
      });

      expect(onChange).toHaveBeenCalledWith(15);
    });
  });

  describe('uncontrolled mode', () => {
    it('uses defaultValue as initial state', () => {
      const { result } = renderHook(() =>
        useControlledState({ defaultValue: 'init', fallback: '' })
      );
      expect(result.current[0]).toBe('init');
    });

    it('falls back when value and defaultValue are undefined', () => {
      const { result } = renderHook(() =>
        useControlledState<string>({ fallback: 'fb' })
      );
      expect(result.current[0]).toBe('fb');
    });

    it('treats defaultValue: null as a real value, not as missing', () => {
      const { result } = renderHook(() =>
        useControlledState<string | null>({
          defaultValue: null,
          fallback: 'fb',
        })
      );
      expect(result.current[0]).toBe(null);
    });

    it('setValue updates internal state', () => {
      const { result } = renderHook(() =>
        useControlledState({ defaultValue: 'a', fallback: '' })
      );

      act(() => {
        result.current[1]('b');
      });

      expect(result.current[0]).toBe('b');
    });

    it('setValue calls onChange', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControlledState({
          defaultValue: 'a',
          onChange,
          fallback: '',
        })
      );

      act(() => {
        result.current[1]('b');
      });

      expect(onChange).toHaveBeenCalledWith('b');
    });

    it('functional setter receives the latest internal value', () => {
      const { result } = renderHook(() =>
        useControlledState({ defaultValue: 0, fallback: 0 })
      );

      act(() => {
        result.current[1](prev => prev + 1);
      });
      act(() => {
        result.current[1](prev => prev + 1);
      });

      expect(result.current[0]).toBe(2);
    });
  });

  describe('controlled <-> uncontrolled switch', () => {
    it('warns when switching from uncontrolled to controlled', () => {
      const { rerender } = renderHook(
        ({ value }: { value?: string }) =>
          useControlledState({ value, defaultValue: 'a', fallback: '' }),
        { initialProps: { value: undefined as string | undefined } }
      );

      rerender({ value: 'controlled' });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('uncontrolled to controlled')
      );
    });

    it('warns when switching from controlled to uncontrolled', () => {
      const { rerender } = renderHook(
        ({ value }: { value?: string }) =>
          useControlledState({ value, defaultValue: 'a', fallback: '' }),
        { initialProps: { value: 'controlled' as string | undefined } }
      );

      rerender({ value: undefined });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('controlled to uncontrolled')
      );
    });

    it('does not warn on initial render', () => {
      renderHook(() => useControlledState({ value: 'x', fallback: '' }));
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
