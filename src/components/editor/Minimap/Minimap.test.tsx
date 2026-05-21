import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Minimap } from './Minimap';
import type { MinimapItem, MinimapProps } from './Minimap.types';
import type {
  ViewportTransform,
  ViewportSize,
  WorldRect,
} from '@/components/primitives/viewport';

import '@/theme/darkTheme.css';

// ─── PointerEvent polyfill (jsdom lacks PointerEvent) ───

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

// ─── Canvas mock ───

type MockCtx = Record<string, ReturnType<typeof vi.fn>>;

function createMockCanvasContext(): MockCtx {
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  };
}

let mockCtx: MockCtx;

beforeEach(() => {
  mockCtx = createMockCanvasContext();
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => mockCtx
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    cb(0);
    return 0;
  });
});

// ─── Helpers ───

const defaultBounds: WorldRect = { x: 0, y: 0, width: 1000, height: 500 };
const defaultTransform: ViewportTransform = { x: 0, y: 0, zoom: 1 };
const defaultViewportSize: ViewportSize = { width: 800, height: 400 };

function renderMinimap(props: Partial<MinimapProps> = {}) {
  return renderWithTheme(
    <Minimap
      items={[]}
      worldBounds={defaultBounds}
      transform={defaultTransform}
      viewportSize={defaultViewportSize}
      testId="minimap"
      {...props}
    />
  );
}

function getRoot() {
  return screen.getByTestId('minimap');
}

/**
 * Mock the wrapper's getBoundingClientRect so we know the local-coord origin
 * is (0, 0) and the size matches the rendered minimap.
 */
function stubBoundingRect(width: number, height: number) {
  HTMLDivElement.prototype.getBoundingClientRect = vi.fn(
    () =>
      ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: width,
        bottom: height,
        width,
        height,
        toJSON: () => ({}),
      }) as DOMRect
  );
}

function pointerEvent(
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  x: number,
  y: number,
  button = 0
) {
  return new MockPointerEvent(type, {
    clientX: x,
    clientY: y,
    button,
    pointerId: 1,
    bubbles: true,
  }) as unknown as PointerEvent;
}

// ─── Tests ───

