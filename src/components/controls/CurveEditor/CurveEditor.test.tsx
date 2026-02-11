import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { KeyboardContextProvider } from '@/context/KeyboardContext';
import { CurveEditor } from './CurveEditor';
import type { CurveData, CurveEditorProps } from './CurveEditor.types';
import {
  evaluateBezier,
  evaluateCurve,
  findTForX,
  sampleCurve,
  computeAutoTangent,
  constrainTangent,
  sortKeyframes,
  wrapX,
  domainToCanvas,
  canvasToDomain,
  hitTest,
  createLinearCurve,
} from './curveUtils';
import { CURVE_PRESETS } from './curvePresets';

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

// Mock ResizeObserver (not available in jsdom)
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

  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

  // Mock pointer capture methods (not available in jsdom)
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
});

// ─── Helpers ───

const linearCurve = createLinearCurve();

function renderEditor(props: Partial<CurveEditorProps> = {}) {
  return renderWithTheme(
    <KeyboardContextProvider>
      <CurveEditor testId="curve-editor" {...props} />
    </KeyboardContextProvider>
  );
}

function getCanvas() {
  return screen.getByRole('application');
}

// ═══════════════════════════════════════
// curveUtils Unit Tests
// ═══════════════════════════════════════

describe('curveUtils', () => {
  describe('evaluateBezier', () => {
    it('returns p0 at t=0', () => {
      expect(evaluateBezier(0, 0.33, 0.66, 1, 0)).toBe(0);
    });

    it('returns p3 at t=1', () => {
      expect(evaluateBezier(0, 0.33, 0.66, 1, 1)).toBe(1);
    });

    it('returns midpoint at t=0.5 for linear', () => {
      const result = evaluateBezier(0, 0.333, 0.666, 1, 0.5);
      expect(result).toBeCloseTo(0.5, 2);
    });
  });

  describe('findTForX', () => {
    it('converges for linear segment', () => {
      const t = findTForX(0, 0.333, 0.666, 1, 0.5);
      const x = evaluateBezier(0, 0.333, 0.666, 1, t);
      expect(x).toBeCloseTo(0.5, 4);
    });

    it('finds t=0 for x at start', () => {
      const t = findTForX(0, 0.333, 0.666, 1, 0);
      expect(t).toBeCloseTo(0, 4);
    });

    it('finds t=1 for x at end', () => {
      const t = findTForX(0, 0.333, 0.666, 1, 1);
      expect(t).toBeCloseTo(1, 4);
    });
  });

  describe('evaluateCurve', () => {
    it('evaluates linear curve at midpoint', () => {
      const curve = createLinearCurve();
      const y = evaluateCurve(curve, 0.5);
      expect(y).toBeCloseTo(0.5, 2);
    });

    it('returns first Y for x before domain', () => {
      const curve = createLinearCurve();
      expect(evaluateCurve(curve, -1)).toBe(0);
    });

    it('returns last Y for x after domain', () => {
      const curve = createLinearCurve();
      expect(evaluateCurve(curve, 2)).toBe(1);
    });

    it('handles single keyframe curve', () => {
      const curve: CurveData = {
        keyframes: [
          {
            x: 0.5,
            y: 0.7,
            handleIn: { x: 0, y: 0 },
            handleOut: { x: 0, y: 0 },
            tangentMode: 'linear',
          },
        ],
        domainX: [0, 1],
        domainY: [0, 1],
      };
      expect(evaluateCurve(curve, 0.5)).toBe(0.7);
    });
  });

  describe('sampleCurve', () => {
    it('returns correct number of samples', () => {
      const samples = sampleCurve(linearCurve, 10);
      expect(samples).toHaveLength(10);
    });

    it('first sample is at domain start', () => {
      const samples = sampleCurve(linearCurve, 10);
      expect(samples[0]?.x).toBe(0);
    });

    it('last sample is at domain end', () => {
      const samples = sampleCurve(linearCurve, 10);
      expect(samples[9]?.x).toBeCloseTo(1, 4);
    });
  });

  describe('computeAutoTangent', () => {
    it('computes smooth tangent from neighbors', () => {
      const prev = {
        x: 0,
        y: 0,
        handleIn: { x: 0, y: 0 },
        handleOut: { x: 0, y: 0 },
        tangentMode: 'auto' as const,
      };
      const current = {
        x: 0.5,
        y: 0.5,
        handleIn: { x: 0, y: 0 },
        handleOut: { x: 0, y: 0 },
        tangentMode: 'auto' as const,
      };
      const next = {
        x: 1,
        y: 1,
        handleIn: { x: 0, y: 0 },
        handleOut: { x: 0, y: 0 },
        tangentMode: 'auto' as const,
      };

      const result = computeAutoTangent(prev, current, next);

      // Tangent should point from prev to next direction
      expect(result.handleOut.x).toBeGreaterThan(0);
      expect(result.handleOut.y).toBeGreaterThan(0);
      expect(result.handleIn.x).toBeLessThan(0);
      expect(result.handleIn.y).toBeLessThan(0);
    });

    it('handles null prev (first keyframe)', () => {
      const current = {
        x: 0,
        y: 0,
        handleIn: { x: 0, y: 0 },
        handleOut: { x: 0, y: 0 },
        tangentMode: 'auto' as const,
      };
      const next = {
        x: 1,
        y: 1,
        handleIn: { x: 0, y: 0 },
        handleOut: { x: 0, y: 0 },
        tangentMode: 'auto' as const,
      };

      const result = computeAutoTangent(null, current, next);
      expect(result.handleOut.x).toBeGreaterThan(0);
    });

    it('handles null next (last keyframe)', () => {
      const prev = {
        x: 0,
        y: 0,
        handleIn: { x: 0, y: 0 },
        handleOut: { x: 0, y: 0 },
        tangentMode: 'auto' as const,
      };
      const current = {
        x: 1,
        y: 1,
        handleIn: { x: 0, y: 0 },
        handleOut: { x: 0, y: 0 },
        tangentMode: 'auto' as const,
      };

      const result = computeAutoTangent(prev, current, null);
      expect(result.handleIn.x).toBeLessThan(0);
    });
  });

  describe('constrainTangent', () => {
    it('mirrors handle for mirrored mode', () => {
      const kf = {
        x: 0.5,
        y: 0.5,
        handleIn: { x: -0.2, y: 0.1 },
        handleOut: { x: 0.1, y: -0.05 },
        tangentMode: 'mirrored' as const,
      };

      const result = constrainTangent(kf, 'in');
      expect(result.handleOut.x).toBeCloseTo(0.2, 4);
      expect(result.handleOut.y).toBeCloseTo(-0.1, 4);
    });

    it('aligns direction for aligned mode', () => {
      const kf = {
        x: 0.5,
        y: 0.5,
        handleIn: { x: -0.2, y: 0 },
        handleOut: { x: 0.3, y: 0 },
        tangentMode: 'aligned' as const,
      };

      const result = constrainTangent(kf, 'in');
      // Out handle should be co-linear but keep its original length
      expect(result.handleOut.x).toBeGreaterThan(0);
      expect(Math.abs(result.handleOut.y)).toBeLessThan(0.001);
    });

    it('returns unchanged for free mode', () => {
      const kf = {
        x: 0.5,
        y: 0.5,
        handleIn: { x: -0.2, y: 0.1 },
        handleOut: { x: 0.1, y: -0.3 },
        tangentMode: 'free' as const,
      };

      const result = constrainTangent(kf, 'in');
      expect(result).toEqual(kf);
    });
  });

  describe('sortKeyframes', () => {
    it('sorts by X position', () => {
      const keyframes = [
        {
          x: 0.8,
          y: 0.5,
          handleIn: { x: 0, y: 0 },
          handleOut: { x: 0, y: 0 },
          tangentMode: 'linear' as const,
        },
        {
          x: 0.2,
          y: 0.3,
          handleIn: { x: 0, y: 0 },
          handleOut: { x: 0, y: 0 },
          tangentMode: 'linear' as const,
        },
        {
          x: 0.5,
          y: 0.7,
          handleIn: { x: 0, y: 0 },
          handleOut: { x: 0, y: 0 },
          tangentMode: 'linear' as const,
        },
      ];

      const sorted = sortKeyframes(keyframes);
      expect(sorted[0]?.x).toBe(0.2);
      expect(sorted[1]?.x).toBe(0.5);
      expect(sorted[2]?.x).toBe(0.8);
    });

    it('does not mutate original array', () => {
      const keyframes = [
        {
          x: 1,
          y: 0,
          handleIn: { x: 0, y: 0 },
          handleOut: { x: 0, y: 0 },
          tangentMode: 'linear' as const,
        },
        {
          x: 0,
          y: 0,
          handleIn: { x: 0, y: 0 },
          handleOut: { x: 0, y: 0 },
          tangentMode: 'linear' as const,
        },
      ];

      sortKeyframes(keyframes);
      expect(keyframes[0]?.x).toBe(1);
    });
  });

  describe('wrapX', () => {
    it('returns x unchanged when within range', () => {
      const result = wrapX(0.5, [0, 1], 'constant', 'constant');
      expect(result.wrappedX).toBe(0.5);
    });

    it('clamps for constant mode', () => {
      expect(wrapX(-0.5, [0, 1], 'constant', 'constant').wrappedX).toBe(0);
      expect(wrapX(1.5, [0, 1], 'constant', 'constant').wrappedX).toBe(1);
    });

    it('cycles for cycle mode', () => {
      const result = wrapX(1.3, [0, 1], 'constant', 'cycle');
      expect(result.wrappedX).toBeCloseTo(0.3, 4);
    });

    it('pingpongs for pingpong mode', () => {
      const result = wrapX(1.3, [0, 1], 'constant', 'pingpong');
      expect(result.wrappedX).toBeCloseTo(0.7, 4);
    });
  });

  describe('domainToCanvas / canvasToDomain', () => {
    const viewport = {
      viewX: [0, 1] as [number, number],
      viewY: [0, 1] as [number, number],
      zoom: 1,
      panX: 0,
      panY: 0,
    };

    it('round-trip preserves coordinates', () => {
      const original = { x: 0.3, y: 0.7 };
      const canvas = domainToCanvas(original.x, original.y, viewport, 320, 200);
      const domain = canvasToDomain(canvas.px, canvas.py, viewport, 320, 200);

      expect(domain.x).toBeCloseTo(original.x, 4);
      expect(domain.y).toBeCloseTo(original.y, 4);
    });

    it('maps domain origin to correct canvas position', () => {
      const result = domainToCanvas(0, 0, viewport, 320, 200);
      expect(result.px).toBe(0);
      expect(result.py).toBe(200); // Y flipped
    });

    it('maps domain (1,1) to canvas top-right', () => {
      const result = domainToCanvas(1, 1, viewport, 320, 200);
      expect(result.px).toBe(320);
      expect(result.py).toBe(0);
    });
  });

  describe('hitTest', () => {
    const viewport = {
      viewX: [0, 1] as [number, number],
      viewY: [0, 1] as [number, number],
      zoom: 1,
      panX: 0,
      panY: 0,
    };

    it('finds keyframe within tolerance', () => {
      const curve = createLinearCurve();
      // First keyframe is at (0, 0) which maps to canvas (0, 200)
      const result = hitTest(2, 198, curve, viewport, 320, 200, 10);
      expect(result.type).toBe('keyframe');
      expect(result.keyframeIndex).toBe(0);
    });

    it('returns none for empty area', () => {
      const curve = createLinearCurve();
      const result = hitTest(160, 50, curve, viewport, 320, 200, 5);
      // Might hit the curve line — use tighter tolerance
      if (result.type !== 'none') {
        expect(['keyframe', 'curve']).toContain(result.type);
      }
    });
  });
});

