import { describe, it, expect } from 'vitest';
import {
  viewSpan,
  framesPerPixel,
  frameToX,
  xToFrame,
  snapFrame,
  clamp,
  trackTop,
  yToTrackIndex,
  framesToTimecode,
  valueToY,
  yToValue,
  autoValueRange,
  resolveLoop,
} from './timelineCoords';

const VIEW = { startFrame: 0, endFrame: 100 };

describe('timelineCoords', () => {
  describe('viewSpan', () => {
    it('returns the frame span', () => {
      expect(viewSpan({ startFrame: 10, endFrame: 60 })).toBe(50);
    });
    it('guards against zero/negative spans', () => {
      expect(viewSpan({ startFrame: 5, endFrame: 5 })).toBeGreaterThan(0);
      expect(viewSpan({ startFrame: 10, endFrame: 0 })).toBeGreaterThan(0);
    });
  });

  describe('framesPerPixel', () => {
    it('divides span by width', () => {
      expect(framesPerPixel(VIEW, 200)).toBe(0.5);
    });
    it('falls back to span when width <= 0', () => {
      expect(framesPerPixel(VIEW, 0)).toBe(100);
    });
  });

  describe('frameToX / xToFrame', () => {
    it('maps frames to pixels across the width', () => {
      expect(frameToX(0, VIEW, 200)).toBe(0);
      expect(frameToX(100, VIEW, 200)).toBe(200);
      expect(frameToX(50, VIEW, 200)).toBe(100);
    });
    it('round-trips', () => {
      const x = frameToX(37, VIEW, 640);
      expect(xToFrame(x, VIEW, 640)).toBeCloseTo(37);
    });
    it('respects a non-zero start frame', () => {
      const view = { startFrame: 20, endFrame: 120 };
      expect(frameToX(20, view, 100)).toBe(0);
      expect(frameToX(120, view, 100)).toBe(100);
    });
    it('xToFrame returns startFrame when width <= 0', () => {
      expect(xToFrame(10, VIEW, 0)).toBe(0);
    });
  });

  describe('snapFrame', () => {
    it('snaps to whole frames when true', () => {
      expect(snapFrame(12.4, true)).toBe(12);
      expect(snapFrame(12.6, true)).toBe(13);
    });
    it('snaps to an N-frame grid', () => {
      expect(snapFrame(13, 5)).toBe(15);
      expect(snapFrame(12, 5)).toBe(10);
    });
    it('does not snap when false', () => {
      expect(snapFrame(12.4, false)).toBe(12.4);
    });
  });

  describe('clamp', () => {
    it('clamps to range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(11, 0, 10)).toBe(10);
    });
  });

  describe('trackTop / yToTrackIndex', () => {
    it('computes row top with scroll', () => {
      expect(trackTop(0, 28, 0)).toBe(0);
      expect(trackTop(2, 28, 0)).toBe(56);
      expect(trackTop(2, 28, 10)).toBe(46);
    });
    it('inverts to a row index', () => {
      expect(yToTrackIndex(0, 28, 0)).toBe(0);
      expect(yToTrackIndex(56, 28, 0)).toBe(2);
      expect(yToTrackIndex(46, 28, 10)).toBe(2);
    });
    it('guards zero row height', () => {
      expect(yToTrackIndex(100, 0, 0)).toBe(0);
    });
  });

  describe('framesToTimecode', () => {
    it('formats zero', () => {
      expect(framesToTimecode(0, 30)).toBe('00:00:00:00');
    });
    it('rolls frames into seconds at fps', () => {
      expect(framesToTimecode(30, 30)).toBe('00:00:01:00');
      expect(framesToTimecode(45, 30)).toBe('00:00:01:15');
    });
    it('rolls into minutes and hours', () => {
      expect(framesToTimecode(30 * 60, 30)).toBe('00:01:00:00');
      expect(framesToTimecode(30 * 3600, 30)).toBe('01:00:00:00');
    });
    it('clamps negatives to zero', () => {
      expect(framesToTimecode(-10, 30)).toBe('00:00:00:00');
    });
    it('falls back to 30 fps when fps is invalid', () => {
      expect(framesToTimecode(30, 0)).toBe('00:00:01:00');
    });
  });

  describe('value axis (graph mode)', () => {
    it('maps the value range to the row, top value up', () => {
      // range [0,1], rowTop 0, rowH 20 -> inset 4, usable 12
      expect(valueToY(1, [0, 1], 0, 20)).toBe(4);
      expect(valueToY(0, [0, 1], 0, 20)).toBe(16);
      expect(valueToY(0.5, [0, 1], 0, 20)).toBe(10);
    });

    it('yToValue inverts valueToY', () => {
      const y = valueToY(0.3, [0, 2], 10, 40);
      expect(yToValue(y, [0, 2], 10, 40)).toBeCloseTo(0.3);
    });

    it('autoValueRange pads min/max, handles single value + empty', () => {
      expect(autoValueRange([{ y: 0 }, { y: 10 }])).toEqual([-1, 11]);
      expect(autoValueRange([{ y: 5 }])).toEqual([4, 6]);
      expect(autoValueRange([])).toEqual([0, 1]);
    });
  });

  describe('resolveLoop', () => {
    it('resolves true / object / falsey', () => {
      expect(resolveLoop(true, 0, 100)).toEqual({
        startFrame: 0,
        endFrame: 100,
      });
      expect(resolveLoop({ startFrame: 10, endFrame: 20 }, 0, 100)).toEqual({
        startFrame: 10,
        endFrame: 20,
      });
      expect(resolveLoop(false, 0, 100)).toBeNull();
      expect(resolveLoop(undefined, 0, 100)).toBeNull();
    });
  });
});
