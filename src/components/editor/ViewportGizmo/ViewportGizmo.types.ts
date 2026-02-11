import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

export type ViewportGizmoSize = Size;

// ─── Orientation ───

/**
 * Camera/viewport orientation as Euler angles (degrees).
 * Convention: intrinsic YXZ (heading-pitch-roll), matching Three.js default.
 */
export interface GizmoOrientation {
  /** Rotation around Y axis (heading/yaw) in degrees */
  yaw: number;
  /** Rotation around X axis (pitch) in degrees */
  pitch: number;
  /** Rotation around Z axis (roll) in degrees @default 0 */
  roll?: number;
}

/**
 * Orbital rotation delta during a drag gesture.
 * The app applies this to its camera orbit controller.
 */
export interface OrbitDelta {
  /** Yaw change in degrees (horizontal drag) */
  deltaYaw: number;
  /** Pitch change in degrees (vertical drag) */
  deltaPitch: number;
}

// ─── Axis Configuration ───

/**
 * Preset axis color conventions.
 * - `blender`: X=red, Y=green, Z=blue
 * - `unreal`: X=red, Y=green, Z=blue (same colors, Z-up)
 * - `custom`: use `axisConfig` prop
 */
export type GizmoAxisColorPreset = 'blender' | 'unreal' | 'custom';

/**
 * Up axis convention.
 * - `y-up`: Y is vertical (Three.js, Babylon, Maya)
 * - `z-up`: Z is vertical (Blender, Unreal, CAD)
 */
export type GizmoUpAxis = 'y-up' | 'z-up';

/** Custom per-axis configuration. */
export interface GizmoAxisConfig {
  /** Axis label text @default "X"/"Y"/"Z" */
  label?: string;
  /** Axis color (CSS color string) */
  color?: string;
  /** Whether this axis arm is visible @default true */
  visible?: boolean;
}

// ─── Preset Views ───

/** Named preset camera views for snap navigation. */
export type GizmoPresetView =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom';

// ─── Component Props ───

export interface ViewportGizmoBaseProps extends Omit<
  BaseComponent,
  'onChange'
> {
  /**
   * Current viewport orientation (controlled).
   * The gizmo always reflects this — it never owns orientation state.
   */
  orientation: GizmoOrientation;

  /**
   * Which axis points up.
   * @default "y-up"
   */
  upAxis?: GizmoUpAxis;

  /**
   * Axis color convention.
   * @default "blender"
   */
  axisColorPreset?: GizmoAxisColorPreset;

  /**
   * Per-axis customization [X, Y, Z].
   * Used when `axisColorPreset="custom"`.
   */
  axisConfig?: [GizmoAxisConfig, GizmoAxisConfig, GizmoAxisConfig];

  /**
   * Whether to show axis labels at arm tips.
   * @default true
   */
  showLabels?: boolean;

  /**
   * Whether to show negative axis arms (dimmed, shorter).
   * @default true
   */
  showNegativeAxes?: boolean;

  /**
   * Whether to show a thin orbit ring around the gizmo.
   * @default true
   */
  showOrbitRing?: boolean;

  /**
   * Whether to show an origin handle (home button).
   * @default true
   */
  showOriginHandle?: boolean;

  /**
   * Background style.
   * @default "subtle"
   */
  background?: 'transparent' | 'subtle' | 'solid';

  /**
   * Interaction mode.
   * @default "full"
   */
  interactionMode?: 'full' | 'snap-only' | 'orbit-only' | 'display-only';

  /**
   * Orbit speed multiplier.
   * @default 1
   */
  orbitSpeed?: number;

  /**
   * Whether to constrain pitch to [-90, 90].
   * @default true
   */
  constrainPitch?: boolean;

  /** Called continuously while the user drags to orbit. */
  onOrbit?: (delta: OrbitDelta) => void;

  /** Called when the user finishes an orbit drag. */
  onOrbitEnd?: (finalOrientation: GizmoOrientation) => void;

  /** Called when the user clicks an axis to snap to a preset view. */
  onSnapToView?: (view: GizmoPresetView) => void;

  /** Called when the user clicks a specific axis arm. */
  onAxisClick?: (axis: 'x' | 'y' | 'z', positive: boolean) => void;

  /** Called when the user clicks the origin handle. */
  onOriginClick?: () => void;

  /**
   * Gizmo diameter in pixels.
   * @default 120
   */
  diameter?: number;

  /**
   * Component size — affects label font size.
   * @default "md"
   */
  size?: ViewportGizmoSize;

  /**
   * Whether the gizmo is disabled.
   * @default false
   */
  disabled?: boolean;
}

export type ViewportGizmoProps = Prettify<ViewportGizmoBaseProps>;

// ─── Internal Types ───

/** Axis arm hit region for interaction. */
export interface GizmoHitRegion {
  type:
    | 'axis-positive'
    | 'axis-negative'
    | 'label'
    | 'origin'
    | 'ring'
    | 'none';
  axis?: 'x' | 'y' | 'z';
  distance: number;
}
