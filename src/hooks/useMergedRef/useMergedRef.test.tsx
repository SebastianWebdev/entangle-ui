import { useRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMergedRef } from './useMergedRef';

describe('useMergedRef', () => {
  it('object refs receive the node', () => {
    let captured: HTMLDivElement | null = null;
    function C() {
      const a = useRef<HTMLDivElement>(null);
      const b = useRef<HTMLDivElement>(null);
      const merged = useMergedRef(a, b);
      // Capture refs after render via a layout effect-ish pattern.
      return (
        <div
          ref={node => {
            merged(node);
            captured = node;
            // Verify both refs received the node.
            (
              window as { __mergedTest?: { a: unknown; b: unknown } }
            ).__mergedTest = {
              a: a.current,
              b: b.current,
            };
          }}
        />
      );
    }
    const { unmount } = render(<C />);
    expect(captured).toBeInstanceOf(HTMLDivElement);
    const test = (window as { __mergedTest?: { a: unknown; b: unknown } })
      .__mergedTest;
    expect(test?.a).toBe(captured);
    expect(test?.b).toBe(captured);
    unmount();
  });

  it('callback refs receive the node', () => {
    const cbA = vi.fn();
    const cbB = vi.fn();
    function C() {
      const merged = useMergedRef<HTMLDivElement>(cbA, cbB);
      return <div ref={merged} />;
    }
    const { unmount } = render(<C />);
    expect(cbA).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    expect(cbB).toHaveBeenCalledWith(expect.any(HTMLDivElement));

    unmount();
    // On unmount React calls ref(null) for each ref.
    expect(cbA).toHaveBeenLastCalledWith(null);
    expect(cbB).toHaveBeenLastCalledWith(null);
  });

  it('handles a mix of object and callback refs', () => {
    const cb = vi.fn();
    let objRefValue: HTMLDivElement | null = null;
    function C() {
      const obj = useRef<HTMLDivElement>(null);
      const merged = useMergedRef<HTMLDivElement>(obj, cb);
      return (
        <div
          ref={node => {
            merged(node);
            objRefValue = obj.current;
          }}
        />
      );
    }
    render(<C />);
    expect(cb).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    expect(objRefValue).toBeInstanceOf(HTMLDivElement);
  });

  it('skips null and undefined refs without crashing', () => {
    const cb = vi.fn();
    function C() {
      const merged = useMergedRef<HTMLDivElement>(null, undefined, cb);
      return <div ref={merged} />;
    }
    expect(() => render(<C />)).not.toThrow();
    expect(cb).toHaveBeenCalled();
  });

  it('refs are set to null on unmount', () => {
    const cb = vi.fn();
    function C() {
      const merged = useMergedRef<HTMLDivElement>(cb);
      return <div ref={merged} />;
    }
    const { unmount } = render(<C />);
    cb.mockClear();
    unmount();
    expect(cb).toHaveBeenCalledWith(null);
  });
});
