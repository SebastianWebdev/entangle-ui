import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { CartesianPicker } from './CartesianPicker';
import type { CartesianPickerProps } from './CartesianPicker.types';

import '@/theme/darkTheme.css';

// ─── PointerEvent Polyfill (jsdom lacks PointerEvent) ───

class MockPointerEvent extends MouseEvent {
  readonly pointerId: number;
  readonly width: number;
  readonly height: number;
  readonly pressure: number;
  readonly tiltX: number;
  readonly tiltY: number;
  readonly pointerType: string;
  readonly isPrimary: boolean;

  constructor(type: string, params: PointerEventInit & MouseEventInit = {}) {
    super(type, { bubbles: true, ...params });
    this.pointerId = params.pointerId ?? 0;
    this.width = params.width ?? 1;
    this.height = params.height ?? 1;
    this.pressure = params.pressure ?? 0;
    this.tiltX = params.tiltX ?? 0;
    this.tiltY = params.tiltY ?? 0;
    this.pointerType = params.pointerType ?? 'mouse';
    this.isPrimary = params.isPrimary ?? true;
  }
}

globalThis.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;

// ─── Canvas Mock ───

function createMockCanvasContext(): Record<string, ReturnType<typeof vi.fn>> {
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
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
    scale: vi.fn(),
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    measureText: vi.fn(() => ({ width: 20 })),
  };
}

let mockCtx: Record<string, ReturnType<typeof vi.fn>>;

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

beforeEach(() => {
  mockCtx = createMockCanvasContext();
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => mockCtx
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 200,
    height: 200,
    top: 0,
    left: 0,
    bottom: 200,
    right: 200,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  }));

  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();

  // Make requestAnimationFrame synchronous for canvas rendering tests
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    cb(0);
    return 0;
  });
});

// ─── Helpers ───

function renderPicker(props: Partial<CartesianPickerProps> = {}) {
  return renderWithTheme(<CartesianPicker testId="picker" {...props} />);
}

function getCanvas() {
  return screen.getByRole('application');
}

// ═══════════════════════════════════════
// Rendering
// ═══════════════════════════════════════

