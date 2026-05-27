import { describe, it, expect } from 'vitest';
import { advancePlayback } from './useTimelinePlayback';

const range = { startFrame: 0, endFrame: 48 };

describe('advancePlayback', () => {
  it('advances by dt * fps frames', () => {
    expect(advancePlayback(0, 1, 24, range, null)).toEqual({
      frame: 24,
      ended: false,
    });
    expect(advancePlayback(10, 0.5, 24, range, null).frame).toBe(22);
  });

  it('stops at the range end without a loop', () => {
    expect(advancePlayback(40, 1, 24, range, null)).toEqual({
      frame: 48,
      ended: true,
    });
    expect(advancePlayback(48, 0.1, 24, range, null)).toEqual({
      frame: 48,
      ended: true,
    });
  });

  it('wraps within a whole-range loop', () => {
    const loop = { startFrame: 0, endFrame: 24 };
    const r = advancePlayback(23, 1, 24, range, loop); // 47 -> 47 % 24
    expect(r.ended).toBe(false);
    expect(r.frame).toBeCloseTo(23);
  });

  it('wraps within a sub-range loop preserving the offset', () => {
    const loop = { startFrame: 12, endFrame: 24 }; // span 12
    const r = advancePlayback(23, 1, 24, range, loop); // 47 -> 12 + ((47-12) % 12)
    expect(r.frame).toBeCloseTo(23);
    expect(r.ended).toBe(false);
  });

  it('treats negative dt / fps as no movement', () => {
    expect(advancePlayback(10, -1, 24, range, null).frame).toBe(10);
    expect(advancePlayback(10, 1, -5, range, null).frame).toBe(10);
  });
});
