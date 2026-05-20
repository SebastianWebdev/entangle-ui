import React, { useRef, useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, render, act } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Viewport } from './Viewport';
import { ViewportLayer } from './ViewportLayer';
import { ViewportWorld } from './ViewportWorld';
import { ViewportOverlay } from './ViewportOverlay';
import { useViewportContext } from './ViewportContext';
import type {
  ViewportHandle,
  ViewportSelectionEvent,
  ViewportTransform,
} from './Viewport.types';

import '@/theme/darkTheme.css';

// ─── PointerEvent polyfill (jsdom doesn't ship PointerEvent) ───

class MockPointerEvent extends MouseEvent {
  readonly pointerId: number;
  readonly pointerType: string;
  readonly isPrimary: boolean;
  constructor(type: string, params: PointerEventInit & MouseEventInit = {}) {
    super(type, { bubbles: true, ...params });
    this.pointerId = params.pointerId ?? 0;
    this.pointerType = params.pointerType ?? 'mouse';
    this.isPrimary = params.isPrimary ?? true;
  }
}
globalThis.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;

const VIEWPORT_RECT = {
  width: 400,
  height: 300,
  top: 0,
  left: 0,
  right: 400,
  bottom: 300,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

let resizeObserverCallbacks: Array<(entries: ResizeObserverEntry[]) => void>;

class MockResizeObserver {
  callback: (entries: ResizeObserverEntry[]) => void;
  constructor(callback: (entries: ResizeObserverEntry[]) => void) {
    this.callback = callback;
    resizeObserverCallbacks.push(callback);
  }
  observe(): void {
    // Fire once with viewport size so size state populates synchronously
    this.callback([
      {
        contentRect: VIEWPORT_RECT as unknown as DOMRectReadOnly,
        target: document.createElement('div'),
      } as unknown as ResizeObserverEntry,
    ]);
  }
  unobserve(): void {}
  disconnect(): void {}
}

beforeEach(() => {
  resizeObserverCallbacks = [];

  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);

  HTMLElement.prototype.getBoundingClientRect = vi.fn(
    () => VIEWPORT_RECT as DOMRect
  );

  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    setTransform: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    setLineDash: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 20 })),
    save: vi.fn(),
    restore: vi.fn(),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    cb(0);
    return 0;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Helpers ───

const getRoot = (): HTMLElement => screen.getByTestId('viewport');

// ═══════════════════════════════════════
// Rendering
// ═══════════════════════════════════════

