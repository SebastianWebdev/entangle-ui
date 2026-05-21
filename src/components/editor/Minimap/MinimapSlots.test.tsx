import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
// Importing from the barrel picks up the compound Minimap with Title/Footer/Corner attached.
import { Minimap } from '.';
import { useMinimapContext } from './MinimapContext';
import type { MinimapItem } from './Minimap.types';

import '@/theme/darkTheme.css';

// ─── PointerEvent polyfill ───

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
  HTMLDivElement.prototype.getBoundingClientRect = vi.fn(
    () =>
      ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 200,
        bottom: 100,
        width: 200,
        height: 100,
        toJSON: () => ({}),
      }) as DOMRect
  );
});

const baseProps = {
  items: [] as MinimapItem[],
  worldBounds: { x: 0, y: 0, width: 1000, height: 500 },
  transform: { x: 0, y: 0, zoom: 1 },
  viewportSize: { width: 800, height: 400 },
};

describe('Minimap slot subcomponents', () => {
  describe('Minimap.Title', () => {
    it('renders title text above the body by default', () => {
      renderWithTheme(
        <Minimap {...baseProps} testId="minimap">
          <Minimap.Title>My Graph</Minimap.Title>
        </Minimap>
      );
      expect(screen.getByText('My Graph')).toBeInTheDocument();
    });

    it('accepts placement="top-inside"', () => {
      renderWithTheme(
        <Minimap {...baseProps} testId="minimap">
          <Minimap.Title placement="top-inside">Inner Title</Minimap.Title>
        </Minimap>
      );
      expect(screen.getByText('Inner Title')).toBeInTheDocument();
    });
  });

  describe('Minimap.Footer', () => {
    it('renders footer text below the body by default', () => {
      renderWithTheme(
        <Minimap {...baseProps} testId="minimap">
          <Minimap.Footer>Hint text</Minimap.Footer>
        </Minimap>
      );
      expect(screen.getByText('Hint text')).toBeInTheDocument();
    });

    it('accepts placement="bottom-inside"', () => {
      renderWithTheme(
        <Minimap {...baseProps} testId="minimap">
          <Minimap.Footer placement="bottom-inside">
            Inside footer
          </Minimap.Footer>
        </Minimap>
      );
      expect(screen.getByText('Inside footer')).toBeInTheDocument();
    });
  });

  describe('Minimap.Corner', () => {
    it('renders content in all four corners', () => {
      renderWithTheme(
        <Minimap {...baseProps} testId="minimap">
          <Minimap.Corner side="top-left">TL</Minimap.Corner>
          <Minimap.Corner side="top-right">TR</Minimap.Corner>
          <Minimap.Corner side="bottom-left">BL</Minimap.Corner>
          <Minimap.Corner side="bottom-right">BR</Minimap.Corner>
        </Minimap>
      );
      expect(screen.getByText('TL')).toBeInTheDocument();
      expect(screen.getByText('TR')).toBeInTheDocument();
      expect(screen.getByText('BL')).toBeInTheDocument();
      expect(screen.getByText('BR')).toBeInTheDocument();
    });

    it('non-slot children render as free-form overlay', () => {
      renderWithTheme(
        <Minimap {...baseProps} testId="minimap">
          <span data-testid="custom-overlay">freeform</span>
        </Minimap>
      );
      expect(screen.getByTestId('custom-overlay')).toBeInTheDocument();
    });
  });
});

describe('useMinimapContext', () => {
  function ContextProbe() {
    const ctx = useMinimapContext();
    return (
      <div data-testid="probe">
        <span data-testid="dragging">{String(ctx.isDragging)}</span>
        <span data-testid="hovered">{ctx.hoveredItemId ?? 'none'}</span>
        <span data-testid="hover-world">
          {ctx.hoverWorldPoint
            ? `${Math.round(ctx.hoverWorldPoint.x)},${Math.round(ctx.hoverWorldPoint.y)}`
            : 'none'}
        </span>
      </div>
    );
  }

  it('exposes default state and updates hover on pointermove', () => {
    const items: MinimapItem[] = [
      { id: 'node-1', type: 'rect', x: 0, y: 0, width: 200, height: 100 },
    ];
    renderWithTheme(
      <Minimap {...baseProps} items={items} testId="minimap">
        <ContextProbe />
      </Minimap>
    );

    expect(screen.getByTestId('hovered').textContent).toBe('none');
    expect(screen.getByTestId('hover-world').textContent).toBe('none');

    const body = screen.getByRole('region', { name: 'Minimap' });
    fireEvent(
      body,
      new MockPointerEvent('pointermove', {
        clientX: 20,
        clientY: 10,
        bubbles: true,
      }) as unknown as PointerEvent
    );

    // (20, 10) on a 200×100 minimap maps to world (100, 50) for the
    // default 1000×500 bounds — inside the only rect.
    expect(screen.getByTestId('hover-world').textContent).toBe('100,50');
    expect(screen.getByTestId('hovered').textContent).toBe('node-1');
  });

  it('clears hover on pointerleave', () => {
    renderWithTheme(
      <Minimap {...baseProps} testId="minimap">
        <ContextProbe />
      </Minimap>
    );
    const body = screen.getByRole('region', { name: 'Minimap' });
    fireEvent(
      body,
      new MockPointerEvent('pointermove', {
        clientX: 20,
        clientY: 10,
      }) as unknown as PointerEvent
    );
    expect(screen.getByTestId('hover-world').textContent).not.toBe('none');

    fireEvent.pointerLeave(body);
    expect(screen.getByTestId('hover-world').textContent).toBe('none');
  });
});

describe('Custom rendering', () => {
  it('invokes draw for a custom item', () => {
    const drawFn = vi.fn();
    const items: MinimapItem[] = [
      {
        id: 'c',
        type: 'custom',
        bounds: { x: 0, y: 0, width: 100, height: 100 },
        draw: drawFn,
      },
    ];
    renderWithTheme(<Minimap {...baseProps} items={items} testId="minimap" />);
    expect(drawFn).toHaveBeenCalled();
    const call = drawFn.mock.calls[0] as [
      CanvasRenderingContext2D,
      { worldToMinimap: unknown; minimapToWorld: unknown; scale: number },
    ];
    expect(call[0]).toBeDefined();
    expect(call[1]).toHaveProperty('worldToMinimap');
    expect(call[1]).toHaveProperty('minimapToWorld');
    expect(call[1]).toHaveProperty('scale');
  });

  it('calls renderOverlay after items in each draw pass', () => {
    const order: string[] = [];
    const items: MinimapItem[] = [
      {
        id: 'c',
        type: 'custom',
        bounds: { x: 0, y: 0, width: 100, height: 100 },
        draw: () => order.push('item'),
      },
    ];
    renderWithTheme(
      <Minimap
        {...baseProps}
        items={items}
        renderOverlay={() => order.push('overlay')}
        testId="minimap"
      />
    );
    expect(order.length).toBeGreaterThanOrEqual(2);
    // Item drawn before overlay in every pair.
    for (let i = 0; i < order.length; i += 2) {
      expect(order[i]).toBe('item');
      expect(order[i + 1]).toBe('overlay');
    }
  });
});
