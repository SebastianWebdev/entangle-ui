export { ViewportGizmo } from './ViewportGizmo';

export type {
  ViewportGizmoProps,
  ViewportGizmoSize,
  GizmoOrientation,
  GizmoAxisColorPreset,
  GizmoUpAxis,
  GizmoAxisConfig,
  GizmoPresetView,
  OrbitDelta,
  GizmoHitRegion,
} from './ViewportGizmo.types';

export {
  eulerToRotationMatrix,
  projectToCanvas,
  projectAxes,
  gizmoHitTest,
  presetViewToOrientation,
  quaternionToEuler,
  axisToPresetView,
} from './gizmoMath';

export type { Vec3, ProjectedArm } from './gizmoMath';