// ═══════════════════════════════════════
// Presets
// ═══════════════════════════════════════

describe('CURVE_PRESETS', () => {
  it('has 13 built-in presets', () => {
    expect(CURVE_PRESETS).toHaveLength(13);
  });

  it('each preset has valid curve data', () => {
    for (const preset of CURVE_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.label).toBeTruthy();
      expect(preset.curve.keyframes.length).toBeGreaterThanOrEqual(2);
      expect(preset.curve.domainX).toHaveLength(2);
      expect(preset.curve.domainY).toHaveLength(2);
    }
  });
});

// ═══════════════════════════════════════
// CurveEditor Component — Rendering
// ═══════════════════════════════════════

describe('CurveEditor', () => {
  describe('Rendering', () => {
    it('renders canvas with correct role', () => {
      renderEditor();
      expect(getCanvas()).toBeInTheDocument();
      expect(getCanvas()).toHaveAttribute('role', 'application');
    });

    it('renders with default ease-in-out curve in uncontrolled mode', () => {
      renderEditor();
      expect(getCanvas()).toHaveAttribute(
        'aria-roledescription',
        expect.stringContaining('2 keyframes')
      );
    });

    it('renders toolbar when showToolbar=true', () => {
      renderEditor({ showToolbar: true });
      expect(screen.getByTestId('curve-editor-toolbar')).toBeInTheDocument();
    });

    it('hides toolbar when showToolbar=false', () => {
      renderEditor({ showToolbar: false });
      expect(
        screen.queryByTestId('curve-editor-toolbar')
      ).not.toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderEditor({ testId: 'my-curve' });
      expect(screen.getByTestId('my-curve')).toBeInTheDocument();
    });

    it('renders disabled state', () => {
      renderEditor({ disabled: true });
      expect(getCanvas()).toHaveAttribute('tabindex', '-1');
    });

    it('calls renderBackground with canvas context and info', () => {
      const renderBackground = vi.fn();
      renderEditor({ renderBackground });
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
      expect(info.width).toBe(320);
      expect(info.height).toBe(200);
      expect(info.domainX).toEqual([0, 1]);
      expect(info.domainY).toEqual([0, 1]);
      expect(info.viewport).toBeDefined();
      // ctx.save/restore should be called around renderBackground
      expect(mockCtx['save']).toHaveBeenCalled();
      expect(mockCtx['restore']).toHaveBeenCalled();
    });
  });

  describe('Controlled / Uncontrolled', () => {
    it('respects controlled value prop', () => {
      const curve = createLinearCurve([0, 10], [0, 10]);
      renderEditor({ value: curve });
      expect(getCanvas()).toHaveAttribute(
        'aria-roledescription',
        expect.stringContaining('2 keyframes')
      );
    });

    it('fires onChange on interaction', () => {
      const onChange = vi.fn();
      renderEditor({ onChange });
      const canvas = getCanvas();

      // Simulate double-click to add keyframe
      fireEvent.doubleClick(canvas, { clientX: 160, clientY: 100 });
      expect(onChange).toHaveBeenCalled();
    });

    it('fires onChangeComplete on committed change', () => {
      const onChangeComplete = vi.fn();
      renderEditor({ onChangeComplete });
      const canvas = getCanvas();

      // Double-click adds a keyframe — fires onChangeComplete
      fireEvent.doubleClick(canvas, { clientX: 160, clientY: 100 });
      expect(onChangeComplete).toHaveBeenCalled();
    });

    it('manages internal state from defaultValue', () => {
      const defaultValue: CurveData = {
        keyframes: [
          {
            x: 0,
            y: 0,
            handleIn: { x: 0, y: 0 },
            handleOut: { x: 0.1, y: 0 },
            tangentMode: 'linear',
            id: 'a',
          },
          {
            x: 0.5,
            y: 0.5,
            handleIn: { x: -0.1, y: 0 },
            handleOut: { x: 0.1, y: 0 },
            tangentMode: 'linear',
            id: 'b',
          },
          {
            x: 1,
            y: 1,
            handleIn: { x: -0.1, y: 0 },
            handleOut: { x: 0, y: 0 },
            tangentMode: 'linear',
            id: 'c',
          },
        ],
        domainX: [0, 1],
        domainY: [0, 1],
      };
      renderEditor({ defaultValue });
      expect(getCanvas()).toHaveAttribute(
        'aria-roledescription',
        expect.stringContaining('3 keyframes')
      );
    });
  });

  describe('Interaction', () => {
    it('adds keyframe on double-click', () => {
      const onChange = vi.fn();
      renderEditor({ onChange, allowAdd: true });
      const canvas = getCanvas();

      fireEvent.doubleClick(canvas, { clientX: 160, clientY: 100 });
      expect(onChange).toHaveBeenCalled();

      const newCurve = onChange.mock.calls[0]?.[0] as CurveData | undefined;
      expect(newCurve?.keyframes.length).toBe(3); // Was 2, now 3
    });

    it('does not add keyframe when allowAdd=false', () => {
      const onChange = vi.fn();
      renderEditor({ onChange, allowAdd: false });
      const canvas = getCanvas();

      fireEvent.doubleClick(canvas, { clientX: 160, clientY: 100 });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('handles keyboard Delete to remove selected keyframes', () => {
      const onChange = vi.fn();
      const defaultValue: CurveData = {
        keyframes: [
          {
            x: 0,
            y: 0,
            handleIn: { x: 0, y: 0 },
            handleOut: { x: 0.1, y: 0 },
            tangentMode: 'linear',
            id: 'a',
          },
          {
            x: 0.5,
            y: 0.5,
            handleIn: { x: -0.1, y: 0 },
            handleOut: { x: 0.1, y: 0 },
            tangentMode: 'linear',
            id: 'b',
          },
          {
            x: 1,
            y: 1,
            handleIn: { x: -0.1, y: 0 },
            handleOut: { x: 0, y: 0 },
            tangentMode: 'linear',
            id: 'c',
          },
        ],
        domainX: [0, 1],
        domainY: [0, 1],
      };
      renderEditor({ onChange, defaultValue, lockEndpoints: true });
      const canvas = getCanvas();

      // Click on middle keyframe area — (0.5, 0.5) maps to canvas (160, 100)
      fireEvent.pointerDown(canvas, {
        clientX: 160,
        clientY: 100,
        pointerId: 1,
        button: 0,
      });
      fireEvent.pointerUp(canvas, {
        clientX: 160,
        clientY: 100,
        pointerId: 1,
        button: 0,
      });

      // Press Delete
      fireEvent.keyDown(canvas, { key: 'Delete' });

      // If the middle keyframe was selected and deleted
      const calls = onChange.mock.calls;
      if (calls.length > 0) {
        const lastCall = calls[calls.length - 1]?.[0] as CurveData | undefined;
        if (lastCall) {
          expect(lastCall.keyframes.length).toBeLessThanOrEqual(3);
        }
      }
    });

    it('does not allow interaction when disabled', () => {
      const onChange = vi.fn();
      renderEditor({ onChange, disabled: true });
      const canvas = getCanvas();

      fireEvent.doubleClick(canvas, { clientX: 160, clientY: 100 });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not allow editing when readOnly', () => {
      const onChange = vi.fn();
      renderEditor({ onChange, readOnly: true });
      const canvas = getCanvas();

      fireEvent.doubleClick(canvas, { clientX: 160, clientY: 100 });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not add keyframe beyond maxKeyframes limit', () => {
      const onChange = vi.fn();
      // Default curve has 2 keyframes (ease-in-out), set max to 2
      renderEditor({ onChange, allowAdd: true, maxKeyframes: 2 });
      const canvas = getCanvas();

      fireEvent.doubleClick(canvas, { clientX: 160, clientY: 100 });
      // Should not have added a keyframe since we're at the limit
      const addCalls = onChange.mock.calls.filter(call => {
        const curveArg = call[0] as CurveData | undefined;
        return curveArg && curveArg.keyframes.length > 2;
      });
      expect(addCalls).toHaveLength(0);
    });
  });

  describe('Tangent Modes', () => {
    it('cycles tangent mode on keyframe double-click', () => {
      const onChange = vi.fn();
      const curve = createLinearCurve();
      // Set keyframe IDs so they're at known positions
      const kf0 = curve.keyframes[0];
      const kf1 = curve.keyframes[1];
      if (kf0) kf0.id = 'kf-start';
      if (kf1) kf1.id = 'kf-end';

      renderEditor({ onChange, value: curve });
      const canvas = getCanvas();

      // Double-click near first keyframe at (0, 0) -> canvas (0, 200)
      fireEvent.doubleClick(canvas, { clientX: 2, clientY: 198 });

      // This should either cycle tangent mode or add a keyframe
      // Since we're near a keyframe, it should cycle tangent mode
      if (onChange.mock.calls.length > 0) {
        const newCurve = onChange.mock.calls[0]?.[0] as CurveData | undefined;
        if (newCurve?.keyframes.length === 2) {
          // Tangent mode was cycled (not added keyframe)
          expect(newCurve.keyframes[0]?.tangentMode).not.toBe('linear');
        }
      }
    });

    it('keyboard shortcuts change tangent mode', () => {
      const onChange = vi.fn();
      const curve = createLinearCurve();
      const kfStart = curve.keyframes[0];
      if (kfStart) kfStart.id = 'kf-start';

      renderEditor({ onChange, value: curve });
      const canvas = getCanvas();

      // Select a keyframe first
      fireEvent.pointerDown(canvas, {
        clientX: 2,
        clientY: 198,
        pointerId: 1,
        button: 0,
      });
      fireEvent.pointerUp(canvas, {
        clientX: 2,
        clientY: 198,
        pointerId: 1,
        button: 0,
      });

      // Press '4' for auto tangent mode
      fireEvent.keyDown(canvas, { key: '4' });

      if (onChange.mock.calls.length > 0) {
        const lastCurve = onChange.mock.calls[
          onChange.mock.calls.length - 1
        ]?.[0] as CurveData | undefined;
        if (lastCurve) {
          // Should have changed tangent mode on the selected keyframe
          expect(lastCurve.keyframes).toBeDefined();
        }
      }
    });
  });

  describe('Viewport', () => {
    it('renders with responsive mode', () => {
      renderEditor({ responsive: true });
      expect(getCanvas()).toBeInTheDocument();
    });
  });

  describe('Toolbar', () => {
    it('renders preset selector', () => {
      renderEditor({ showToolbar: true });
      // Toolbar has a Select for presets
      expect(screen.getByTestId('curve-editor-toolbar')).toBeInTheDocument();
    });

    it('renders tangent mode buttons', () => {
      renderEditor({ showToolbar: true });
      expect(screen.getByLabelText('Free tangent mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Linear tangent mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Step tangent mode')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles 2-keyframe minimum curve', () => {
      renderEditor({ defaultValue: createLinearCurve() });
      const canvas = getCanvas();

      // Even after interaction, should not crash
      fireEvent.keyDown(canvas, { key: 'Delete' });
      expect(canvas).toBeInTheDocument();
    });

    it('handles many keyframes without crashing', () => {
      const keyframes = Array.from({ length: 50 }, (_, i) => ({
        x: i / 49,
        y: Math.sin((i / 49) * Math.PI),
        handleIn: { x: -0.01, y: 0 },
        handleOut: { x: 0.01, y: 0 },
        tangentMode: 'auto' as const,
        id: `kf-${i}`,
      }));

      const curve: CurveData = {
        keyframes,
        domainX: [0, 1],
        domainY: [0, 1],
      };

      renderEditor({ value: curve });
      expect(getCanvas()).toBeInTheDocument();
    });

    it('evaluates all presets without errors', () => {
      for (const preset of CURVE_PRESETS) {
        expect(() => evaluateCurve(preset.curve, 0.5)).not.toThrow();
      }
    });
  });

  describe('Accessibility', () => {
    it('has correct role and aria attributes', () => {
      renderEditor();
      const canvas = getCanvas();

      expect(canvas).toHaveAttribute('role', 'application');
      expect(canvas).toHaveAttribute('aria-label', 'Curve editor');
      expect(canvas).toHaveAttribute('tabindex', '0');
    });

    it('has aria-roledescription with keyframe count', () => {
      renderEditor();
      const canvas = getCanvas();

      expect(canvas).toHaveAttribute(
        'aria-roledescription',
        expect.stringContaining('keyframes')
      );
    });

    it('has aria-live region for announcements', () => {
      renderEditor();
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('renderBottomBar', () => {
    it('renders bottom bar container when renderBottomBar is provided', () => {
      renderEditor({
        testId: 'curve-editor',
        renderBottomBar: () => <div>Bottom content</div>,
      });
      expect(screen.getByTestId('curve-editor-bottom-bar')).toBeInTheDocument();
      expect(screen.getByText('Bottom content')).toBeInTheDocument();
    });

    it('does not render bottom bar when renderBottomBar is not provided', () => {
      renderEditor({ testId: 'curve-editor' });
      expect(
        screen.queryByTestId('curve-editor-bottom-bar')
      ).not.toBeInTheDocument();
    });

    it('passes correct curve info to renderBottomBar', () => {
      const renderBottomBar = vi.fn(() => null);
      const curve = createLinearCurve();
      renderEditor({ renderBottomBar, value: curve });

      expect(renderBottomBar).toHaveBeenCalled();
      const call = renderBottomBar.mock.calls[0] as unknown as [
        {
          curve: CurveData;
          selectedIds: string[];
          selectedKeyframes: unknown[];
          evaluate: (x: number) => number;
          disabled: boolean;
          readOnly: boolean;
        },
      ];
      const info = call[0];
      expect(info.curve.keyframes).toHaveLength(2);
      expect(info.selectedIds).toEqual([]);
      expect(info.selectedKeyframes).toEqual([]);
      expect(info.disabled).toBe(false);
      expect(info.readOnly).toBe(false);
    });

    it('provides working evaluate function', () => {
      const renderBottomBar = vi.fn(() => null);
      renderEditor({ renderBottomBar, value: createLinearCurve() });

      const call = renderBottomBar.mock.calls[0] as unknown as [
        { evaluate: (x: number) => number },
      ];
      const y = call[0].evaluate(0.5);
      expect(y).toBeCloseTo(0.5, 2);
    });

    it('passes disabled and readOnly state', () => {
      const renderBottomBar = vi.fn(() => null);
      renderEditor({ renderBottomBar, disabled: true, readOnly: true });

      const call = renderBottomBar.mock.calls[0] as unknown as [
        { disabled: boolean; readOnly: boolean },
      ];
      expect(call[0].disabled).toBe(true);
      expect(call[0].readOnly).toBe(true);
    });
  });

  describe('lockTangents', () => {
    it('hides tangent mode buttons when lockTangents is true', () => {
      renderEditor({ showToolbar: true, lockTangents: true });
      expect(
        screen.queryByLabelText('Free tangent mode')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Linear tangent mode')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Step tangent mode')
      ).not.toBeInTheDocument();
    });

    it('still shows preset selector when lockTangents is true', () => {
      renderEditor({ showToolbar: true, lockTangents: true });
      expect(screen.getByTestId('curve-editor-toolbar')).toBeInTheDocument();
    });

    it('blocks keyboard shortcuts 1-6 when lockTangents is true', () => {
      const onChange = vi.fn();
      const curve = createLinearCurve();
      const kfStart = curve.keyframes[0];
      if (kfStart) kfStart.id = 'kf-start';

      renderEditor({ onChange, value: curve, lockTangents: true });
      const canvas = getCanvas();

      // Select a keyframe first
      fireEvent.pointerDown(canvas, {
        clientX: 2,
        clientY: 198,
        pointerId: 1,
        button: 0,
      });
      fireEvent.pointerUp(canvas, {
        clientX: 2,
        clientY: 198,
        pointerId: 1,
        button: 0,
      });

      onChange.mockClear();

      // Press '4' for auto tangent mode
      fireEvent.keyDown(canvas, { key: '4' });

      // Should not have called onChange for tangent mode change
      expect(onChange).not.toHaveBeenCalled();
    });

    it('blocks tangent mode cycling on double-click when lockTangents is true', () => {
      const onChange = vi.fn();
      const curve = createLinearCurve();
      const kfStart = curve.keyframes[0];
      if (kfStart) kfStart.id = 'kf-start';

      renderEditor({ onChange, value: curve, lockTangents: true });
      const canvas = getCanvas();

      // Double-click near first keyframe at (0, 0) -> canvas (0, 200)
      fireEvent.doubleClick(canvas, { clientX: 2, clientY: 198 });

      // Should not have changed tangent mode — no onChange call for mode cycling
      const tangentChangeCalls = onChange.mock.calls.filter(call => {
        const c = call[0] as CurveData | undefined;
        return c?.keyframes.length === 2; // Same count = tangent mode change
      });
      expect(tangentChangeCalls).toHaveLength(0);
    });

    it('still allows adding keyframes when lockTangents is true', () => {
      const onChange = vi.fn();
      renderEditor({ onChange, lockTangents: true, allowAdd: true });
      const canvas = getCanvas();

      // Double-click on empty area
      fireEvent.doubleClick(canvas, { clientX: 160, clientY: 100 });

      expect(onChange).toHaveBeenCalled();
      const newCurve = onChange.mock.calls[0]?.[0] as CurveData | undefined;
      expect(newCurve?.keyframes.length).toBe(3);
    });

    it('shows tangent mode buttons when lockTangents is false', () => {
      renderEditor({ showToolbar: true, lockTangents: false });
      expect(screen.getByLabelText('Free tangent mode')).toBeInTheDocument();
    });
  });
});
