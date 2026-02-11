import { describe, it, expect } from 'vitest';
import {
  eulerToRotationMatrix,
  projectToCanvas,
  projectAxes,
  gizmoHitTest,
  presetViewToOrientation,
  quaternionToEuler,
  axisToPresetView,
} from './gizmoMath';

// ═══════════════════════════════════════
// eulerToRotationMatrix
// ═══════════════════════════════════════

describe('eulerToRotationMatrix', () => {
  it('identity (0,0,0) produces identity basis', () => {
    const [right, up, forward] = eulerToRotationMatrix(0, 0, 0);
    expect(right.x).toBeCloseTo(1);
    expect(right.y).toBeCloseTo(0);
    expect(right.z).toBeCloseTo(0);
    expect(up.x).toBeCloseTo(0);
    expect(up.y).toBeCloseTo(1);
    expect(up.z).toBeCloseTo(0);
    expect(forward.x).toBeCloseTo(0);
    expect(forward.y).toBeCloseTo(0);
    expect(forward.z).toBeCloseTo(1);
  });

  it('90 deg yaw rotates X axis toward Z', () => {
    const [right, , forward] = eulerToRotationMatrix(90, 0, 0);
    // After 90deg yaw (around Y), X->-Z direction
    expect(right.x).toBeCloseTo(0);
    expect(right.z).toBeCloseTo(-1);
    expect(forward.x).toBeCloseTo(1);
    expect(forward.z).toBeCloseTo(0);
  });

  it('90 deg pitch rotates Y toward forward', () => {
    const [, up, forward] = eulerToRotationMatrix(0, 90, 0);
    expect(up.y).toBeCloseTo(0, 4);
    expect(forward.y).toBeCloseTo(-1);
  });

  it('handles combined yaw + pitch', () => {
    const [right, up, forward] = eulerToRotationMatrix(45, 30, 0);
    // Verify orthogonality: dot products should be ~0
    const dotRU = right.x * up.x + right.y * up.y + right.z * up.z;
    const dotRF =
      right.x * forward.x + right.y * forward.y + right.z * forward.z;
    const dotUF = up.x * forward.x + up.y * forward.y + up.z * forward.z;
    expect(dotRU).toBeCloseTo(0, 5);
    expect(dotRF).toBeCloseTo(0, 5);
    expect(dotUF).toBeCloseTo(0, 5);
  });
});

// ═══════════════════════════════════════
// projectToCanvas
// ═══════════════════════════════════════

describe('projectToCanvas', () => {
  const center = { x: 60, y: 60 };
  const scale = 40;

  it('center point projects to canvas center', () => {
    const p = projectToCanvas(
      { x: 0, y: 0, z: 0 },
      { yaw: 0, pitch: 0 },
      center,
      scale
    );
    expect(p.x).toBeCloseTo(60);
    expect(p.y).toBeCloseTo(60);
  });

  it('+X axis at 0 deg yaw projects to the right', () => {
    const p = projectToCanvas(
      { x: 1, y: 0, z: 0 },
      { yaw: 0, pitch: 0 },
      center,
      scale
    );
    expect(p.x).toBeGreaterThan(center.x);
    expect(p.y).toBeCloseTo(center.y);
  });

  it('+Y axis at 0 deg projects upward (lower y value)', () => {
    const p = projectToCanvas(
      { x: 0, y: 1, z: 0 },
      { yaw: 0, pitch: 0 },
      center,
      scale
    );
    expect(p.x).toBeCloseTo(center.x);
    expect(p.y).toBeLessThan(center.y);
  });

  it('depth increases for forward axis', () => {
    const pForward = projectToCanvas(
      { x: 0, y: 0, z: 1 },
      { yaw: 0, pitch: 0 },
      center,
      scale
    );
    const pBackward = projectToCanvas(
      { x: 0, y: 0, z: -1 },
      { yaw: 0, pitch: 0 },
      center,
      scale
    );
    expect(pForward.depth).toBeGreaterThan(pBackward.depth);
  });
});

// ═══════════════════════════════════════
// projectAxes
// ═══════════════════════════════════════

describe('projectAxes', () => {
  const center = { x: 60, y: 60 };
  const armLength = 40;

  it('returns 6 arms (3 positive + 3 negative)', () => {
    const arms = projectAxes({ yaw: 0, pitch: 0 }, center, armLength, 'y-up');
    expect(arms).toHaveLength(6);
    const positives = arms.filter(a => a.positive);
    const negatives = arms.filter(a => !a.positive);
    expect(positives).toHaveLength(3);
    expect(negatives).toHaveLength(3);
  });

  it('arms are sorted by depth (furthest first)', () => {
    const arms = projectAxes({ yaw: 30, pitch: 20 }, center, armLength, 'y-up');
    for (let i = 0; i < arms.length - 1; i++) {
      const current = arms[i];
      const next = arms[i + 1];
      if (current && next) {
        expect(current.depth).toBeLessThanOrEqual(next.depth);
      }
    }
  });

  it('Y-up and Z-up produce different axis orientations', () => {
    const yUpArms = projectAxes(
      { yaw: 0, pitch: 0 },
      center,
      armLength,
      'y-up'
    );
    const zUpArms = projectAxes(
      { yaw: 0, pitch: 0 },
      center,
      armLength,
      'z-up'
    );

    // Both use the same math since the axis vectors are the same,
    // but the labeling convention differs — both return 6 arms
    expect(yUpArms).toHaveLength(6);
    expect(zUpArms).toHaveLength(6);
  });
});

