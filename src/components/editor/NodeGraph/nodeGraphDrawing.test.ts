import { describe, it, expect } from 'vitest';
import { bezierOutsideViewport } from './nodeGraphDrawing';
import type { BezierControlPoints } from './nodeGraphMath';

// All coordinates here are already in screen space (post-transform), which is
// what `bezierOutsideViewport` consumes. The viewport is treated as the rect
// [0, width] × [0, height]; the helper adds a small margin before culling.
const VIEWPORT = { width: 800, height: 600 };

function cp(points: [number, number][]): BezierControlPoints {
  const [p0, c1, c2, p3] = points;
  return {
    p0: { x: p0[0], y: p0[1] },
    c1: { x: c1[0], y: c1[1] },
    c2: { x: c2[0], y: c2[1] },
    p3: { x: p3[0], y: p3[1] },
  };
}

describe('bezierOutsideViewport', () => {
  it('keeps a curve fully inside the viewport', () => {
    const curve = cp([
      [100, 100],
      [200, 150],
      [300, 250],
      [400, 300],
    ]);
    expect(bezierOutsideViewport(curve, VIEWPORT.width, VIEWPORT.height)).toBe(
      false
    );
  });

  it('keeps a curve that straddles a viewport edge', () => {
    // Source off the left edge, target inside — the curve crosses x=0.
    const curve = cp([
      [-200, 300],
      [-50, 300],
      [100, 300],
      [250, 300],
    ]);
    expect(bezierOutsideViewport(curve, VIEWPORT.width, VIEWPORT.height)).toBe(
      false
    );
  });

  it('culls a curve entirely past the right edge', () => {
    const curve = cp([
      [1000, 300],
      [1100, 320],
      [1200, 340],
      [1300, 360],
    ]);
    expect(bezierOutsideViewport(curve, VIEWPORT.width, VIEWPORT.height)).toBe(
      true
    );
  });

  it('culls a curve entirely past the left edge', () => {
    const curve = cp([
      [-500, 300],
      [-400, 300],
      [-300, 300],
      [-200, 300],
    ]);
    expect(bezierOutsideViewport(curve, VIEWPORT.width, VIEWPORT.height)).toBe(
      true
    );
  });

  it('culls a curve entirely above and below', () => {
    const above = cp([
      [100, -300],
      [200, -250],
      [300, -200],
      [400, -150],
    ]);
    const below = cp([
      [100, 800],
      [200, 850],
      [300, 900],
      [400, 950],
    ]);
    expect(bezierOutsideViewport(above, VIEWPORT.width, VIEWPORT.height)).toBe(
      true
    );
    expect(bezierOutsideViewport(below, VIEWPORT.width, VIEWPORT.height)).toBe(
      true
    );
  });

  it('does not cull a curve whose control points bracket the viewport', () => {
    // A near-vertical curve well off the right in x is still culled, but a
    // curve whose control hull spans across the viewport must be kept even
    // when both endpoints sit outside opposite edges.
    const spanning = cp([
      [-100, 300],
      [400, 300],
      [400, 300],
      [900, 300],
    ]);
    expect(
      bezierOutsideViewport(spanning, VIEWPORT.width, VIEWPORT.height)
    ).toBe(false);
  });

  it('keeps a curve just within the cull margin', () => {
    // 20px past the right edge — inside the 32px margin, so not culled.
    const curve = cp([
      [VIEWPORT.width + 20, 300],
      [VIEWPORT.width + 20, 300],
      [VIEWPORT.width + 20, 300],
      [VIEWPORT.width + 20, 300],
    ]);
    expect(bezierOutsideViewport(curve, VIEWPORT.width, VIEWPORT.height)).toBe(
      false
    );
  });
});
