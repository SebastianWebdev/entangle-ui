import type { GizmoOrientation, GizmoPresetView, GizmoUpAxis, GizmoHitRegion } from './ViewportGizmo.types';

// ─── Vector Type ───

/** 3D vector */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// ─── Constants ───

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

// ─── Euler → Rotation Matrix ───

/**
 * Build a 3×3 rotation matrix from Euler angles (YXZ intrinsic order).
 * Matches Three.js default Euler order.
 *
 * @param yaw  - Y-axis rotation in degrees
 * @param pitch - X-axis rotation in degrees
 * @param roll  - Z-axis rotation in degrees
 * @returns [right, up, forward] basis vectors (columns of rotation matrix)
 */
export function eulerToRotationMatrix(
  yaw: number,
  pitch: number,
  roll: number = 0
): [Vec3, Vec3, Vec3] {
  const cy = Math.cos(yaw * DEG2RAD);
  const sy = Math.sin(yaw * DEG2RAD);
  const cp = Math.cos(pitch * DEG2RAD);
  const sp = Math.sin(pitch * DEG2RAD);
  const cr = Math.cos(roll * DEG2RAD);
  const sr = Math.sin(roll * DEG2RAD);

  // YXZ rotation: R = Ry * Rx * Rz
  // Column 0 (right vector)
  const r00 = cy * cr + sy * sp * sr;
  const r10 = cp * sr;
  const r20 = -sy * cr + cy * sp * sr;

  // Column 1 (up vector)
  const r01 = -cy * sr + sy * sp * cr;
  const r11 = cp * cr;
  const r21 = sy * sr + cy * sp * cr;

  // Column 2 (forward vector)
  const r02 = sy * cp;
  const r12 = -sp;
  const r22 = cy * cp;

  return [
    { x: r00, y: r10, z: r20 }, // right
    { x: r01, y: r11, z: r21 }, // up
    { x: r02, y: r12, z: r22 }, // forward
  ];
}

// ─── 3D → 2D Projection ───

/**
 * Project a 3D point to 2D canvas coordinates using orthographic projection.
 *
 * @param point   - 3D point to project
 * @param orientation - Camera orientation
 * @param center  - Canvas center in pixels
 * @param scale   - Pixels per unit
 * @returns Projected position { x, y, depth }
 */
export function projectToCanvas(
  point: Vec3,
  orientation: GizmoOrientation,
  center: { x: number; y: number },
  scale: number
): { x: number; y: number; depth: number } {
  const [right, up, forward] = eulerToRotationMatrix(
    orientation.yaw,
    orientation.pitch,
    orientation.roll ?? 0
  );

  // Project point onto camera basis (view space)
  const viewX = point.x * right.x + point.y * right.y + point.z * right.z;
  const viewY = point.x * up.x + point.y * up.y + point.z * up.z;
  const viewZ = point.x * forward.x + point.y * forward.y + point.z * forward.z;

  return {
    x: center.x + viewX * scale,
    y: center.y - viewY * scale, // canvas Y is flipped
    depth: viewZ,
  };
}

/** Projected axis arm data */
export interface ProjectedArm {
  axis: 'x' | 'y' | 'z';
  positive: boolean;
  screenX: number;
  screenY: number;
  depth: number;
}

/**
 * Get all 6 axis arm endpoints projected to 2D, sorted by depth (furthest first).
 */
export function projectAxes(
  orientation: GizmoOrientation,
  center: { x: number; y: number },
  armLength: number,
  upAxis: GizmoUpAxis
): ProjectedArm[] {
  const axes: Vec3[] =
    upAxis === 'z-up'
      ? [
          { x: 1, y: 0, z: 0 }, // X
          { x: 0, y: 1, z: 0 }, // Y
          { x: 0, y: 0, z: 1 }, // Z (up)
        ]
      : [
          { x: 1, y: 0, z: 0 }, // X
          { x: 0, y: 1, z: 0 }, // Y (up)
          { x: 0, y: 0, z: 1 }, // Z
        ];

  const axisNames: Array<'x' | 'y' | 'z'> = ['x', 'y', 'z'];
  const arms: ProjectedArm[] = [];

  for (let i = 0; i < 3; i++) {
    const ax = axes[i];
    const name = axisNames[i];
    if (!ax || !name) continue;

    // Positive arm
    const pos = projectToCanvas(
      { x: ax.x, y: ax.y, z: ax.z },
      orientation,
      center,
      armLength
    );
    arms.push({
      axis: name,
      positive: true,
      screenX: pos.x,
      screenY: pos.y,
      depth: pos.depth,
    });

    // Negative arm
    const neg = projectToCanvas(
      { x: -ax.x, y: -ax.y, z: -ax.z },
      orientation,
      center,
      armLength * 0.4
    );
    arms.push({
      axis: name,
      positive: false,
      screenX: neg.x,
      screenY: neg.y,
      depth: neg.depth,
    });
  }

  // Sort by depth — furthest first (painter's algorithm)
  arms.sort((a, b) => a.depth - b.depth);

  return arms;
}

// ─── Hit Testing ───

function distPointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);

  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

/**
 * Hit test a screen position against the gizmo geometry.
 */