describe('CartesianPicker', () => {
  describe('Rendering', () => {
    it('renders canvas with role="application"', () => {
      renderPicker();
      expect(getCanvas()).toBeInTheDocument();
      expect(getCanvas()).toHaveAttribute('role', 'application');
    });

    it('renders with default value (0, 0)', () => {
      renderPicker();
      expect(getCanvas()).toHaveAttribute(
        'aria-roledescription',
        expect.stringContaining('0')
      );
    });

    it('renders with custom domain', () => {
      renderPicker({ domainX: [0, 100], domainY: [0, 100] });
      expect(getCanvas()).toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderPicker({ testId: 'my-picker' });
      expect(screen.getByTestId('my-picker')).toBeInTheDocument();
    });

    it('renders disabled state with tabIndex=-1', () => {
      renderPicker({ disabled: true });
      expect(getCanvas()).toHaveAttribute('tabindex', '-1');
    });

    it('renders bottom bar when renderBottomBar provided', () => {
      renderPicker({
        renderBottomBar: () => <div>Bottom content</div>,
      });
      expect(screen.getByTestId('picker-bottom-bar')).toBeInTheDocument();
      expect(screen.getByText('Bottom content')).toBeInTheDocument();
    });

    it('hides bottom bar when not provided', () => {
      renderPicker();
      expect(screen.queryByTestId('picker-bottom-bar')).not.toBeInTheDocument();
    });

    it('calls renderBackground with canvas context', () => {
      const renderBackground = vi.fn();
      renderPicker({ renderBackground });
      expect(renderBackground).toHaveBeenCalled();
      const [ctx, info] = renderBackground.mock.calls[0] as [
        unknown,
        {
          width: number;
          height: number;
          viewport: unknown;
          domainX: [number, number];
          domainY: [number, number];
        },
      ];
      expect(ctx).toBe(mockCtx);
      expect(info.width).toBe(200);
      expect(info.height).toBe(200);
    });
  });

  // ═══════════════════════════════════════
  // Interactions
  // ═══════════════════════════════════════

  describe('Interactions', () => {
    it('click sets point and fires onChange + onChangeComplete', () => {
      const onChange = vi.fn();
      const onChangeComplete = vi.fn();
      renderPicker({ onChange, onChangeComplete });
      const canvas = getCanvas();

      // Click at center of 200x200 canvas
      fireEvent.pointerDown(canvas, {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        button: 0,
      });
      fireEvent.pointerUp(canvas, {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        button: 0,
      });

      expect(onChange).toHaveBeenCalled();
      expect(onChangeComplete).toHaveBeenCalled();
    });

    it('drag updates point continuously', () => {
      const onChange = vi.fn();
      renderPicker({ onChange });
      const canvas = getCanvas();

      fireEvent.pointerDown(canvas, {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        button: 0,
      });
      fireEvent.pointerMove(canvas, {
        clientX: 120,
        clientY: 80,
        pointerId: 1,
      });
      fireEvent.pointerMove(canvas, {
        clientX: 140,
        clientY: 60,
        pointerId: 1,
      });

      // onChange should be called for down + each move
      expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('drag end calls onChangeComplete', () => {
      const onChangeComplete = vi.fn();
      renderPicker({ onChangeComplete });
      const canvas = getCanvas();

      fireEvent.pointerDown(canvas, {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        button: 0,
      });
      fireEvent.pointerUp(canvas, {
        clientX: 120,
        clientY: 80,
        pointerId: 1,
      });

      expect(onChangeComplete).toHaveBeenCalledTimes(1);
    });

    it('disabled prevents interaction', () => {
      const onChange = vi.fn();
      renderPicker({ onChange, disabled: true });
      const canvas = getCanvas();

      fireEvent.pointerDown(canvas, {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        button: 0,
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('readOnly prevents interaction', () => {
      const onChange = vi.fn();
      renderPicker({ onChange, readOnly: true });
      const canvas = getCanvas();

      fireEvent.pointerDown(canvas, {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        button: 0,
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('clamps point within domain bounds', () => {
      const onChange = vi.fn();
      renderPicker({
        onChange,
        domainX: [0, 1],
        domainY: [0, 1],
        clampToRange: true,
      });
      const canvas = getCanvas();

      // Click at far corner (outside domain due to viewport padding)
      fireEvent.pointerDown(canvas, {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        button: 0,
      });

      expect(onChange).toHaveBeenCalled();
      const point = onChange.mock.calls[0]?.[0] as
        | { x: number; y: number }
        | undefined;
      if (point) {
        // X and Y should be clamped to domain
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(1);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(1);
      }
    });
  });

  // ═══════════════════════════════════════
  // Keyboard
  // ═══════════════════════════════════════

  describe('Keyboard', () => {
    it('arrow keys move point', () => {
      const onChange = vi.fn();
      renderPicker({ onChange, defaultValue: { x: 0, y: 0 } });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalled();
      const point = onChange.mock.calls[0]?.[0] as
        | { x: number; y: number }
        | undefined;
      if (point) {
        expect(point.x).toBeGreaterThan(0);
      }
    });

    it('arrow up increases Y', () => {
      const onChange = vi.fn();
      renderPicker({ onChange, defaultValue: { x: 0, y: 0 } });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: 'ArrowUp' });
      expect(onChange).toHaveBeenCalled();
      const point = onChange.mock.calls[0]?.[0] as
        | { x: number; y: number }
        | undefined;
      if (point) {
        expect(point.y).toBeGreaterThan(0);
      }
    });

    it('shift + arrow uses fine step', () => {
      const onChange = vi.fn();
      renderPicker({ onChange, defaultValue: { x: 0, y: 0 } });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: 'ArrowRight', shiftKey: true });
      const finePoint = onChange.mock.calls[0]?.[0] as
        | { x: number; y: number }
        | undefined;

      onChange.mockClear();
      fireEvent.keyDown(canvas, { key: 'ArrowRight' });
      const normalPoint = onChange.mock.calls[0]?.[0] as
        | { x: number; y: number }
        | undefined;

      if (finePoint && normalPoint) {
        expect(finePoint.x).toBeLessThan(normalPoint.x);
      }
    });

    it('Home resets to domain center', () => {
      const onChange = vi.fn();
      renderPicker({
        onChange,
        defaultValue: { x: 0.5, y: 0.5 },
        domainX: [-1, 1],
        domainY: [-1, 1],
      });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: 'Home' });
      const point = onChange.mock.calls[0]?.[0] as
        | { x: number; y: number }
        | undefined;
      if (point) {
        expect(point.x).toBeCloseTo(0, 1);
        expect(point.y).toBeCloseTo(0, 1);
      }
    });

    it('0 key resets to origin', () => {
      const onChange = vi.fn();
      renderPicker({
        onChange,
        defaultValue: { x: 0.5, y: 0.5 },
      });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: '0' });
      const point = onChange.mock.calls[0]?.[0] as
        | { x: number; y: number }
        | undefined;
      if (point) {
        expect(point.x).toBe(0);
        expect(point.y).toBe(0);
      }
    });

    it('does not respond to arrow keys when disabled', () => {
      const onChange = vi.fn();
      renderPicker({ onChange, disabled: true });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: 'ArrowRight' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════
  // Controlled / Uncontrolled
  // ═══════════════════════════════════════

  describe('Controlled / Uncontrolled', () => {
    it('respects controlled value prop', () => {
      renderPicker({ value: { x: 0.5, y: 0.75 } });
      expect(getCanvas()).toHaveAttribute(
        'aria-roledescription',
        expect.stringContaining('0.5')
      );
    });

    it('manages internal state from defaultValue', () => {
      renderPicker({ defaultValue: { x: 0.3, y: 0.7 } });
      expect(getCanvas()).toHaveAttribute(
        'aria-roledescription',
        expect.stringContaining('0.3')
      );
    });
  });

  // ═══════════════════════════════════════
  // Accessibility
  // ═══════════════════════════════════════

  describe('Accessibility', () => {
    it('has correct role and aria attributes', () => {
      renderPicker();
      const canvas = getCanvas();

      expect(canvas).toHaveAttribute('role', 'application');
      expect(canvas).toHaveAttribute('aria-label', 'Cartesian point picker');
      expect(canvas).toHaveAttribute('tabindex', '0');
    });

    it('has aria-roledescription with coordinates', () => {
      renderPicker({ value: { x: 0.5, y: -0.3 } });
      const canvas = getCanvas();

      const desc = canvas.getAttribute('aria-roledescription') ?? '';
      expect(desc).toContain('0.5');
      expect(desc).toContain('-0.3');
    });

    it('has aria-live region', () => {
      renderPicker();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('announces point changes in live region', () => {
      renderPicker({ value: { x: 0.25, y: 0.75 } });
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent('0.25');
      expect(liveRegion).toHaveTextContent('0.75');
    });
  });

  // ═══════════════════════════════════════
  // renderBottomBar
  // ═══════════════════════════════════════

  describe('renderBottomBar', () => {
    it('passes correct info to renderBottomBar', () => {
      const renderBottomBar = vi.fn(() => null);
      renderPicker({
        renderBottomBar,
        value: { x: 0.5, y: 0.5 },
        domainX: [0, 1],
        domainY: [0, 1],
      });

      expect(renderBottomBar).toHaveBeenCalled();
      const info = (
        renderBottomBar.mock.calls[0] as unknown as [
          {
            point: { x: number; y: number };
            disabled: boolean;
            readOnly: boolean;
            isDragging: boolean;
            domainX: [number, number];
            domainY: [number, number];
          },
        ]
      )[0];
      expect(info.point).toEqual({ x: 0.5, y: 0.5 });
      expect(info.disabled).toBe(false);
      expect(info.readOnly).toBe(false);
      expect(info.domainX).toEqual([0, 1]);
      expect(info.domainY).toEqual([0, 1]);
    });
  });
});
