/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  drawGrid,
  drawDomainBounds,
  drawAxisLabels,
  drawCrosshair,
  drawPointMarker,
  drawOriginAxes,
  formatLabel,
} from './canvasDrawing';
import type {
  CanvasViewport,
  CanvasThemeColors,
  DomainBounds,
} from './canvas.types';

// ─── Mock Canvas Context ───

function createMockContext(): CanvasRenderingContext2D {
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
    globalAlpha: 1,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    textAlign: 'left',
    textBaseline: 'top',
    font: '',
  } as unknown as CanvasRenderingContext2D;
}

const mockTheme: CanvasThemeColors = {
  backgroundSecondary: '#2d2d2d',
  borderDefault: '#4a4a4a',
  textMuted: '#888888',
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  accentPrimary: '#007acc',
  fontSizeXs: 10,
};

const viewport: CanvasViewport = {
  viewX: [0, 1],
  viewY: [0, 1],
};

const domain: DomainBounds = {
  domainX: [0, 1],
  domainY: [0, 1],
};

const W = 320;
const H = 200;

describe('canvasDrawing', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockContext();
  });

  describe('formatLabel', () => {
    it('formats integers without decimals', () => {
      expect(formatLabel(0, 1)).toBe('0');
      expect(formatLabel(1, 1)).toBe('1');
      expect(formatLabel(100, 100)).toBe('100');
    });

    it('formats clean fractions for small ranges', () => {
      expect(formatLabel(0.5, 1)).toBe('0.5');
      expect(formatLabel(0.25, 1)).toBe('0.25');
      expect(formatLabel(0.75, 1)).toBe('0.75');
    });

    it('formats with one decimal for medium ranges', () => {
      expect(formatLabel(5.5, 10)).toBe('5.5');
    });

    it('formats as integer for large ranges', () => {
      expect(formatLabel(50, 100)).toBe('50');
    });
  });

  describe('drawGrid', () => {
    it('calls stroke for each grid line', () => {
      drawGrid(ctx, W, H, mockTheme, {
        subdivisions: 4,
        domain,
        viewport,
      });

      // 5 vertical + 5 horizontal lines (0..4 subdivisions = 5 lines each)
      expect(ctx.stroke).toHaveBeenCalledTimes(10);
    });

    it('sets stroke style to border color', () => {
      drawGrid(ctx, W, H, mockTheme, {
        subdivisions: 2,
        domain,
        viewport,
      });

      expect(ctx.strokeStyle).toBe(mockTheme.borderDefault);
    });

    it('applies opacity multiplier', () => {
      drawGrid(ctx, W, H, mockTheme, {
        subdivisions: 1,
        domain,
        viewport,
        opacity: 0.5,
      });

      // Should use reduced opacity
      expect(ctx.beginPath).toHaveBeenCalled();
    });
  });

  describe('drawDomainBounds', () => {
    it('draws 4 boundary lines', () => {
      drawDomainBounds(ctx, W, H, mockTheme, domain, viewport);
      // 4 lines: left, right, bottom, top
      expect(ctx.stroke).toHaveBeenCalledTimes(4);
    });

    it('uses stronger line width', () => {
      drawDomainBounds(ctx, W, H, mockTheme, domain, viewport);
      expect(ctx.lineWidth).toBe(1.5);
    });
  });

  describe('drawAxisLabels', () => {
    it('calls fillText for axis value labels', () => {
      drawAxisLabels(ctx, W, H, mockTheme, {
        subdivisions: 4,
        domain,
        viewport,
      });

      // At least 10 labels: 5 X + 5 Y
      expect(ctx.fillText).toHaveBeenCalled();
      const callCount = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls
        .length;
      expect(callCount).toBeGreaterThanOrEqual(10);
    });

    it('draws axis name labels when provided', () => {
      drawAxisLabels(ctx, W, H, mockTheme, {
        subdivisions: 4,
        domain,
        viewport,
        labelX: 'Time',
        labelY: 'Value',
      });

      const fillTextCalls = (ctx.fillText as ReturnType<typeof vi.fn>).mock
        .calls;
      const labelTexts = fillTextCalls.map(
        (call: unknown[]) => (call as [string, number, number])[0]
      );
      expect(labelTexts).toContain('Time');
      expect(labelTexts).toContain('Value');
    });
  });

  describe('drawCrosshair', () => {
    it('draws two lines (vertical + horizontal)', () => {
      drawCrosshair(ctx, W, H, mockTheme, {
        point: { x: 0.5, y: 0.5 },
        viewport,
      });

      expect(ctx.stroke).toHaveBeenCalledTimes(2);
    });

    it('sets dashed line style by default', () => {
      drawCrosshair(ctx, W, H, mockTheme, {
        point: { x: 0.5, y: 0.5 },
        viewport,
      });

      expect(ctx.setLineDash).toHaveBeenCalledWith([4, 4]);
    });

    it('sets solid line style when specified', () => {
      drawCrosshair(ctx, W, H, mockTheme, {
        point: { x: 0.5, y: 0.5 },
        viewport,
        lineStyle: 'solid',
      });

      expect(ctx.setLineDash).toHaveBeenCalledWith([]);
    });

    it('uses accent color for crosshair', () => {
      drawCrosshair(ctx, W, H, mockTheme, {
        point: { x: 0.5, y: 0.5 },
        viewport,
      });

      expect(ctx.strokeStyle).toBe(mockTheme.accentPrimary);
    });
  });

  describe('drawPointMarker', () => {
    it('draws outer ring and inner dot', () => {
      drawPointMarker(ctx, W, H, mockTheme, {
        point: { x: 0.5, y: 0.5 },
        viewport,
      });

      // Two arcs: outer ring + inner dot
      expect(ctx.arc).toHaveBeenCalledTimes(2);
      // Outer ring has fill + stroke, inner dot has fill
      expect(ctx.fill).toHaveBeenCalledTimes(2);
      expect(ctx.stroke).toHaveBeenCalledTimes(1);
    });

    it('increases radius when hovered', () => {
      drawPointMarker(ctx, W, H, mockTheme, {
        point: { x: 0.5, y: 0.5 },
        viewport,
        hovered: true,
        radius: 6,
      });

      const arcCalls = (ctx.arc as ReturnType<typeof vi.fn>).mock.calls;
      // First arc call is the outer ring — radius should be 6 + 2 = 8
      expect(arcCalls[0]?.[2]).toBe(8);
    });

    it('uses accent color for fill when dragging', () => {
      drawPointMarker(ctx, W, H, mockTheme, {
        point: { x: 0.5, y: 0.5 },
        viewport,
        dragging: true,
      });

      // After the outer arc, fillStyle should be accentPrimary when dragging
      expect(ctx.fillStyle).toBe(mockTheme.accentPrimary);
    });
  });

  describe('drawOriginAxes', () => {
    it('draws both axes when origin is in viewport', () => {
      const vp: CanvasViewport = { viewX: [-1, 1], viewY: [-1, 1] };
      drawOriginAxes(ctx, W, H, mockTheme, vp);

      // Both X and Y origin axes
      expect(ctx.stroke).toHaveBeenCalledTimes(2);
    });

    it('draws only Y axis when X=0 is in viewport but Y=0 is not', () => {
      const vp: CanvasViewport = { viewX: [-1, 1], viewY: [1, 2] };
      drawOriginAxes(ctx, W, H, mockTheme, vp);

      expect(ctx.stroke).toHaveBeenCalledTimes(1);
    });

    it('draws nothing when origin is outside viewport', () => {
      const vp: CanvasViewport = { viewX: [1, 2], viewY: [1, 2] };
      drawOriginAxes(ctx, W, H, mockTheme, vp);

      expect(ctx.stroke).not.toHaveBeenCalled();
    });
  });
});