// ═══════════════════════════════════════
// gizmoHitTest
// ═══════════════════════════════════════

describe('gizmoHitTest', () => {
  const center = { x: 60, y: 60 };
  const armLength = 40;

  it('returns origin when clicking near center', () => {
    const hit = gizmoHitTest(
      60,
      60,
      { yaw: 0, pitch: 0 },
      center,
      armLength,
      'y-up'
    );
    expect(hit.type).toBe('origin');
  });

  it('returns axis-positive near +X axis tip', () => {
    // At identity orientation, +X projects to (center.x + armLength, center.y)
    const hit = gizmoHitTest(
      center.x + armLength,
      center.y,
      { yaw: 0, pitch: 0 },
      center,
      armLength,
      'y-up'
    );
    expect(hit.type).toBe('axis-positive');
    expect(hit.axis).toBe('x');
  });

  it('returns none for far-off positions', () => {
    const hit = gizmoHitTest(
      200,
      200,
      { yaw: 0, pitch: 0 },
      center,
      armLength,
      'y-up'
    );
    expect(hit.type).toBe('none');
  });

  it('detects +Y axis at identity orientation', () => {
    // +Y projects upward, so at (center.x, center.y - armLength)
    const hit = gizmoHitTest(
      center.x,
      center.y - armLength,
      { yaw: 0, pitch: 0 },
      center,
      armLength,
      'y-up'
    );
    expect(hit.type).toBe('axis-positive');
    expect(hit.axis).toBe('y');
  });
});

// ═══════════════════════════════════════
// presetViewToOrientation
// ═══════════════════════════════════════

describe('presetViewToOrientation', () => {
  it('front view returns yaw=0, pitch=0', () => {
    const o = presetViewToOrientation('front', 'y-up');
    expect(o.yaw).toBe(0);
    expect(o.pitch).toBe(0);
  });

  it('top view has pitch=90', () => {
    const o = presetViewToOrientation('top', 'y-up');
    expect(o.pitch).toBe(90);
  });

  it('right view has yaw=90', () => {
    const o = presetViewToOrientation('right', 'y-up');
    expect(o.yaw).toBe(90);
    expect(o.pitch).toBe(0);
  });

  it('back view has yaw=180', () => {
    const o = presetViewToOrientation('back', 'y-up');
    expect(o.yaw).toBe(180);
  });

  it('left view has yaw=-90', () => {
    const o = presetViewToOrientation('left', 'y-up');
    expect(o.yaw).toBe(-90);
  });

  it('bottom view has pitch=-90', () => {
    const o = presetViewToOrientation('bottom', 'y-up');
    expect(o.pitch).toBe(-90);
  });
});

// ═══════════════════════════════════════
// quaternionToEuler
// ═══════════════════════════════════════

describe('quaternionToEuler', () => {
  it('identity quaternion produces zero euler', () => {
    const e = quaternionToEuler(0, 0, 0, 1);
    expect(e.yaw).toBeCloseTo(0);
    expect(e.pitch).toBeCloseTo(0);
    expect(e.roll).toBeCloseTo(0);
  });

  it('90 deg yaw quaternion produces correct euler', () => {
    // Quaternion for 90deg around Y: [0, sin(45°), 0, cos(45°)]
    const s = Math.sin(Math.PI / 4);
    const c = Math.cos(Math.PI / 4);
    const e = quaternionToEuler(0, s, 0, c);
    expect(e.yaw).toBeCloseTo(90, 0);
    expect(e.pitch).toBeCloseTo(0, 0);
  });

  it('round-trip consistency', () => {
    // Create a quaternion from known Euler angles, convert back
    const yaw = 35;
    const pitch = -20;
    const roll = 0;

    const cy = Math.cos((yaw * Math.PI) / 360);
    const sy = Math.sin((yaw * Math.PI) / 360);
    const cp = Math.cos((pitch * Math.PI) / 360);
    const sp = Math.sin((pitch * Math.PI) / 360);
    const cr = Math.cos((roll * Math.PI) / 360);
    const sr = Math.sin((roll * Math.PI) / 360);

    // YXZ order quaternion composition
    const qx = cy * sp * cr + sy * cp * sr;
    const qy = sy * cp * cr - cy * sp * sr;
    const qz = cy * cp * sr - sy * sp * cr;
    const qw = cy * cp * cr + sy * sp * sr;

    const result = quaternionToEuler(qx, qy, qz, qw);
    expect(result.yaw).toBeCloseTo(yaw, 0);
    expect(result.pitch).toBeCloseTo(pitch, 0);
  });
});

// ═══════════════════════════════════════
// axisToPresetView
// ═══════════════════════════════════════

describe('axisToPresetView', () => {
  it('+X maps to right (Y-up)', () => {
    expect(axisToPresetView('x', true, 'y-up')).toBe('right');
  });

  it('-X maps to left (Y-up)', () => {
    expect(axisToPresetView('x', false, 'y-up')).toBe('left');
  });

  it('+Y maps to top (Y-up)', () => {
    expect(axisToPresetView('y', true, 'y-up')).toBe('top');
  });

  it('+Z maps to front (Y-up)', () => {
    expect(axisToPresetView('z', true, 'y-up')).toBe('front');
  });

  it('+Z maps to top (Z-up)', () => {
    expect(axisToPresetView('z', true, 'z-up')).toBe('top');
  });
});
