import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';

import { renderWithTheme } from '@/tests/testUtils';

import { AngleInput } from './AngleInput';
import {
  normalizeAngle,
  angleFromPointer,
  snapAngle,
  clampOrWrap,
} from './angleMath';

import '@/theme/darkTheme.css';

// ─── PointerEvent polyfill (jsdom lacks PointerEvent + capture) ───

class MockPointerEvent extends MouseEvent {
  readonly pointerId: number;
  constructor(type: string, params: PointerEventInit & MouseEventInit = {}) {
    super(type, { bubbles: true, ...params });
    this.pointerId = params.pointerId ?? 0;
  }
}
globalThis.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => true);
}

// jsdom returns a zero-size rect; give the dial a deterministic 44×44 geometry
// centered at (22, 22) so pointer offsets map to known angles.
function mockDialRect(el: HTMLElement): void {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    right: 44,
    bottom: 44,
    width: 44,
    height: 44,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

function getDial(): HTMLElement {
  return screen.getByRole('slider');
}

describe('angleMath', () => {
  describe('normalizeAngle', () => {
    it('wraps into the [0, 360) range', () => {
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(360)).toBe(0);
      expect(normalizeAngle(370)).toBe(10);
      expect(normalizeAngle(-10)).toBe(350);
      expect(normalizeAngle(-370)).toBe(350);
      expect(normalizeAngle(720)).toBe(0);
    });
  });

  describe('angleFromPointer', () => {
    it('uses the CSS convention: 0° up, clockwise', () => {
      expect(angleFromPointer(0, -1)).toBeCloseTo(0); // up
      expect(angleFromPointer(1, 0)).toBeCloseTo(90); // right
      expect(angleFromPointer(0, 1)).toBeCloseTo(180); // down
      expect(angleFromPointer(-1, 0)).toBeCloseTo(270); // left
      expect(angleFromPointer(1, -1)).toBeCloseTo(45); // up-right
    });
  });

  describe('snapAngle', () => {
    it('snaps to the nearest increment', () => {
      expect(snapAngle(87, 15)).toBe(90);
      expect(snapAngle(8, 15)).toBe(15);
      expect(snapAngle(7, 15)).toBe(0);
      expect(snapAngle(358, 15)).toBe(0); // 360 normalizes to 0
    });

    it('is a no-op for a non-positive increment', () => {
      expect(snapAngle(100, 0)).toBe(100);
      expect(snapAngle(100, -5)).toBe(100);
    });
  });

  describe('clampOrWrap', () => {
    it('wraps when the range is a full turn', () => {
      expect(clampOrWrap(370, 0, 360)).toBe(10);
      expect(clampOrWrap(-10, 0, 360)).toBe(350);
      expect(clampOrWrap(360, 0, 360)).toBe(0);
      expect(clampOrWrap(45, 0, 360)).toBe(45);
    });

    it('clamps when the range is partial', () => {
      expect(clampOrWrap(100, -90, 90)).toBe(90);
      expect(clampOrWrap(-100, -90, 90)).toBe(-90);
      expect(clampOrWrap(45, -90, 90)).toBe(45);
    });
  });
});