export function gizmoHitTest(
  px: number,
  py: number,
  orientation: GizmoOrientation,
  center: { x: number; y: number },
  armLength: number,
  upAxis: GizmoUpAxis,
  tolerancePx: number = 12,
  originRadius: number = 6
): GizmoHitRegion {
  // Test origin handle first
  const originDist = Math.sqrt((px - center.x) ** 2 + (py - center.y) ** 2);
  if (originDist <= originRadius + tolerancePx * 0.5) {
    return { type: 'origin', distance: originDist };
  }

  const arms = projectAxes(orientation, center, armLength, upAxis);
  let closest: GizmoHitRegion = { type: 'none', distance: Infinity };

  for (const arm of arms) {
    // Check tip first (label / axis tip)
    const tipDist = Math.sqrt(
      (px - arm.screenX) ** 2 + (py - arm.screenY) ** 2
    );

    if (tipDist <= tolerancePx) {
      const hitType = arm.positive ? 'axis-positive' : 'axis-negative';
      if (tipDist < closest.distance) {
        closest = { type: hitType, axis: arm.axis, distance: tipDist };
      }
    }

    // Check arm line segment
    const segDist = distPointToSegment(
      px, py,
      center.x, center.y,
      arm.screenX, arm.screenY
    );
    if (segDist <= tolerancePx * 0.7 && segDist < closest.distance) {
      const hitType = arm.positive ? 'axis-positive' : 'axis-negative';
      closest = { type: hitType, axis: arm.axis, distance: segDist };
    }
  }

  // Check orbit ring
  const ringDist = Math.abs(originDist - armLength * 1.1);
  if (ringDist <= tolerancePx * 0.5 && ringDist < closest.distance) {
    return { type: 'ring', distance: ringDist };
  }

  return closest;
}

// ─── Preset Views ───

/**
 * Convert a preset view name to Euler angles.
 */
export function presetViewToOrientation(
  view: GizmoPresetView,
  upAxis: GizmoUpAxis
): GizmoOrientation {
  if (upAxis === 'y-up') {
    switch (view) {
      case 'front':  return { yaw: 0,    pitch: 0 };
      case 'back':   return { yaw: 180,  pitch: 0 };
      case 'right':  return { yaw: 90,   pitch: 0 };
      case 'left':   return { yaw: -90,  pitch: 0 };
      case 'top':    return { yaw: 0,    pitch: 90 };
      case 'bottom': return { yaw: 0,    pitch: -90 };
    }
  }

  // Z-up
  switch (view) {
    case 'front':  return { yaw: 0,    pitch: 0 };
    case 'back':   return { yaw: 180,  pitch: 0 };
    case 'right':  return { yaw: 90,   pitch: 0 };
    case 'left':   return { yaw: -90,  pitch: 0 };
    case 'top':    return { yaw: 0,    pitch: 90 };
    case 'bottom': return { yaw: 0,    pitch: -90 };
  }
}

// ─── Quaternion ↔ Euler ───

/**
 * Convert quaternion [x, y, z, w] to Euler representation (YXZ order, degrees).
 * Utility for Three.js integration where `camera.quaternion` is available.
 */
export function quaternionToEuler(
  qx: number,
  qy: number,
  qz: number,
  qw: number
): GizmoOrientation {
  // YXZ intrinsic rotation decomposition
  // Matrix from quaternion
  const xx = qx * qx;
  const yy = qy * qy;
  const zz = qz * qz;
  const xy = qx * qy;
  const xz = qx * qz;
  const yz = qy * qz;
  const wx = qw * qx;
  const wy = qw * qy;
  const wz = qw * qz;

  const m11 = 1 - 2 * (yy + zz);
  const m13 = 2 * (xz + wy);
  const m21 = 2 * (xy + wz);
  const m22 = 1 - 2 * (xx + zz);
  const m23 = 2 * (yz - wx);
  const m31 = 2 * (xz - wy);
  const m33 = 1 - 2 * (xx + yy);

  // YXZ order extraction
  const pitch = Math.asin(-Math.max(-1, Math.min(1, m23)));
  let yaw: number;
  let roll: number;

  if (Math.abs(m23) < 0.9999) {
    yaw = Math.atan2(m13, m33);
    roll = Math.atan2(m21, m22);
  } else {
    yaw = Math.atan2(-m31, m11);
    roll = 0;
  }

  return {
    yaw: yaw * RAD2DEG,
    pitch: pitch * RAD2DEG,
    roll: roll * RAD2DEG,
  };
}

/**
 * Map an axis tip click to the corresponding preset view.
 */
export function axisToPresetView(
  axis: 'x' | 'y' | 'z',
  positive: boolean,
  upAxis: GizmoUpAxis
): GizmoPresetView | null {
  if (upAxis === 'y-up') {
    switch (axis) {
      case 'x': return positive ? 'right' : 'left';
      case 'y': return positive ? 'top' : 'bottom';
      case 'z': return positive ? 'front' : 'back';
    }
  }

  // Z-up
  switch (axis) {
    case 'x': return positive ? 'right' : 'left';
    case 'y': return positive ? 'front' : 'back';
    case 'z': return positive ? 'top' : 'bottom';
  }
}
