import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useClipboard } from './useClipboard';

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

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

  it('drops a stale slow copy when a newer copy resolves first', async () => {
    // First copy hangs; second copy resolves immediately with a different
    // result. The slow first copy must not flip the state once it lands.
    const deferred = createDeferred<void>();
    writeTextMock
      .mockImplementationOnce(() => deferred.promise)
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useClipboard());

    let firstCopyPromise: Promise<boolean> | undefined;
    act(() => {
      firstCopyPromise = result.current.copy('slow');
    });
    expect(result.current.status).toBe('idle');

    await act(async () => {
      await result.current.copy('fast');
    });
    expect(result.current.status).toBe('copied');

    // Now let the first call resolve LATE — the result must not stomp the
    // current "copied" state nor arm a stale timer.
    deferred.resolve();
    await act(async () => {
      await firstCopyPromise;
    });
    expect(result.current.status).toBe('copied');

    // The active timer belongs to the second call; it should still tick down.
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.status).toBe('idle');
  });

  it('a stale rejection does not overwrite a newer success', async () => {
    const deferred = createDeferred<void>();
    writeTextMock
      .mockImplementationOnce(() => deferred.promise)
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useClipboard());

    let firstCopyPromise: Promise<boolean> | undefined;
    act(() => {
      firstCopyPromise = result.current.copy('slow');
    });

    await act(async () => {
      await result.current.copy('fast');
    });
    expect(result.current.status).toBe('copied');
    expect(result.current.error).toBeNull();

    deferred.reject(new Error('late failure'));
    await act(async () => {
      await firstCopyPromise;
    });

    // Late rejection from the stale request must be ignored.
    expect(result.current.status).toBe('copied');
    expect(result.current.error).toBeNull();
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
