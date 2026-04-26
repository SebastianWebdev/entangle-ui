import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  let writeTextMock: ReturnType<typeof vi.fn>;
  let originalClipboard: PropertyDescriptor | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    originalClipboard = Object.getOwnPropertyDescriptor(
      globalThis.navigator,
      'clipboard'
    );
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalClipboard) {
      Object.defineProperty(
        globalThis.navigator,
        'clipboard',
        originalClipboard
      );
    } else {
      Reflect.deleteProperty(globalThis.navigator, 'clipboard');
    }
  });

  it('starts with idle status and no error', () => {
    const { result } = renderHook(() => useClipboard());

    expect(result.current.status).toBe('idle');
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('writes text via navigator.clipboard.writeText', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const ok = await result.current.copy('hello world');
      expect(ok).toBe(true);
    });

    expect(writeTextMock).toHaveBeenCalledWith('hello world');
  });

  it('flips status to "copied" on success and back to "idle" after the default timeout', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('text');
    });

    expect(result.current.status).toBe('copied');
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.copied).toBe(false);
  });

  it('respects a custom timeout', async () => {
    const { result } = renderHook(() => useClipboard({ timeout: 500 }));

    await act(async () => {
      await result.current.copy('text');
    });

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.status).toBe('copied');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.status).toBe('idle');
  });

  it('reset() returns to idle immediately', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('text');
    });
    expect(result.current.status).toBe('copied');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it('reports an error when writeText rejects', async () => {
    const failure = new Error('Permission denied');
    writeTextMock.mockRejectedValueOnce(failure);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const ok = await result.current.copy('text');
      expect(ok).toBe(false);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(failure);
  });

  it('does not stack timers across rapid copies — the latest call resets the timer', async () => {
    const { result } = renderHook(() => useClipboard({ timeout: 1000 }));

    await act(async () => {
      await result.current.copy('first');
    });

    act(() => {
      vi.advanceTimersByTime(700);
    });
    // Second copy resets the 1000ms window
    await act(async () => {
      await result.current.copy('second');
    });

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(result.current.status).toBe('copied');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.status).toBe('idle');
  });

  it('cancels the pending timer on unmount', async () => {
    const { result, unmount } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('text');
    });

    unmount();

    // No assertion error from setState-after-unmount means cleanup worked.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
  });

  it('returns false and sets status to error when no clipboard API and execCommand fails', async () => {
    Reflect.deleteProperty(globalThis.navigator, 'clipboard');
    const execMock = vi.fn(() => false);
    const docWithExec = document as Document & {
      execCommand?: typeof execMock;
    };
    const original = docWithExec.execCommand;
    docWithExec.execCommand = execMock;

    const { result } = renderHook(() => useClipboard());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy('text');
    });

    expect(ok).toBe(false);
    expect(execMock).toHaveBeenCalledWith('copy');
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBeInstanceOf(Error);

    docWithExec.execCommand = original;
  });

  it('uses document.execCommand fallback when navigator.clipboard is missing', async () => {
    Reflect.deleteProperty(globalThis.navigator, 'clipboard');
    const execMock = vi.fn(() => true);
    const docWithExec = document as Document & {
      execCommand?: typeof execMock;
    };
    const original = docWithExec.execCommand;
    docWithExec.execCommand = execMock;

    const { result } = renderHook(() => useClipboard());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy('text');
    });

    expect(ok).toBe(true);
    expect(execMock).toHaveBeenCalledWith('copy');
    expect(result.current.status).toBe('copied');

    docWithExec.execCommand = original;
  });
});