describe('Minimap', () => {
  describe('Rendering', () => {
    it('renders with role="region" and accessible label', () => {
      renderMinimap();
      const root = getRoot();
      expect(root).toBeInTheDocument();
      expect(root).toHaveAttribute('role', 'region');
      expect(root).toHaveAttribute('aria-label', 'Minimap');
    });

    it('uses width prop and derives height from worldBounds aspect', () => {
      renderMinimap({ width: 200 });
      const root = getRoot();
      // 200 × (500/1000) = 100, within [60, 200]
      expect(root.style.width).toBe('200px');
      expect(root.style.height).toBe('100px');
    });

    it('clamps height to minHeight when content is very wide', () => {
      renderMinimap({
        width: 200,
        worldBounds: { x: 0, y: 0, width: 10000, height: 100 },
      });
      const root = getRoot();
      expect(root.style.height).toBe('60px');
    });

    it('clamps height to maxHeight when content is very tall', () => {
      renderMinimap({
        width: 200,
        worldBounds: { x: 0, y: 0, width: 100, height: 10000 },
      });
      const root = getRoot();
      expect(root.style.height).toBe('200px');
    });

    it('applies custom className and style', () => {
      renderMinimap({ className: 'my-mini', style: { opacity: 0.9 } });
      const root = getRoot();
      expect(root.className).toContain('my-mini');
      expect(root.style.opacity).toBe('0.9');
    });

    it('is tab-focusable by default', () => {
      renderMinimap();
      expect(getRoot()).toHaveAttribute('tabindex', '0');
    });

    it('disabled sets tabindex=-1 and data-disabled', () => {
      renderMinimap({ disabled: true });
      const root = getRoot();
      expect(root).toHaveAttribute('tabindex', '-1');
      expect(root).toHaveAttribute('data-disabled');
    });
  });

  describe('Drawing', () => {
    it('draws background, items, and viewport rect outline on first render', () => {
      const items: MinimapItem[] = [
        { id: 'a', type: 'rect', x: 10, y: 10, width: 50, height: 50 },
      ];
      renderMinimap({ items });

      expect(mockCtx['clearRect']).toHaveBeenCalled();
      expect(mockCtx['fillRect']).toHaveBeenCalled();
      expect(mockCtx['strokeRect']).toHaveBeenCalled();
    });

    it('draws a circle item via arc()', () => {
      const items: MinimapItem[] = [
        { id: 'c', type: 'circle', cx: 100, cy: 100, r: 20 },
      ];
      renderMinimap({ items });
      expect(mockCtx['arc']).toHaveBeenCalled();
    });

    it('draws a line item via moveTo + lineTo + stroke', () => {
      const items: MinimapItem[] = [
        { id: 'l', type: 'line', x1: 0, y1: 0, x2: 100, y2: 100 },
      ];
      renderMinimap({ items });
      expect(mockCtx['moveTo']).toHaveBeenCalled();
      expect(mockCtx['lineTo']).toHaveBeenCalled();
      expect(mockCtx['stroke']).toHaveBeenCalled();
    });
  });

  describe('Interactions — click', () => {
    beforeEach(() => stubBoundingRect(200, 100));

    it('fires onNavigate with phase="click" on tap outside viewport rect', () => {
      const onNavigate = vi.fn();
      renderMinimap({ onNavigate });
      const root = getRoot();

      // Viewport rect at zoom=1, transform=0 covers world 0..800 × 0..400
      // = minimap 0..160 × 0..80. Click outside that, e.g. (180, 90).
      fireEvent(root, pointerEvent('pointerdown', 180, 90));
      fireEvent(root, pointerEvent('pointerup', 180, 90));

      expect(onNavigate).toHaveBeenCalledTimes(1);
      const arg = onNavigate.mock.calls[0]?.[0] as {
        phase: string;
        worldPoint: { x: number; y: number };
      };
      expect(arg.phase).toBe('click');
      // (180, 90) on a 200×100 minimap → world (900, 450) for 1000×500 bounds
      expect(arg.worldPoint.x).toBeCloseTo(900);
      expect(arg.worldPoint.y).toBeCloseTo(450);
    });

    it('does not fire click when both click and dragFromEmpty are disabled', () => {
      const onNavigate = vi.fn();
      renderMinimap({
        onNavigate,
        interactions: { click: false, dragFromEmpty: false },
      });
      const root = getRoot();

      fireEvent(root, pointerEvent('pointerdown', 180, 90));
      fireEvent(root, pointerEvent('pointerup', 180, 90));

      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('with click=false but dragFromEmpty=true, a stationary press still pans-and-releases', () => {
      const onNavigate = vi.fn();
      renderMinimap({
        onNavigate,
        interactions: { click: false, dragFromEmpty: true },
      });
      const root = getRoot();

      fireEvent(root, pointerEvent('pointerdown', 180, 90));
      fireEvent(root, pointerEvent('pointerup', 180, 90));

      const phases = onNavigate.mock.calls.map(
        c => (c[0] as { phase: string }).phase
      );
      expect(phases).toEqual(['drag-start', 'drag-end']);
    });
  });

  describe('Interactions — drag from empty', () => {
    beforeEach(() => stubBoundingRect(200, 100));

    it('emits drag-start / drag / drag-end sequence with world points', () => {
      const onNavigate = vi.fn();
      renderMinimap({ onNavigate });
      const root = getRoot();

      // First move crosses the click threshold (→ drag-start).
      // Second move stays in drag mode (→ drag).
      fireEvent(root, pointerEvent('pointerdown', 190, 95));
      fireEvent(root, pointerEvent('pointermove', 195, 99));
      fireEvent(root, pointerEvent('pointermove', 180, 90));
      fireEvent(root, pointerEvent('pointerup', 170, 80));

      const phases = onNavigate.mock.calls.map(
        c => (c[0] as { phase: string }).phase
      );
      expect(phases[0]).toBe('drag-start');
      expect(phases[phases.length - 1]).toBe('drag-end');
      expect(phases).toContain('drag');
    });

    it('respects interactions.dragFromEmpty=false (falls back to click)', () => {
      const onNavigate = vi.fn();
      renderMinimap({ onNavigate, interactions: { dragFromEmpty: false } });
      const root = getRoot();

      fireEvent(root, pointerEvent('pointerdown', 190, 95));
      fireEvent(root, pointerEvent('pointerup', 190, 95));

      const phases = onNavigate.mock.calls.map(
        c => (c[0] as { phase: string }).phase
      );
      expect(phases).toEqual(['click']);
    });
  });

  describe('Interactions — drag viewport rect', () => {
    beforeEach(() => stubBoundingRect(200, 100));

    it('starts a drag-rect gesture when pointerdown lands inside the viewport rect', () => {
      const onNavigate = vi.fn();
      // Viewport rect occupies (0,0)..(160,80) on a 200×100 minimap
      // for the default props. Pointer at (80, 40) lands inside.
      renderMinimap({ onNavigate });
      const root = getRoot();

      fireEvent(root, pointerEvent('pointerdown', 80, 40));
      fireEvent(root, pointerEvent('pointermove', 100, 40));
      fireEvent(root, pointerEvent('pointerup', 100, 40));

      const calls = onNavigate.mock.calls;
      const first = calls[0]?.[0] as {
        phase: string;
        worldPoint: { x: number; y: number };
      };
      const last = calls[calls.length - 1]?.[0] as {
        phase: string;
        worldPoint: { x: number; y: number };
      };
      expect(first.phase).toBe('drag-start');
      expect(last.phase).toBe('drag-end');
      // Drag of 20 minimap px right at scale 0.2 = 100 world units of movement.
      const lastPoint = last.worldPoint;
      const firstPoint = first.worldPoint;
      expect(lastPoint.x - firstPoint.x).toBeCloseTo(100);
    });

    it('respects interactions.dragViewportRect=false (no callback inside rect)', () => {
      const onNavigate = vi.fn();
      renderMinimap({
        onNavigate,
        interactions: { dragViewportRect: false, click: false },
      });
      const root = getRoot();

      fireEvent(root, pointerEvent('pointerdown', 80, 40));
      fireEvent(root, pointerEvent('pointerup', 80, 40));

      expect(onNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Interactions — disabled / suppressed', () => {
    beforeEach(() => stubBoundingRect(200, 100));

    it('fires nothing when interactions={false}', () => {
      const onNavigate = vi.fn();
      renderMinimap({ onNavigate, interactions: false });
      const root = getRoot();

      fireEvent(root, pointerEvent('pointerdown', 180, 90));
      fireEvent(root, pointerEvent('pointerup', 180, 90));

      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('fires nothing when disabled', () => {
      const onNavigate = vi.fn();
      renderMinimap({ onNavigate, disabled: true });
      const root = getRoot();

      fireEvent(root, pointerEvent('pointerdown', 180, 90));
      fireEvent(root, pointerEvent('pointerup', 180, 90));

      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('ignores non-primary buttons (e.g. right-click)', () => {
      const onNavigate = vi.fn();
      renderMinimap({ onNavigate });
      const root = getRoot();

      fireEvent(root, pointerEvent('pointerdown', 180, 90, 2));
      fireEvent(root, pointerEvent('pointerup', 180, 90, 2));

      expect(onNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard navigation', () => {
    it('arrow keys pan via onNavigate with phase="click"', () => {
      const onNavigate = vi.fn();
      // Place viewport center at world (400, 200) by transforming accordingly.
      renderMinimap({
        onNavigate,
        transform: { x: 0, y: 0, zoom: 1 },
        viewportSize: { width: 800, height: 400 },
      });
      const root = getRoot();
      root.focus();

      fireEvent.keyDown(root, { key: 'ArrowRight' });

      expect(onNavigate).toHaveBeenCalledTimes(1);
      const info = onNavigate.mock.calls[0]?.[0] as {
        phase: string;
        worldPoint: { x: number; y: number };
      };
      expect(info.phase).toBe('click');
      // Default keyboardPanStep=0.1 × worldViewW=800 = 80 to the right.
      expect(info.worldPoint.x).toBeCloseTo(400 + 80);
      expect(info.worldPoint.y).toBeCloseTo(200);
    });

    it('shift + arrow uses a 5× larger step', () => {
      const onNavigate = vi.fn();
      renderMinimap({
        onNavigate,
        transform: { x: 0, y: 0, zoom: 1 },
        viewportSize: { width: 800, height: 400 },
      });
      const root = getRoot();
      fireEvent.keyDown(root, { key: 'ArrowDown', shiftKey: true });

      const info = onNavigate.mock.calls[0]?.[0] as {
        worldPoint: { x: number; y: number };
      };
      // 0.1 × 400 × 5 = 200 downward
      expect(info.worldPoint.y).toBeCloseTo(200 + 200);
    });

    it('ignores non-arrow keys', () => {
      const onNavigate = vi.fn();
      renderMinimap({ onNavigate });
      fireEvent.keyDown(getRoot(), { key: 'Enter' });
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('does not fire when disabled', () => {
      const onNavigate = vi.fn();
      renderMinimap({ onNavigate, disabled: true });
      fireEvent.keyDown(getRoot(), { key: 'ArrowRight' });
      expect(onNavigate).not.toHaveBeenCalled();
    });
  });
});
