import { useRef } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useResizeObserver } from './useResizeObserver';

type Listener = (entries: ResizeObserverEntry[]) => void;

const observers: Array<{
  listener: Listener;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}> = [];

class MockResizeObserver {
  listener: Listener;
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(cb: Listener) {
    this.listener = cb;
    observers.push(this);
  }
  unobserve = vi.fn();
}

const originalRO = globalThis.ResizeObserver;

beforeEach(() => {
  observers.length = 0;
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
  globalThis.ResizeObserver = originalRO;
});

function makeEntry(width: number): ResizeObserverEntry {
  return {
    contentRect: { width } as DOMRectReadOnly,
  } as ResizeObserverEntry;
}

describe('useResizeObserver', () => {
  function Probe({
    onResize,
    enabled,
  }: {
    onResize: (e: ResizeObserverEntry) => void;
    enabled?: boolean;
  }) {
    const ref = useRef<HTMLDivElement>(null);
    useResizeObserver(ref, onResize, { enabled });
    return <div ref={ref} data-testid="target" />;
  }

  it('attaches and fires callback on observed entry', () => {
    const onResize = vi.fn();
    render(<Probe onResize={onResize} />);
    expect(observers).toHaveLength(1);
    const ro = observers[0] as MockResizeObserver;
    expect(ro.observe).toHaveBeenCalledTimes(1);

    act(() => {
      ro.listener([makeEntry(100)]);
    });
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize.mock.calls[0]?.[0]).toHaveProperty('contentRect');
  });

  it('does not attach when enabled is false', () => {
    render(<Probe onResize={vi.fn()} enabled={false} />);
    expect(observers).toHaveLength(0);
  });

  it('attaches when enabled flips from false to true', () => {
    const onResize = vi.fn();
    const { rerender } = render(<Probe onResize={onResize} enabled={false} />);
    expect(observers).toHaveLength(0);

    rerender(<Probe onResize={onResize} enabled={true} />);
    expect(observers).toHaveLength(1);
  });

  it('disconnects on unmount', () => {
    const { unmount } = render(<Probe onResize={vi.fn()} />);
    const ro = observers[0] as MockResizeObserver;
    unmount();
    expect(ro.disconnect).toHaveBeenCalledTimes(1);
  });

  it('silently no-ops when ResizeObserver is undefined (SSR-like)', () => {
    globalThis.ResizeObserver = undefined as unknown as typeof ResizeObserver;
    expect(() => render(<Probe onResize={vi.fn()} />)).not.toThrow();
    expect(observers).toHaveLength(0);
  });

  it('uses the latest callback without re-subscribing', () => {
    const first = vi.fn<(e: ResizeObserverEntry) => void>();
    const second = vi.fn<(e: ResizeObserverEntry) => void>();
    const { rerender } = render(<Probe onResize={first} />);
    expect(observers).toHaveLength(1);

    rerender(<Probe onResize={second} />);
    // Still only one observer instance — no resubscription on callback change.
    expect(observers).toHaveLength(1);

    act(() => {
      (observers[0] as MockResizeObserver).listener([makeEntry(50)]);
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
