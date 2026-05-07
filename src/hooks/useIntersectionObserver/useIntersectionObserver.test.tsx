import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useIntersectionObserver } from './useIntersectionObserver';

interface MockObserver {
  callback: IntersectionObserverCallback;
  observed: Element[];
  disconnected: boolean;
  observe: (target: Element) => void;
  disconnect: () => void;
  trigger: (entry: Partial<IntersectionObserverEntry>) => void;
}

function setupMockIO() {
  const instances: MockObserver[] = [];
  class IO {
    callback: IntersectionObserverCallback;
    observed: Element[] = [];
    disconnected = false;
    constructor(cb: IntersectionObserverCallback) {
      this.callback = cb;
      instances.push(this as unknown as MockObserver);
    }
    observe(target: Element) {
      this.observed.push(target);
    }
    disconnect() {
      this.disconnected = true;
    }
    unobserve() {}
    takeRecords() {
      return [] as IntersectionObserverEntry[];
    }
    trigger(entry: Partial<IntersectionObserverEntry>) {
      this.callback([entry as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
  }
  // @ts-expect-error — assigning mock
  globalThis.IntersectionObserver = IO;
  return instances;
}

describe('useIntersectionObserver', () => {
  let originalIO: typeof IntersectionObserver | undefined;

  beforeEach(() => {
    originalIO = globalThis.IntersectionObserver;
  });

  afterEach(() => {
    if (originalIO) globalThis.IntersectionObserver = originalIO;
  });

  it('starts with entry=null and isIntersecting=false', () => {
    setupMockIO();
    const { result } = renderHook(() =>
      useIntersectionObserver<HTMLDivElement>()
    );
    expect(result.current.entry).toBeNull();
    expect(result.current.isIntersecting).toBe(false);
  });

  it('updates entry when the observer fires', () => {
    const instances = setupMockIO();
    const { result } = renderHook(() =>
      useIntersectionObserver<HTMLDivElement>()
    );

    act(() => {
      const node = document.createElement('div');
      result.current.ref(node);
    });

    expect(instances).toHaveLength(1);
    act(() => {
      instances[0]!.trigger({ isIntersecting: true });
    });
    expect(result.current.isIntersecting).toBe(true);
  });

  it('disconnects when ref is detached', () => {
    const instances = setupMockIO();
    const { result } = renderHook(() =>
      useIntersectionObserver<HTMLDivElement>()
    );

    act(() => {
      result.current.ref(document.createElement('div'));
    });
    const first = instances[0]!;

    act(() => {
      result.current.ref(null);
    });
    expect(first.disconnected).toBe(true);
  });

  it('disconnects on unmount', () => {
    const instances = setupMockIO();
    const { result, unmount } = renderHook(() =>
      useIntersectionObserver<HTMLDivElement>()
    );

    act(() => {
      result.current.ref(document.createElement('div'));
    });
    unmount();
    expect(instances[0]!.disconnected).toBe(true);
  });

  it('disconnects when enabled is toggled off', () => {
    const instances = setupMockIO();
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useIntersectionObserver<HTMLDivElement>({ enabled }),
      { initialProps: { enabled: true } }
    );

    act(() => {
      result.current.ref(document.createElement('div'));
    });
    const first = instances[0]!;

    rerender({ enabled: false });
    expect(first.disconnected).toBe(true);
  });

  it('returns a no-op ref when IntersectionObserver is unavailable', () => {
    // @ts-expect-error — simulate environments without IO
    delete globalThis.IntersectionObserver;
    const { result } = renderHook(() =>
      useIntersectionObserver<HTMLDivElement>()
    );

    // Should not throw.
    act(() => {
      result.current.ref(document.createElement('div'));
    });
    expect(result.current.isIntersecting).toBe(false);
  });
});
