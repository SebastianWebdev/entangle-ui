import { describe, it, expect } from 'vitest';
import {
  computeMinimapHeight,
  computeMinimapScale,
  computeMinimapOffset,
  worldToMinimap,
  minimapToWorld,
  getViewportRectOnMinimap,
  getViewportCenterWorld,
} from './minimapCoords';

describe('computeMinimapHeight', () => {
  it('preserves aspect ratio of worldBounds', () => {
    expect(
      computeMinimapHeight(
        200,
        { x: 0, y: 0, width: 400, height: 200 },
        10,
        500
      )
    ).toBe(100);
  });

  it('clamps to maxHeight when content is too tall', () => {
    expect(
      computeMinimapHeight(
        200,
        { x: 0, y: 0, width: 100, height: 1000 },
        10,
        200
      )
    ).toBe(200);
  });

  it('clamps to minHeight when content is too thin', () => {
    expect(
      computeMinimapHeight(
        600,
        { x: 0, y: 0, width: 1000, height: 10 },
        40,
        300
      )
    ).toBe(40);
  });

  it('returns minHeight when worldBounds is zero-area', () => {
    expect(
      computeMinimapHeight(200, { x: 0, y: 0, width: 0, height: 0 }, 60, 200)
    ).toBe(60);
  });
});

describe('computeMinimapScale', () => {
  it('returns the limiting axis ratio (width)', () => {
    expect(
      computeMinimapScale(
        { x: 0, y: 0, width: 1000, height: 100 },
        { width: 200, height: 200 }
      )
    ).toBe(0.2);
  });

  it('returns the limiting axis ratio (height)', () => {
    expect(
      computeMinimapScale(
        { x: 0, y: 0, width: 100, height: 1000 },
        { width: 200, height: 200 }
      )
    ).toBe(0.2);
  });

  it('returns 1 for zero-area bounds (no-op scale)', () => {
    expect(
      computeMinimapScale(
        { x: 0, y: 0, width: 0, height: 0 },
        { width: 200, height: 200 }
      )
    ).toBe(1);
  });
});

describe('computeMinimapOffset', () => {
  it('returns zero offset when aspect ratios match', () => {
    const offset = computeMinimapOffset(
      { x: 0, y: 0, width: 400, height: 200 },
      { width: 200, height: 100 },
      0.5
    );
    expect(offset).toEqual({ x: 0, y: 0 });
  });

  it('letterboxes evenly when aspect ratios differ (wider content)', () => {
    const offset = computeMinimapOffset(
      { x: 0, y: 0, width: 1000, height: 100 },
      { width: 200, height: 200 },
      0.2
    );
    expect(offset.x).toBe(0);
    expect(offset.y).toBe(90);
  });
});

describe('worldToMinimap / minimapToWorld', () => {
  const worldBounds = { x: -100, y: -50, width: 200, height: 100 };
  const minimapSize = { width: 200, height: 100 };

  it('maps top-left of worldBounds to (0, 0)', () => {
    expect(
      worldToMinimap({ x: -100, y: -50 }, worldBounds, minimapSize)
    ).toEqual({ x: 0, y: 0 });
  });

  it('maps bottom-right of worldBounds to (width, height)', () => {
    expect(worldToMinimap({ x: 100, y: 50 }, worldBounds, minimapSize)).toEqual(
      { x: 200, y: 100 }
    );
  });

  it('round-trips world → minimap → world', () => {
    const original = { x: 25, y: -10 };
    const onMap = worldToMinimap(original, worldBounds, minimapSize);
    const back = minimapToWorld(onMap, worldBounds, minimapSize);
    expect(back.x).toBeCloseTo(original.x);
    expect(back.y).toBeCloseTo(original.y);
  });

  it('handles zero-area worldBounds by collapsing to its origin', () => {
    const zero = { x: 10, y: 20, width: 0, height: 0 };
    expect(minimapToWorld({ x: 50, y: 50 }, zero, minimapSize)).toEqual({
      x: 10,
      y: 20,
    });
  });
});

describe('getViewportRectOnMinimap', () => {
  const worldBounds = { x: 0, y: 0, width: 1000, height: 1000 };
  const minimapSize = { width: 100, height: 100 };
  const viewportSize = { width: 800, height: 600 };

  it('at zoom=1, transform={0,0}: rect starts at (0,0) and reflects viewport / world ratio', () => {
    const rect = getViewportRectOnMinimap(
      { x: 0, y: 0, zoom: 1 },
      viewportSize,
      worldBounds,
      minimapSize
    );
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.width).toBe(80);
    expect(rect.height).toBe(60);
  });

  it('zoom=2: viewport rect shrinks (showing less world content)', () => {
    const rect = getViewportRectOnMinimap(
      { x: 0, y: 0, zoom: 2 },
      viewportSize,
      worldBounds,
      minimapSize
    );
    expect(rect.width).toBe(40);
    expect(rect.height).toBe(30);
  });

  it('positive translation pans the visible rect upward / leftward', () => {
    // transform.x = -200 (pan right by 200 world px at zoom=1) → world origin
    // at minimap goes left → visible world starts at world X = 200.
    const rect = getViewportRectOnMinimap(
      { x: -200, y: -100, zoom: 1 },
      viewportSize,
      worldBounds,
      minimapSize
    );
    expect(rect.x).toBe(20);
    expect(rect.y).toBe(10);
  });
});

describe('getViewportCenterWorld', () => {
  it('returns (0,0) at zoom=1 when transform centers viewport on origin', () => {
    // viewport is 800×600; for origin to be center, transform = (400, 300)
    expect(
      getViewportCenterWorld(
        { x: 400, y: 300, zoom: 1 },
        { width: 800, height: 600 }
      )
    ).toEqual({ x: 0, y: 0 });
  });

  it('scales with zoom', () => {
    const center = getViewportCenterWorld(
      { x: 0, y: 0, zoom: 2 },
      { width: 800, height: 600 }
    );
    expect(center).toEqual({ x: 200, y: 150 });
  });

  it('falls back to zoom=1 when transform.zoom is 0 (degenerate)', () => {
    const center = getViewportCenterWorld(
      { x: 0, y: 0, zoom: 0 },
      { width: 800, height: 600 }
    );
    expect(center).toEqual({ x: 400, y: 300 });
  });
});
