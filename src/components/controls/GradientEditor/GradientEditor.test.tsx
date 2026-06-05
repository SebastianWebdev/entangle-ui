import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';

import { renderWithTheme } from '@/tests/testUtils';

import { GradientEditor } from './GradientEditor';
import {
  addStopAt,
  createDefaultGradient,
  formatGradientCSS,
  normalizeGradient,
  parseGradientCSS,
  sortStops,
} from './gradientUtils';

import type { GradientData } from './GradientEditor.types';

import '@/theme/darkTheme.css';

// ─── PointerEvent polyfill (jsdom lacks PointerEvent) ───

class MockPointerEvent extends MouseEvent {
  readonly pointerId: number;
  constructor(type: string, params: PointerEventInit & MouseEventInit = {}) {
    super(type, { bubbles: true, ...params });
    this.pointerId = params.pointerId ?? 0;
  }
}
globalThis.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;

// Element pointer-capture is unimplemented in jsdom.
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
}

// The stops track is the shared parent of the slider handles.
function getTrackElement(): HTMLElement {
  const slider = screen.getAllByRole('slider')[0];
  const track = slider?.parentElement;
  if (!track) throw new Error('track element not found');
  return track;
}

// jsdom returns a zero-size rect; give the track a deterministic geometry so
// pointer-x maps to a known position.
function mockTrackRect(el: HTMLElement): void {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    right: 200,
    bottom: 16,
    width: 200,
    height: 16,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

const linearGradient: GradientData = {
  type: 'linear',
  angle: 90,
  stops: [
    { id: 'a', color: '#000000', position: 0 },
    { id: 'b', color: '#ffffff', position: 1 },
  ],
};

describe('gradientUtils', () => {
  describe('formatGradientCSS', () => {
    it('formats a linear gradient with angle and percentage stops', () => {
      expect(formatGradientCSS(linearGradient)).toBe(
        'linear-gradient(90deg, #000000 0%, #ffffff 100%)'
      );
    });

    it('formats a radial gradient', () => {
      expect(formatGradientCSS({ ...linearGradient, type: 'radial' })).toBe(
        'radial-gradient(circle, #000000 0%, #ffffff 100%)'
      );
    });

    it('formats a conic gradient with a starting angle', () => {
      expect(
        formatGradientCSS({ ...linearGradient, type: 'conic', angle: 45 })
      ).toBe('conic-gradient(from 45deg, #000000 0%, #ffffff 100%)');
    });

    it('orders stops by position regardless of input order', () => {
      const unordered: GradientData = {
        type: 'linear',
        angle: 0,
        stops: [
          { id: 'b', color: '#ffffff', position: 1 },
          { id: 'a', color: '#000000', position: 0 },
        ],
      };
      expect(formatGradientCSS(unordered)).toBe(
        'linear-gradient(0deg, #000000 0%, #ffffff 100%)'
      );
    });
  });

  describe('parseGradientCSS', () => {
    it('round-trips a linear gradient', () => {
      const parsed = parseGradientCSS(formatGradientCSS(linearGradient));
      expect(parsed).not.toBeNull();
      expect(parsed?.type).toBe('linear');
      expect(parsed?.angle).toBe(90);
      expect(parsed?.stops).toHaveLength(2);
      expect(parsed?.stops[0]?.position).toBe(0);
      expect(parsed?.stops[1]?.position).toBe(1);
    });

    it('parses a conic gradient with "from <angle>"', () => {
      const parsed = parseGradientCSS(
        'conic-gradient(from 120deg, red 0%, blue 100%)'
      );
      expect(parsed?.type).toBe('conic');
      expect(parsed?.angle).toBe(120);
    });

    it('parses rgb() stops without splitting on inner commas', () => {
      const parsed = parseGradientCSS(
        'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)'
      );
      expect(parsed?.stops).toHaveLength(2);
    });

    it('distributes missing positions evenly', () => {
      const parsed = parseGradientCSS(
        'linear-gradient(90deg, red, green, blue)'
      );
      expect(parsed?.stops.map(s => s.position)).toEqual([0, 0.5, 1]);
    });

    it('skips a "to right" direction keyword', () => {
      const parsed = parseGradientCSS(
        'linear-gradient(to right, #000 0%, #fff 100%)'
      );
      expect(parsed?.type).toBe('linear');
      expect(parsed?.stops).toHaveLength(2);
    });

    it('returns null for non-gradient strings', () => {
      expect(parseGradientCSS('#ff0000')).toBeNull();
      expect(parseGradientCSS('not a gradient')).toBeNull();
    });

    it('returns null when fewer than two stops are present', () => {
      expect(parseGradientCSS('linear-gradient(90deg, red 0%)')).toBeNull();
    });
  });

  describe('normalizeGradient', () => {
    it('clamps positions and sorts stops', () => {
      const result = normalizeGradient({
        type: 'linear',
        angle: 0,
        stops: [
          { id: 'b', color: '#fff', position: 1.5 },
          { id: 'a', color: '#000', position: -0.2 },
        ],
      });
      expect(result.stops[0]?.position).toBe(0);
      expect(result.stops[1]?.position).toBe(1);
      expect(result.stops[0]?.color).toBe('#000');
    });

    it('assigns ids to stops missing one', () => {
      const result = normalizeGradient({
        type: 'linear',
        angle: 0,
        stops: [
          { id: '', color: '#000', position: 0 },
          { id: '', color: '#fff', position: 1 },
        ],
      });
      expect(result.stops[0]?.id).toBeTruthy();
      expect(result.stops[0]?.id).not.toBe(result.stops[1]?.id);
    });
  });

  describe('addStopAt', () => {
    it('inserts a stop at the requested position and returns its id', () => {
      const { data, id } = addStopAt(linearGradient, 0.5);
      expect(data.stops).toHaveLength(3);
      const added = data.stops.find(s => s.id === id);
      expect(added?.position).toBe(0.5);
    });

    it('inherits the color of the nearest left stop', () => {
      const { data, id } = addStopAt(linearGradient, 0.3);
      const added = data.stops.find(s => s.id === id);
      expect(added?.color).toBe('#000000');
    });
  });

  describe('createDefaultGradient', () => {
    it('produces a two-stop black→white linear gradient', () => {
      const g = createDefaultGradient();
      expect(g.type).toBe('linear');
      expect(g.stops).toHaveLength(2);
      expect(sortStops(g.stops)[0]?.color).toBe('#000000');
    });
  });
});

describe('GradientEditor', () => {
  describe('Rendering', () => {
    it('renders the preview, CSS output, and type toggle', () => {
      renderWithTheme(
        <GradientEditor defaultValue={linearGradient} testId="ge" />
      );
      expect(screen.getByTestId('ge')).toBeInTheDocument();
      expect(screen.getByTestId('ge-preview')).toBeInTheDocument();
      expect(screen.getByTestId('ge-css')).toHaveTextContent(
        'linear-gradient(90deg, #000000 0%, #ffffff 100%)'
      );
    });

    it('renders one slider handle per stop', () => {
      renderWithTheme(<GradientEditor defaultValue={linearGradient} />);
      // Scope to the stops track — the angle control is also a slider (dial).
      expect(within(getTrackElement()).getAllByRole('slider')).toHaveLength(2);
    });

    it('renders the angle control for linear/conic but not radial', () => {
      const { rerender } = renderWithTheme(
        <GradientEditor value={linearGradient} testId="ge" />
      );
      expect(screen.getByTestId('ge-angle')).toBeInTheDocument();

      rerender(
        <GradientEditor
          value={{ ...linearGradient, type: 'radial' }}
          testId="ge"
        />
      );
      expect(screen.queryByTestId('ge-angle')).not.toBeInTheDocument();
    });

    it('renders an inline ColorPicker when colorEditor is "inline"', () => {
      renderWithTheme(
        <GradientEditor
          defaultValue={linearGradient}
          colorEditor="inline"
          testId="ge"
        />
      );
      expect(screen.getByTestId('ge-color-picker')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('adds a stop when the track is clicked (onChange + onChangeComplete)', () => {
      let latest: GradientData | null = null;
      const onChangeComplete = vi.fn();
      renderWithTheme(
        <GradientEditor
          defaultValue={linearGradient}
          onChange={next => {
            latest = next;
          }}
          onChangeComplete={onChangeComplete}
          testId="ge"
        />
      );

      // Click the bare track to add a stop.
      const trackEl = getTrackElement();
      mockTrackRect(trackEl);

      fireEvent.pointerDown(trackEl, { clientX: 100, target: trackEl });
      if (!latest) throw new Error('onChange was not called');
      const added: GradientData = latest;
      expect(added.stops).toHaveLength(3);
      expect(added.stops.some(stop => stop.position === 0.5)).toBe(true);
      expect(onChangeComplete).toHaveBeenCalled();
      // Three stops now: the original two plus the added one. Scope to the
      // track — the angle control is also a slider (dial).
      expect(within(getTrackElement()).getAllByRole('slider')).toHaveLength(3);
    });

    it('does not add a stop when the click lands on the fill overlay', () => {
      // Regression guard: the gradient fill overlay must not intercept the
      // pointer (pointerEvents: none), otherwise "click ramp to add" breaks.
      const onChange = vi.fn();
      renderWithTheme(
        <GradientEditor defaultValue={linearGradient} onChange={onChange} />
      );
      const trackEl = getTrackElement();
      const fill = trackEl.querySelector('div');
      expect(fill).not.toBeNull();
      // The fill is the first child div of the track; its computed style must
      // opt out of pointer events so the event target resolves to the track.
      expect(fill).toHaveStyle({ pointerEvents: 'none' });
    });

    it('changes gradient type via the segmented control', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <GradientEditor
          defaultValue={linearGradient}
          onChange={onChange}
          testId="ge"
        />
      );
      fireEvent.click(screen.getByText('Radial'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'radial' })
      );
    });

    it('moves a stop with arrow keys', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <GradientEditor defaultValue={linearGradient} onChange={onChange} />
      );
      const firstStop = screen.getAllByRole('slider')[0] as HTMLElement;
      fireEvent.keyDown(firstStop, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalled();
    });

    it('commits the angle on blur (VectorInput → NumberInput pattern)', () => {
      const onChangeComplete = vi.fn();
      renderWithTheme(
        <GradientEditor
          defaultValue={linearGradient}
          onChangeComplete={onChangeComplete}
          testId="ge"
        />
      );
      const angleInput = screen
        .getByTestId('ge-angle')
        .querySelector('input') as HTMLInputElement;

      // Blur is the commit boundary for the angle field, mirroring how
      // VectorInput bridges NumberInput.onBlur to its own onChangeComplete.
      fireEvent.blur(angleInput);
      expect(onChangeComplete).toHaveBeenCalled();
    });

    it('respects maxStops by not adding beyond the limit', () => {
      const onChangeComplete = vi.fn();
      renderWithTheme(
        <GradientEditor
          defaultValue={linearGradient}
          maxStops={2}
          onChangeComplete={onChangeComplete}
          testId="ge"
        />
      );
      const trackEl = getTrackElement();
      mockTrackRect(trackEl);
      fireEvent.pointerDown(trackEl, { clientX: 100, target: trackEl });
      expect(onChangeComplete).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('exposes stops as sliders with value text', () => {
      renderWithTheme(<GradientEditor defaultValue={linearGradient} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('aria-valuenow', '0');
      expect(sliders[0]).toHaveAttribute('aria-valuetext');
    });

    it('labels the copy button', () => {
      renderWithTheme(<GradientEditor defaultValue={linearGradient} />);
      expect(
        screen.getByRole('button', { name: /copy css/i })
      ).toBeInTheDocument();
    });
  });
});
