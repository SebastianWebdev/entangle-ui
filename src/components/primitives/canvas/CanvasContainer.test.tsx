import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { CanvasContainer } from './CanvasContainer';

import '@/theme/darkTheme.css';

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

beforeEach(() => {
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => ({})
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 320,
    height: 200,
    top: 0,
    left: 0,
    bottom: 200,
    right: 320,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  }));
});

function createCanvasRef() {
  return React.createRef<HTMLCanvasElement>();
}

describe('CanvasContainer', () => {
  describe('Rendering', () => {
    it('renders canvas element', () => {
      const canvasRef = createCanvasRef();
      renderWithTheme(<CanvasContainer canvasRef={canvasRef} />);
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('renders with default role="application"', () => {
      const canvasRef = createCanvasRef();
      renderWithTheme(<CanvasContainer canvasRef={canvasRef} />);
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    it('applies aria-label', () => {
      const canvasRef = createCanvasRef();
      renderWithTheme(
        <CanvasContainer canvasRef={canvasRef} ariaLabel="Test canvas" />
      );
      expect(screen.getByRole('application')).toHaveAttribute(
        'aria-label',
        'Test canvas'
      );
    });

    it('applies aria-roledescription', () => {
      const canvasRef = createCanvasRef();
      renderWithTheme(
        <CanvasContainer
          canvasRef={canvasRef}
          ariaRoledescription="2D picker"
        />
      );
      expect(screen.getByRole('application')).toHaveAttribute(
        'aria-roledescription',
        '2D picker'
      );
    });

    it('applies data-testid', () => {
      const canvasRef = createCanvasRef();
      renderWithTheme(
        <CanvasContainer canvasRef={canvasRef} testId="my-canvas" />
      );
      expect(screen.getByTestId('my-canvas')).toBeInTheDocument();
    });

    it('sets tabIndex to 0 when not disabled', () => {
      const canvasRef = createCanvasRef();
      renderWithTheme(<CanvasContainer canvasRef={canvasRef} />);
      expect(screen.getByRole('application')).toHaveAttribute(
        'tabindex',
        '0'
      );
    });

    it('sets tabIndex to -1 when disabled', () => {
      const canvasRef = createCanvasRef();
      renderWithTheme(<CanvasContainer canvasRef={canvasRef} disabled />);
      expect(screen.getByRole('application')).toHaveAttribute(
        'tabindex',
        '-1'
      );
    });
  });

  describe('Live announcements', () => {
    it('renders aria-live region', () => {
      const canvasRef = createCanvasRef();
      renderWithTheme(<CanvasContainer canvasRef={canvasRef} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows live announcement content', () => {
      const canvasRef = createCanvasRef();
      renderWithTheme(
        <CanvasContainer
          canvasRef={canvasRef}
          liveAnnouncement="Point at X: 0.5, Y: 0.5"
        />
      );
      expect(screen.getByRole('status')).toHaveTextContent(
        'Point at X: 0.5, Y: 0.5'
      );
    });
  });

  describe('Event handlers', () => {
    it('forwards pointer down events', () => {
      const onPointerDown = vi.fn();
      const canvasRef = createCanvasRef();
      renderWithTheme(
        <CanvasContainer
          canvasRef={canvasRef}
          handlers={{ onPointerDown }}
        />
      );
      fireEvent.pointerDown(screen.getByRole('application'));
      expect(onPointerDown).toHaveBeenCalled();
    });

    it('forwards pointer move events', () => {
      const onPointerMove = vi.fn();
      const canvasRef = createCanvasRef();
      renderWithTheme(
        <CanvasContainer
          canvasRef={canvasRef}
          handlers={{ onPointerMove }}
        />
      );
      fireEvent.pointerMove(screen.getByRole('application'));
      expect(onPointerMove).toHaveBeenCalled();
    });

    it('forwards pointer up events', () => {
      const onPointerUp = vi.fn();
      const canvasRef = createCanvasRef();
      renderWithTheme(
        <CanvasContainer
          canvasRef={canvasRef}
          handlers={{ onPointerUp }}
        />
      );
      fireEvent.pointerUp(screen.getByRole('application'));
      expect(onPointerUp).toHaveBeenCalled();
    });

    it('forwards double click events', () => {
      const onDoubleClick = vi.fn();
      const canvasRef = createCanvasRef();
      renderWithTheme(
        <CanvasContainer
          canvasRef={canvasRef}
          handlers={{ onDoubleClick }}
        />
      );
      fireEvent.doubleClick(screen.getByRole('application'));
      expect(onDoubleClick).toHaveBeenCalled();
    });

    it('forwards keyboard events', () => {
      const onKeyDown = vi.fn();
      const canvasRef = createCanvasRef();
      renderWithTheme(
        <CanvasContainer canvasRef={canvasRef} handlers={{ onKeyDown }} />
      );
      fireEvent.keyDown(screen.getByRole('application'), { key: 'ArrowUp' });
      expect(onKeyDown).toHaveBeenCalled();
    });
  });
});
