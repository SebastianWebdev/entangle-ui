import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { ViewportGizmo } from './ViewportGizmo';
import type { ViewportGizmoProps, GizmoOrientation } from './ViewportGizmo.types';

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

globalThis.PointerEvent =
  MockPointerEvent as unknown as typeof PointerEvent;

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
    width: 120,
    height: 120,
    top: 0,
    left: 0,
    bottom: 120,
    right: 120,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  }));

  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
});

// ─── Helpers ───

const defaultOrientation: GizmoOrientation = { yaw: 0, pitch: 0 };

function renderGizmo(props: Partial<ViewportGizmoProps> = {}) {
  return renderWithTheme(
    <ViewportGizmo
      orientation={defaultOrientation}
      testId="gizmo"
      {...props}
    />
  );
}

function getCanvas() {
  return screen.getByRole('application');
}

// ═══════════════════════════════════════
// Rendering
// ═══════════════════════════════════════

describe('ViewportGizmo', () => {
  describe('Rendering', () => {
    it('renders canvas with role="application"', () => {
      renderGizmo();
      expect(getCanvas()).toBeInTheDocument();
      expect(getCanvas()).toHaveAttribute('role', 'application');
    });

    it('renders with orientation (0, 0, 0)', () => {
      renderGizmo({ orientation: { yaw: 0, pitch: 0, roll: 0 } });
      expect(getCanvas()).toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderGizmo({ testId: 'my-gizmo' });
      expect(screen.getByTestId('my-gizmo')).toBeInTheDocument();
    });

    it('disabled state sets tabIndex=-1', () => {
      renderGizmo({ disabled: true });
      expect(getCanvas()).toHaveAttribute('tabindex', '-1');
    });

    it('shows axis labels when showLabels=true', () => {
      renderGizmo({ showLabels: true });
      const fillTextMock = mockCtx['fillText'] as ReturnType<typeof vi.fn>;
      const fillTextCalls = fillTextMock.mock.calls as Array<[string, number, number]>;
      const labels = fillTextCalls.map(c => c[0]);
      expect(labels).toContain('X');
      expect(labels).toContain('Y');
      expect(labels).toContain('Z');
    });

    it('hides axis labels when showLabels=false', () => {
      renderGizmo({ showLabels: false });
      const fillTextMock = mockCtx['fillText'] as ReturnType<typeof vi.fn>;
      const fillTextCalls = fillTextMock.mock.calls as Array<[string, number, number]>;
      const labels = fillTextCalls.map(c => c[0]);
      expect(labels).not.toContain('X');
      expect(labels).not.toContain('Y');
      expect(labels).not.toContain('Z');
    });

    it('background="transparent" does not draw background fill', () => {
      renderGizmo({ background: 'transparent' });
      const fillRectMock = mockCtx['fillRect'] as ReturnType<typeof vi.fn>;
      expect(fillRectMock.mock.calls.length).toBe(0);
    });

    it('background="solid" renders opaque background', () => {
      renderGizmo({ background: 'solid' });
      const fillRectMock = mockCtx['fillRect'] as ReturnType<typeof vi.fn>;
      expect(fillRectMock).toHaveBeenCalled();
    });

    it('draws orbit ring when showOrbitRing=true', () => {
      renderGizmo({ showOrbitRing: true });
      const arcMock = mockCtx['arc'] as ReturnType<typeof vi.fn>;
      expect(arcMock).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════
  // Interactions
  // ═══════════════════════════════════════

  describe('Interactions', () => {
    it('click on axis tip area calls onAxisClick', () => {
      const onAxisClick = vi.fn();
      const onSnapToView = vi.fn();
      // At identity orientation, +X is at (center.x + armLength, center.y)
      // center = 60, armLength = 120/2 * 0.65 = 39
      renderGizmo({ onAxisClick, onSnapToView });
      const canvas = getCanvas();

      // Pointer down then up at +X axis position (~99, 60)
      fireEvent.pointerDown(canvas, { clientX: 99, clientY: 60, pointerId: 1, button: 0 });
      fireEvent.pointerUp(canvas, { clientX: 99, clientY: 60, pointerId: 1, button: 0 });

      expect(onAxisClick).toHaveBeenCalled();
      const [axis, positive] = onAxisClick.mock.calls[0] as ['x' | 'y' | 'z', boolean];
      expect(axis).toBe('x');
      expect(positive).toBe(true);
    });

    it('click on axis tip calls onSnapToView', () => {
      const onSnapToView = vi.fn();
      renderGizmo({ onSnapToView });
      const canvas = getCanvas();

      // Click +X axis area
      fireEvent.pointerDown(canvas, { clientX: 99, clientY: 60, pointerId: 1, button: 0 });
      fireEvent.pointerUp(canvas, { clientX: 99, clientY: 60, pointerId: 1, button: 0 });

      expect(onSnapToView).toHaveBeenCalledWith('right');
    });

    it('drag calls onOrbit with delta', () => {
      const onOrbit = vi.fn();
      renderGizmo({ onOrbit });
      const canvas = getCanvas();

      fireEvent.pointerDown(canvas, { clientX: 60, clientY: 60, pointerId: 1, button: 0 });
      // Move far enough to register as drag (> 3px)
      fireEvent.pointerMove(canvas, { clientX: 80, clientY: 40, pointerId: 1 });

      expect(onOrbit).toHaveBeenCalled();
      const delta = onOrbit.mock.calls[0]?.[0] as { deltaYaw: number; deltaPitch: number } | undefined;
      if (delta) {
        expect(typeof delta.deltaYaw).toBe('number');
        expect(typeof delta.deltaPitch).toBe('number');
      }
    });

    it('drag end calls onOrbitEnd', () => {
      const onOrbitEnd = vi.fn();
      const onOrbit = vi.fn();
      renderGizmo({ onOrbitEnd, onOrbit });
      const canvas = getCanvas();

      fireEvent.pointerDown(canvas, { clientX: 60, clientY: 60, pointerId: 1, button: 0 });
      fireEvent.pointerMove(canvas, { clientX: 80, clientY: 40, pointerId: 1 });
      fireEvent.pointerUp(canvas, { clientX: 80, clientY: 40, pointerId: 1, button: 0 });

      expect(onOrbitEnd).toHaveBeenCalledTimes(1);
    });

    it('display-only prevents all interaction', () => {
      const onOrbit = vi.fn();
      const onSnapToView = vi.fn();
      renderGizmo({ interactionMode: 'display-only', onOrbit, onSnapToView });
      const canvas = getCanvas();

      fireEvent.pointerDown(canvas, { clientX: 99, clientY: 60, pointerId: 1, button: 0 });
      fireEvent.pointerUp(canvas, { clientX: 99, clientY: 60, pointerId: 1, button: 0 });

      expect(onOrbit).not.toHaveBeenCalled();
      expect(onSnapToView).not.toHaveBeenCalled();
    });

    it('snap-only allows click but not drag orbit', () => {
      const onSnapToView = vi.fn();
      const onOrbit = vi.fn();
      renderGizmo({ interactionMode: 'snap-only', onSnapToView, onOrbit });
      const canvas = getCanvas();

      // Click on +X axis
      fireEvent.pointerDown(canvas, { clientX: 99, clientY: 60, pointerId: 1, button: 0 });
      fireEvent.pointerUp(canvas, { clientX: 99, clientY: 60, pointerId: 1, button: 0 });

      expect(onSnapToView).toHaveBeenCalled();

      // Drag should NOT trigger orbit
      onOrbit.mockClear();
      fireEvent.pointerDown(canvas, { clientX: 60, clientY: 60, pointerId: 1, button: 0 });
      fireEvent.pointerMove(canvas, { clientX: 80, clientY: 40, pointerId: 1 });

      expect(onOrbit).not.toHaveBeenCalled();
    });

    it('origin click calls onOriginClick', () => {
      const onOriginClick = vi.fn();
      renderGizmo({ onOriginClick });
      const canvas = getCanvas();

      // Click at center (origin handle)
      fireEvent.pointerDown(canvas, { clientX: 60, clientY: 60, pointerId: 1, button: 0 });
      fireEvent.pointerUp(canvas, { clientX: 60, clientY: 60, pointerId: 1, button: 0 });

      expect(onOriginClick).toHaveBeenCalled();
    });

    it('disabled prevents interaction', () => {
      const onOrbit = vi.fn();
      renderGizmo({ disabled: true, onOrbit });
      const canvas = getCanvas();

      fireEvent.pointerDown(canvas, { clientX: 60, clientY: 60, pointerId: 1, button: 0 });
      expect(onOrbit).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════
  // Keyboard
  // ═══════════════════════════════════════

  describe('Keyboard', () => {
    it('arrow keys call onOrbit with correct delta', () => {
      const onOrbit = vi.fn();
      renderGizmo({ onOrbit });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: 'ArrowRight' });
      expect(onOrbit).toHaveBeenCalledWith({ deltaYaw: 15, deltaPitch: 0 });

      onOrbit.mockClear();
      fireEvent.keyDown(canvas, { key: 'ArrowUp' });
      expect(onOrbit).toHaveBeenCalledWith({ deltaYaw: 0, deltaPitch: 15 });
    });

    it('shift + arrow keys use fine step', () => {
      const onOrbit = vi.fn();
      renderGizmo({ onOrbit });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: 'ArrowRight', shiftKey: true });
      expect(onOrbit).toHaveBeenCalledWith({ deltaYaw: 5, deltaPitch: 0 });
    });

    it('numpad 1 calls onSnapToView("front")', () => {
      const onSnapToView = vi.fn();
      renderGizmo({ onSnapToView });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: '1' });
      expect(onSnapToView).toHaveBeenCalledWith('front');
    });

    it('numpad 7 calls onSnapToView("top")', () => {
      const onSnapToView = vi.fn();
      renderGizmo({ onSnapToView });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: '7' });
      expect(onSnapToView).toHaveBeenCalledWith('top');
    });

    it('Ctrl+1 calls onSnapToView("back")', () => {
      const onSnapToView = vi.fn();
      renderGizmo({ onSnapToView });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: '1', ctrlKey: true });
      expect(onSnapToView).toHaveBeenCalledWith('back');
    });

    it('Home calls onOriginClick', () => {
      const onOriginClick = vi.fn();
      renderGizmo({ onOriginClick });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: 'Home' });
      expect(onOriginClick).toHaveBeenCalled();
    });

    it('does not respond when disabled', () => {
      const onOrbit = vi.fn();
      renderGizmo({ onOrbit, disabled: true });
      const canvas = getCanvas();

      fireEvent.keyDown(canvas, { key: 'ArrowRight' });
      expect(onOrbit).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════
  // Accessibility
  // ═══════════════════════════════════════

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      renderGizmo();
      const canvas = getCanvas();

      expect(canvas).toHaveAttribute('role', 'application');
      expect(canvas).toHaveAttribute('aria-label', 'Viewport orientation gizmo');
      expect(canvas).toHaveAttribute('tabindex', '0');
    });

    it('aria-roledescription contains angles', () => {
      renderGizmo({ orientation: { yaw: 35, pitch: -20 } });
      const canvas = getCanvas();

      const desc = canvas.getAttribute('aria-roledescription') ?? '';
      expect(desc).toContain('35');
      expect(desc).toContain('-20');
    });

    it('has aria-live region', () => {
      renderGizmo();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('live region contains orientation info', () => {
      renderGizmo({ orientation: { yaw: 45, pitch: 10 } });
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent('45');
      expect(liveRegion).toHaveTextContent('10');
    });
  });
});