describe('Viewport', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Viewport testId="viewport" />);
      const root = getRoot();
      expect(root).toBeInTheDocument();
      expect(root).toHaveAttribute('role', 'application');
      expect(root.tabIndex).toBe(0);
    });

    it('applies aria attributes', () => {
      renderWithTheme(
        <Viewport
          testId="viewport"
          ariaLabel="Editor canvas"
          ariaRoledescription="2D editor"
          role="region"
        />
      );
      const root = getRoot();
      expect(root).toHaveAttribute('aria-label', 'Editor canvas');
      expect(root).toHaveAttribute('aria-roledescription', '2D editor');
      expect(root).toHaveAttribute('role', 'region');
    });

    it('renders disabled state with tabIndex -1', () => {
      renderWithTheme(<Viewport testId="viewport" disabled />);
      const root = getRoot();
      expect(root.tabIndex).toBe(-1);
    });

    it('categorizes children into layers, world, overlay', () => {
      renderWithTheme(
        <Viewport testId="viewport">
          <ViewportLayer name="bg" draw={() => {}} />
          <ViewportLayer name="fg" draw={() => {}} />
          <ViewportWorld>
            <div data-testid="world-child">node</div>
          </ViewportWorld>
          <ViewportOverlay>
            <div data-testid="overlay-child">tools</div>
          </ViewportOverlay>
        </Viewport>
      );
      // Two layer canvases
      const canvases = getRoot().querySelectorAll('[data-viewport-layer]');
      expect(canvases.length).toBe(2);
      expect(canvases[0]).toHaveAttribute('data-viewport-layer', 'bg');
      expect(canvases[1]).toHaveAttribute('data-viewport-layer', 'fg');
      // World + overlay
      expect(screen.getByTestId('world-child')).toBeInTheDocument();
      expect(screen.getByTestId('overlay-child')).toBeInTheDocument();
    });

    it('silently ignores unknown children', () => {
      renderWithTheme(
        <Viewport testId="viewport">
          <ViewportLayer name="bg" draw={() => {}} />
          <div data-testid="stray">stray</div>
        </Viewport>
      );
      expect(screen.queryByTestId('stray')).not.toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════
  // Transform (controlled / uncontrolled)
  // ═══════════════════════════════════════

  describe('Transform', () => {
    it('uses defaultTransform when uncontrolled', () => {
      const Probe: React.FC = () => {
        const { transform } = useViewportContext();
        return <span data-testid="probe">{JSON.stringify(transform)}</span>;
      };
      renderWithTheme(
        <Viewport
          testId="viewport"
          defaultTransform={{ x: 10, y: 20, zoom: 2 }}
        >
          <ViewportOverlay>
            <Probe />
          </ViewportOverlay>
        </Viewport>
      );
      expect(screen.getByTestId('probe')).toHaveTextContent(
        '{"x":10,"y":20,"zoom":2}'
      );
    });

    it('falls back to identity transform', () => {
      const Probe: React.FC = () => {
        const { transform } = useViewportContext();
        return <span data-testid="probe">{JSON.stringify(transform)}</span>;
      };
      renderWithTheme(
        <Viewport testId="viewport">
          <ViewportOverlay>
            <Probe />
          </ViewportOverlay>
        </Viewport>
      );
      expect(screen.getByTestId('probe')).toHaveTextContent(
        '{"x":0,"y":0,"zoom":1}'
      );
    });

    it('clamps zoom to [minZoom, maxZoom]', () => {
      const Probe: React.FC = () => {
        const { transform } = useViewportContext();
        return <span data-testid="probe">{transform.zoom.toString()}</span>;
      };
      renderWithTheme(
        <Viewport
          testId="viewport"
          minZoom={0.5}
          maxZoom={2}
          defaultTransform={{ x: 0, y: 0, zoom: 999 }}
        >
          <ViewportOverlay>
            <Probe />
          </ViewportOverlay>
        </Viewport>
      );
      expect(screen.getByTestId('probe')).toHaveTextContent('2');
    });

    it('respects controlled transform prop', () => {
      const Probe: React.FC = () => {
        const { transform } = useViewportContext();
        return <span data-testid="probe">{JSON.stringify(transform)}</span>;
      };
      renderWithTheme(
        <Viewport testId="viewport" transform={{ x: 5, y: 7, zoom: 1.5 }}>
          <ViewportOverlay>
            <Probe />
          </ViewportOverlay>
        </Viewport>
      );
      expect(screen.getByTestId('probe')).toHaveTextContent(
        '{"x":5,"y":7,"zoom":1.5}'
      );
    });
  });

  // ═══════════════════════════════════════
  // Gestures
  // ═══════════════════════════════════════

  describe('Gestures', () => {
    it('pans with middle mouse button drag', () => {
      const onTransformChange = vi.fn();
      renderWithTheme(
        <Viewport
          testId="viewport"
          defaultTransform={{ x: 0, y: 0, zoom: 1 }}
          onTransformChange={onTransformChange}
        />
      );
      const root = getRoot();
      fireEvent.pointerDown(root, {
        button: 1,
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });
      fireEvent.pointerMove(root, {
        button: 1,
        pointerId: 1,
        clientX: 150,
        clientY: 130,
      });
      fireEvent.pointerUp(root, {
        button: 1,
        pointerId: 1,
        clientX: 150,
        clientY: 130,
      });
      // delta = (50, 30); transform.x/y should reflect that
      expect(onTransformChange).toHaveBeenCalledWith(
        expect.objectContaining({ x: 50, y: 30, zoom: 1 })
      );
    });

    it('does not pan with left button when only middle is configured', () => {
      const onTransformChange = vi.fn();
      renderWithTheme(
        <Viewport
          testId="viewport"
          defaultTransform={{ x: 0, y: 0, zoom: 1 }}
          onTransformChange={onTransformChange}
        />
      );
      const root = getRoot();
      fireEvent.pointerDown(root, {
        button: 0,
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });
      fireEvent.pointerMove(root, {
        button: 0,
        pointerId: 1,
        clientX: 200,
        clientY: 200,
      });
      fireEvent.pointerUp(root, {
        button: 0,
        pointerId: 1,
        clientX: 200,
        clientY: 200,
      });
      expect(onTransformChange).not.toHaveBeenCalled();
    });

    it('zooms toward cursor on wheel', () => {
      const onTransformChange = vi.fn();
      renderWithTheme(
        <Viewport
          testId="viewport"
          defaultTransform={{ x: 0, y: 0, zoom: 1 }}
          onTransformChange={onTransformChange}
        />
      );
      // Wheel up at world point (100, 100). After zoom in, that point must
      // still appear under the cursor.
      fireEvent.wheel(getRoot(), {
        deltaY: -100,
        clientX: 100,
        clientY: 100,
      });
      expect(onTransformChange).toHaveBeenCalled();
      const next = onTransformChange.mock.calls[0]?.[0] as ViewportTransform;
      expect(next.zoom).toBeGreaterThan(1);
      const screenAfter = {
        x: 100 * next.zoom + next.x,
        y: 100 * next.zoom + next.y,
      };
      expect(screenAfter.x).toBeCloseTo(100, 3);
      expect(screenAfter.y).toBeCloseTo(100, 3);
    });

    it('prevents default on wheel events (no page scroll)', () => {
      renderWithTheme(<Viewport testId="viewport" />);
      const root = getRoot();
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -50,
        clientX: 20,
        clientY: 20,
        bubbles: true,
        cancelable: true,
      });
      let defaultPrevented = false;
      act(() => {
        defaultPrevented = !root.dispatchEvent(wheelEvent);
      });
      expect(defaultPrevented).toBe(true);
    });

    it('does not handle wheel when zoom={false}', () => {
      const onTransformChange = vi.fn();
      renderWithTheme(
        <Viewport
          testId="viewport"
          zoom={false}
          onTransformChange={onTransformChange}
        />
      );
      const root = getRoot();
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -50,
        clientX: 20,
        clientY: 20,
        bubbles: true,
        cancelable: true,
      });
      const defaultPrevented = !root.dispatchEvent(wheelEvent);
      expect(defaultPrevented).toBe(false);
      expect(onTransformChange).not.toHaveBeenCalled();
    });

    it('intercepts Space and prevents page scroll when viewport is focused', () => {
      renderWithTheme(<Viewport testId="viewport" />);
      const root = getRoot();
      root.focus();
      expect(document.activeElement).toBe(root);

      const event = new KeyboardEvent('keydown', {
        code: 'Space',
        bubbles: true,
        cancelable: true,
      });
      const defaultPrevented = !window.dispatchEvent(event);
      expect(defaultPrevented).toBe(true);
    });

    it('ignores Space when focus is outside the viewport', () => {
      renderWithTheme(
        <>
          <Viewport testId="viewport" />
          <button data-testid="outside">outside</button>
        </>
      );
      const outside = screen.getByTestId('outside');
      outside.focus();

      const event = new KeyboardEvent('keydown', {
        code: 'Space',
        bubbles: true,
        cancelable: true,
      });
      const defaultPrevented = !window.dispatchEvent(event);
      expect(defaultPrevented).toBe(false);
    });

    it('fires pan lifecycle callbacks with end velocity', () => {
      const onPanStart = vi.fn();
      const onPanEnd = vi.fn();
      renderWithTheme(
        <Viewport
          testId="viewport"
          onPanStart={onPanStart}
          onPanEnd={onPanEnd}
        />
      );
      const root = getRoot();
      fireEvent.pointerDown(root, {
        button: 1,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
      });
      expect(onPanStart).toHaveBeenCalledOnce();
      fireEvent.pointerMove(root, {
        button: 1,
        pointerId: 1,
        clientX: 20,
        clientY: 0,
      });
      fireEvent.pointerMove(root, {
        button: 1,
        pointerId: 1,
        clientX: 60,
        clientY: 0,
      });
      fireEvent.pointerUp(root, {
        button: 1,
        pointerId: 1,
        clientX: 60,
        clientY: 0,
      });
      expect(onPanEnd).toHaveBeenCalledOnce();
      const info = onPanEnd.mock.calls[0]?.[0] as {
        velocity: { x: number; y: number };
      };
      expect(info.velocity.x).toBeGreaterThanOrEqual(0);
      expect(info.velocity.y).toBe(0);
    });

    it('emits selection events when marquee is enabled', () => {
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <Viewport
          testId="viewport"
          defaultTransform={{ x: 0, y: 0, zoom: 1 }}
          selectionRect={{ enabled: true, button: 'left' }}
          onSelectionChange={onSelectionChange}
        />
      );
      const root = getRoot();
      fireEvent.pointerDown(root, {
        button: 0,
        pointerId: 1,
        clientX: 50,
        clientY: 50,
      });
      fireEvent.pointerMove(root, {
        button: 0,
        pointerId: 1,
        clientX: 100,
        clientY: 80,
      });
      fireEvent.pointerUp(root, {
        button: 0,
        pointerId: 1,
        clientX: 100,
        clientY: 80,
      });
      // start (inProgress true), move (inProgress true), up (inProgress false)
      const calls = onSelectionChange.mock.calls.map(
        c => c[0] as ViewportSelectionEvent
      );
      expect(calls.length).toBeGreaterThanOrEqual(2);
      const last = calls[calls.length - 1];
      expect(last?.inProgress).toBe(false);
      expect(last?.rect).toEqual({ x: 50, y: 50, width: 50, height: 30 });
    });

    it('flags additive selection when shift is held', () => {
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <Viewport
          testId="viewport"
          selectionRect={{ enabled: true, button: 'left' }}
          onSelectionChange={onSelectionChange}
        />
      );
      const root = getRoot();
      fireEvent.pointerDown(root, {
        button: 0,
        pointerId: 1,
        clientX: 10,
        clientY: 10,
        shiftKey: true,
      });
      fireEvent.pointerUp(root, {
        button: 0,
        pointerId: 1,
        clientX: 30,
        clientY: 30,
        shiftKey: true,
      });
      const last = onSelectionChange.mock.calls[
        onSelectionChange.mock.calls.length - 1
      ]?.[0] as ViewportSelectionEvent;
      expect(last.additive).toBe(true);
    });

    it('ignores gestures when disabled', () => {
      const onTransformChange = vi.fn();
      renderWithTheme(
        <Viewport
          testId="viewport"
          disabled
          onTransformChange={onTransformChange}
        />
      );
      fireEvent.pointerDown(getRoot(), {
        button: 1,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
      });
      fireEvent.pointerMove(getRoot(), {
        button: 1,
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });
      fireEvent.pointerUp(getRoot(), {
        button: 1,
        pointerId: 1,
        clientX: 100,
        clientY: 100,
      });
      expect(onTransformChange).not.toHaveBeenCalled();
    });

    it('respects pan=false (disables all pan gestures)', () => {
      const onTransformChange = vi.fn();
      renderWithTheme(
        <Viewport
          testId="viewport"
          pan={false}
          onTransformChange={onTransformChange}
        />
      );
      fireEvent.pointerDown(getRoot(), {
        button: 1,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
      });
      fireEvent.pointerMove(getRoot(), {
        button: 1,
        pointerId: 1,
        clientX: 50,
        clientY: 50,
      });
      fireEvent.pointerUp(getRoot(), {
        button: 1,
        pointerId: 1,
        clientX: 50,
        clientY: 50,
      });
      expect(onTransformChange).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════
  // Imperative handle
  // ═══════════════════════════════════════

  describe('Imperative handle', () => {
    function Capturer({
      onHandle,
    }: {
      onHandle: (h: ViewportHandle) => void;
    }): React.ReactElement {
      const ref = useRef<ViewportHandle>(null);
      useEffect(() => {
        if (ref.current) onHandle(ref.current);
      }, [onHandle]);
      return <Viewport testId="viewport" ref={ref} />;
    }

    it('exposes getTransform and getSize', () => {
      let h: ViewportHandle | null = null;
      renderWithTheme(<Capturer onHandle={handle => (h = handle)} />);
      expect(h).not.toBeNull();
      const handle = h as ViewportHandle | null;
      expect(handle?.getTransform()).toEqual({ x: 0, y: 0, zoom: 1 });
      expect(handle?.getSize()).toEqual({ width: 400, height: 300 });
    });

    it('fitToContent computes a fit transform', () => {
      const onTransformChange = vi.fn();
      const Inner = (): React.ReactElement => {
        const ref = useRef<ViewportHandle>(null);
        return (
          <>
            <button
              data-testid="fit-btn"
              onClick={() =>
                ref.current?.fitToContent(
                  { x: 0, y: 0, width: 200, height: 200 },
                  0
                )
              }
            />
            <Viewport
              testId="viewport"
              ref={ref}
              onTransformChange={onTransformChange}
            />
          </>
        );
      };
      renderWithTheme(<Inner />);
      fireEvent.click(screen.getByTestId('fit-btn'));
      expect(onTransformChange).toHaveBeenCalled();
      const t = onTransformChange.mock.calls[
        onTransformChange.mock.calls.length - 1
      ]?.[0] as ViewportTransform;
      // viewport 400x300, bounds 200x200 -> limiting axis Y => zoom 300/200 = 1.5
      expect(t.zoom).toBeCloseTo(1.5);
    });

    it('centerOn centers a world point in the viewport', () => {
      const onTransformChange = vi.fn();
      const Inner = (): React.ReactElement => {
        const ref = useRef<ViewportHandle>(null);
        return (
          <>
            <button
              data-testid="center-btn"
              onClick={() => ref.current?.centerOn({ x: 100, y: 50 }, 1)}
            />
            <Viewport
              testId="viewport"
              ref={ref}
              onTransformChange={onTransformChange}
            />
          </>
        );
      };
      renderWithTheme(<Inner />);
      fireEvent.click(screen.getByTestId('center-btn'));
      const t = onTransformChange.mock.calls[
        onTransformChange.mock.calls.length - 1
      ]?.[0] as ViewportTransform;
      // viewport 400x300, center = (200, 150); target world (100, 50) at zoom 1
      expect(t.x).toBe(200 - 100);
      expect(t.y).toBe(150 - 50);
      expect(t.zoom).toBe(1);
    });

    it('invalidate triggers layer redraw', () => {
      const drawFn = vi.fn();
      let invalidate: (() => void) | null = null;
      const Inner = (): React.ReactElement => {
        const ref = useRef<ViewportHandle>(null);
        useEffect(() => {
          const current = ref.current;
          if (current) invalidate = () => current.invalidate('bg');
        }, []);
        return (
          <Viewport testId="viewport" ref={ref}>
            <ViewportLayer name="bg" draw={drawFn} />
          </Viewport>
        );
      };
      renderWithTheme(<Inner />);
      const initial = drawFn.mock.calls.length;
      expect(initial).toBeGreaterThanOrEqual(1);
      act(() => {
        invalidate?.();
      });
      expect(drawFn.mock.calls.length).toBeGreaterThan(initial);
    });
  });

  // ═══════════════════════════════════════
  // Context hook
  // ═══════════════════════════════════════

  describe('useViewportContext', () => {
    it('throws when used outside Viewport', () => {
      const Probe: React.FC = () => {
        useViewportContext();
        return null;
      };
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Probe />)).toThrow(
        /must be used inside a <Viewport>/
      );
      spy.mockRestore();
    });

    it('exposes transform, size, isPanning, and handle', () => {
      const Probe: React.FC = () => {
        const ctx = useViewportContext();
        return (
          <span data-testid="probe">
            {ctx.size.width}|{ctx.size.height}|{ctx.isPanning ? 'pan' : 'idle'}|
            {typeof ctx.handle.fitToContent}
          </span>
        );
      };
      renderWithTheme(
        <Viewport testId="viewport">
          <ViewportOverlay>
            <Probe />
          </ViewportOverlay>
        </Viewport>
      );
      expect(screen.getByTestId('probe')).toHaveTextContent(
        '400|300|idle|function'
      );
    });
  });
});
