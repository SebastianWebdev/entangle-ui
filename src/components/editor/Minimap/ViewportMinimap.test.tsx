import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Viewport } from '@/components/primitives/viewport';
import { ViewportMinimap } from './ViewportMinimap';
import type { MinimapHandle } from './Minimap.types';

import '@/theme/darkTheme.css';

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

beforeEach(() => {
  const mockCtx = {
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
    translate: vi.fn(),
    measureText: vi.fn(() => ({ width: 20 })),
    fillText: vi.fn(),
    setLineDash: vi.fn(),
  };
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => mockCtx
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);
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
  globalThis.ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  } as unknown as typeof ResizeObserver;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    cb(0);
    return 0;
  });
});

describe('ViewportMinimap', () => {
  it('renders inside Viewport as an overlay slot', () => {
    renderWithTheme(
      <Viewport>
        <ViewportMinimap
          items={[]}
          worldBounds={{ x: 0, y: 0, width: 100, height: 100 }}
          testId="vmm"
        />
      </Viewport>
    );
    // Minimap body has the role
    expect(screen.getByRole('region', { name: 'Minimap' })).toBeInTheDocument();
  });

  it('respects placement preset (top-left applies top + left)', () => {
    const { container } = renderWithTheme(
      <Viewport>
        <ViewportMinimap
          items={[]}
          worldBounds={{ x: 0, y: 0, width: 100, height: 100 }}
          placement="top-left"
          margin={20}
          testId="vmm"
        />
      </Viewport>
    );
    const wrappers = container.querySelectorAll(
      'div[style*="position: absolute"]'
    );
    const wrapper = Array.from(wrappers).find(
      el => (el as HTMLElement).style.top === '20px'
    ) as HTMLElement | undefined;
    expect(wrapper).toBeDefined();
    expect(wrapper?.style.left).toBe('20px');
  });

  it('respects placement preset (bottom-right applies bottom + right)', () => {
    const { container } = renderWithTheme(
      <Viewport>
        <ViewportMinimap
          items={[]}
          worldBounds={{ x: 0, y: 0, width: 100, height: 100 }}
          placement="bottom-right"
          margin={8}
          testId="vmm"
        />
      </Viewport>
    );
    const wrappers = container.querySelectorAll(
      'div[style*="position: absolute"]'
    );
    const wrapper = Array.from(wrappers).find(
      el => (el as HTMLElement).style.bottom === '8px'
    ) as HTMLElement | undefined;
    expect(wrapper).toBeDefined();
    expect(wrapper?.style.right).toBe('8px');
  });

  it('accepts a custom placement object', () => {
    const { container } = renderWithTheme(
      <Viewport>
        <ViewportMinimap
          items={[]}
          worldBounds={{ x: 0, y: 0, width: 100, height: 100 }}
          placement={{ top: 50, left: 50, width: 180 }}
          testId="vmm"
        />
      </Viewport>
    );
    const wrappers = container.querySelectorAll(
      'div[style*="position: absolute"]'
    );
    const wrapper = Array.from(wrappers).find(
      el => (el as HTMLElement).style.top === '50px'
    ) as HTMLElement | undefined;
    expect(wrapper).toBeDefined();
    expect(wrapper?.style.left).toBe('50px');
  });

  it('forwards ref to the inner Minimap handle', () => {
    const handle: { current: MinimapHandle | null } = { current: null };
    renderWithTheme(
      <Viewport>
        <ViewportMinimap
          items={[]}
          worldBounds={{ x: 0, y: 0, width: 100, height: 100 }}
          ref={handle}
          testId="vmm"
        />
      </Viewport>
    );
    const h = handle.current;
    if (!h) throw new Error('ref not populated');
    expect(h.getElement()?.getAttribute('role')).toBe('region');
  });

  it('wires onNavigate to viewport.centerOn (via context handle)', () => {
    // We can't easily intercept centerOn without mocking the handle,
    // but we can verify the user's onNavigate (passed through) fires.
    const userNav = vi.fn();
    renderWithTheme(
      <Viewport>
        <ViewportMinimap
          items={[]}
          worldBounds={{ x: 0, y: 0, width: 1000, height: 500 }}
          onNavigate={userNav}
          testId="vmm"
        />
      </Viewport>
    );
    const body = screen.getByRole('region', { name: 'Minimap' });
    fireEvent(
      body,
      new MockPointerEvent('pointerdown', {
        clientX: 190,
        clientY: 90,
        button: 0,
      }) as unknown as PointerEvent
    );
    fireEvent(
      body,
      new MockPointerEvent('pointerup', {
        clientX: 190,
        clientY: 90,
        button: 0,
      }) as unknown as PointerEvent
    );
    expect(userNav).toHaveBeenCalled();
  });
});