describe('AngleInput', () => {
  describe('Rendering', () => {
    it('renders a slider dial with angle ARIA semantics', () => {
      renderWithTheme(<AngleInput defaultValue={0} />);
      const dial = getDial();
      expect(dial).toHaveAttribute('aria-valuemin', '0');
      expect(dial).toHaveAttribute('aria-valuemax', '360');
      expect(dial).toHaveAttribute('aria-valuenow', '0');
      expect(dial).toHaveAttribute('aria-valuetext', '0°');
      expect(dial).toHaveAttribute('tabindex', '0');
    });

    it('renders the numeric input by default', () => {
      renderWithTheme(<AngleInput defaultValue={90} />);
      expect(screen.getByLabelText('Angle value')).toBeInTheDocument();
    });

    it('hides the numeric input when showInput is false', () => {
      renderWithTheme(<AngleInput defaultValue={90} showInput={false} />);
      expect(screen.queryByLabelText('Angle value')).not.toBeInTheDocument();
    });

    it('renders an optional caption', () => {
      renderWithTheme(<AngleInput label="Rotation" />);
      expect(screen.getByText('Rotation')).toBeInTheDocument();
    });

    it('places the companion before the dial for left/top placement', () => {
      renderWithTheme(<AngleInput defaultValue={0} placement="left" />);
      const input = screen.getByLabelText('Angle value');
      const dial = getDial();
      // input precedes dial in document order → Node.DOCUMENT_POSITION_FOLLOWING
      expect(
        input.compareDocumentPosition(dial) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('renders a read-only value readout when showValue and no input', () => {
      renderWithTheme(
        <AngleInput defaultValue={90} showInput={false} showValue />
      );
      expect(screen.getByText('90°')).toBeInTheDocument();
      expect(screen.queryByLabelText('Angle value')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('increments on ArrowRight / ArrowUp by step', () => {
      const onChange = vi.fn();
      renderWithTheme(<AngleInput defaultValue={0} onChange={onChange} />);
      fireEvent.keyDown(getDial(), { key: 'ArrowRight' });
      expect(onChange).toHaveBeenLastCalledWith(1);
      fireEvent.keyDown(getDial(), { key: 'ArrowUp' });
      expect(onChange).toHaveBeenLastCalledWith(2);
    });

    it('decrements with wrap-around past 0', () => {
      const onChange = vi.fn();
      renderWithTheme(<AngleInput defaultValue={0} onChange={onChange} />);
      fireEvent.keyDown(getDial(), { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenLastCalledWith(359);
    });

    it('uses largeStep for Shift+Arrow and PageUp/PageDown', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <AngleInput defaultValue={0} largeStep={15} onChange={onChange} />
      );
      fireEvent.keyDown(getDial(), { key: 'ArrowRight', shiftKey: true });
      expect(onChange).toHaveBeenLastCalledWith(15);
      fireEvent.keyDown(getDial(), { key: 'PageUp' });
      expect(onChange).toHaveBeenLastCalledWith(30);
      fireEvent.keyDown(getDial(), { key: 'PageDown' });
      expect(onChange).toHaveBeenLastCalledWith(15);
    });

    it('discrete mode advances by the snap increment on arrow keys', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <AngleInput defaultValue={0} discrete snap={30} onChange={onChange} />
      );
      fireEvent.keyDown(getDial(), { key: 'ArrowRight' });
      expect(onChange).toHaveBeenLastCalledWith(30);
      fireEvent.keyDown(getDial(), { key: 'ArrowRight' });
      expect(onChange).toHaveBeenLastCalledWith(60);
    });

    it('discrete mode snaps a drag to the snap grid', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <AngleInput defaultValue={0} discrete snap={30} onChange={onChange} />
      );
      const dial = getDial();
      mockDialRect(dial);
      // Pointer at ~61° → snapped to 60° on a 30° grid.
      fireEvent.pointerDown(dial, { clientX: 44, clientY: 10, button: 0 });
      expect(onChange).toHaveBeenLastCalledWith(60);
    });

    it('jumps to bounds with Home / End', () => {
      const onChange = vi.fn();
      renderWithTheme(<AngleInput defaultValue={120} onChange={onChange} />);
      fireEvent.keyDown(getDial(), { key: 'Home' });
      expect(onChange).toHaveBeenLastCalledWith(0);
      fireEvent.keyDown(getDial(), { key: 'End' });
      // 360 wraps to 0 on a full-turn range
      expect(onChange).toHaveBeenLastCalledWith(0);
    });

    it('ignores unrelated keys', () => {
      const onChange = vi.fn();
      renderWithTheme(<AngleInput defaultValue={0} onChange={onChange} />);
      fireEvent.keyDown(getDial(), { key: 'a' });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not change while disabled', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <AngleInput defaultValue={0} disabled onChange={onChange} />
      );
      const dial = getDial();
      expect(dial).toHaveAttribute('tabindex', '-1');
      fireEvent.keyDown(dial, { key: 'ArrowRight' });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('sets the angle from a pointer drag and commits on release', () => {
      const onChange = vi.fn();
      const onChangeComplete = vi.fn();
      renderWithTheme(
        <AngleInput
          defaultValue={0}
          onChange={onChange}
          onChangeComplete={onChangeComplete}
        />
      );
      const dial = getDial();
      mockDialRect(dial);
      // Pointer to the right of center → 90°
      fireEvent.pointerDown(dial, { clientX: 44, clientY: 22, button: 0 });
      expect(onChange).toHaveBeenLastCalledWith(90);
      expect(onChangeComplete).not.toHaveBeenCalled();
      fireEvent.pointerUp(dial, { clientX: 44, clientY: 22 });
      expect(onChangeComplete).toHaveBeenLastCalledWith(90);
    });

    it('commits the keyboard-edited value on blur', () => {
      const onChangeComplete = vi.fn();
      renderWithTheme(
        <AngleInput defaultValue={0} onChangeComplete={onChangeComplete} />
      );
      const dial = getDial();
      fireEvent.keyDown(dial, { key: 'ArrowRight' });
      expect(onChangeComplete).not.toHaveBeenCalled();
      fireEvent.blur(dial);
      expect(onChangeComplete).toHaveBeenLastCalledWith(1);
    });

    it('commits when the numeric input blurs', () => {
      const onChangeComplete = vi.fn();
      renderWithTheme(
        <AngleInput defaultValue={45} onChangeComplete={onChangeComplete} />
      );
      fireEvent.blur(screen.getByLabelText('Angle value'));
      expect(onChangeComplete).toHaveBeenLastCalledWith(45);
    });
  });

  describe('Accessibility', () => {
    it('honors an explicit aria-label on the dial and input', () => {
      renderWithTheme(<AngleInput aria-label="Sun direction" />);
      expect(screen.getByRole('slider')).toHaveAttribute(
        'aria-label',
        'Sun direction'
      );
      expect(screen.getByLabelText('Sun direction value')).toBeInTheDocument();
    });

    it('supports custom labels', () => {
      renderWithTheme(
        <AngleInput
          defaultValue={90}
          labels={{ valueText: deg => `${deg} degrees` }}
        />
      );
      expect(screen.getByRole('slider')).toHaveAttribute(
        'aria-valuetext',
        '90 degrees'
      );
    });

    it('marks the dial read-only', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <AngleInput defaultValue={0} readOnly onChange={onChange} />
      );
      const dial = getDial();
      expect(dial).toHaveAttribute('aria-readonly', 'true');
      fireEvent.keyDown(dial, { key: 'ArrowRight' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
