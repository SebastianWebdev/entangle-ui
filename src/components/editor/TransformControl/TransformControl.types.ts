import type { Prettify, LiteralUnion } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

/**
 * 3D vector with x/y/z components, used for position, rotation (Euler
 * degrees) and scale.
 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Coordinate space identifiers for the position/rotation rows. The default
 * options are `'local' | 'world' | 'parent'`, but the prop accepts any
 * string so consumers can supply their own (e.g. `'camera'`, `'screen'`).
 */
export type CoordinateSpace = LiteralUnion<'local' | 'world' | 'parent'>;

/**
 * Aggregate transform value covering the three subgroups rendered by
 * `TransformControl`. Rotation is expressed in Euler degrees.
 */
export interface TransformValue {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
}

/**
 * Configuration for the per-subgroup `show` flag. Omitted keys default to
 * `true`. When both `position` and `rotation` are hidden the
 * coordinate-space row is hidden too.
 */
export interface TransformShowConfig {
  position?: boolean;
  rotation?: boolean;
  scale?: boolean;
}

/**
 * Display labels used for each row and for the coordinate-space dropdown.
 */
export interface TransformLabelsConfig {
  position?: string;
  rotation?: string;
  scale?: string;
  /** Label for the coordinate-space `Select`. @default `'Space'` */
  coordinateSpace?: string;
}

/**
 * Per-subgroup precision (decimal places) forwarded to each row's
 * `VectorInput.precision`.
 */
export interface TransformPrecisionConfig {
  position?: number;
  rotation?: number;
  scale?: number;
}

/**
 * Per-subgroup step values forwarded to each row's `VectorInput.step`.
 */
export interface TransformStepConfig {
  position?: number;
  rotation?: number;
  scale?: number;
}

/**
 * Per-subgroup unit suffix forwarded to each row's `VectorInput.unit`.
 */
export interface TransformUnitsConfig {
  position?: string;
  rotation?: string;
  scale?: string;
}

/**
 * Coordinate-space option as accepted by the `coordinateSpaceOptions`
 * prop — the same shape used by `Select`.
 */
export interface CoordinateSpaceOption {
  value: string;
  label: string;
}

export interface TransformControlBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Current transform value (controlled). */
  value?: TransformValue;

  /** Default transform value (uncontrolled). */
  defaultValue?: TransformValue;

  /**
   * Called when any axis of any subgroup changes. The full
   * `TransformValue` is reported every time — even though only one of
   * the three subgroups was edited.
   */
  onChange?: (next: TransformValue) => void;

  /** Coordinate space for position / rotation (controlled). */
  coordinateSpace?: CoordinateSpace;

  /** Default coordinate space (uncontrolled). @default `'local'` */
  defaultCoordinateSpace?: CoordinateSpace;

  /** Called when the coordinate-space dropdown changes. */
  onCoordinateSpaceChange?: (next: CoordinateSpace) => void;

  /**
   * Available coordinate-space options. When omitted, defaults to the
   * three built-in choices: `local`, `world`, `parent`.
   */
  coordinateSpaceOptions?: CoordinateSpaceOption[];

  /**
   * Whether the scale axes are linked (uniform scale) — controlled.
   * When linked, editing any axis sets all three to the same value.
   */
  linkedScale?: boolean;

  /** Default linked-scale state (uncontrolled). @default `true` */
  defaultLinkedScale?: boolean;

  /** Called when the link-scale toggle is clicked. */
  onLinkedScaleChange?: (linked: boolean) => void;

  /**
   * Which subgroups to show. By default all three are visible. Hiding
   * both `position` and `rotation` also hides the coordinate-space row.
   */
  show?: TransformShowConfig;

  /**
   * Display labels for each subgroup and for the coordinate-space
   * select. Defaults: `'Position'`, `'Rotation'`, `'Scale'`, `'Space'`.
   */
  labels?: TransformLabelsConfig;

  /**
   * Number formatting per row, forwarded to each `VectorInput.precision`.
   * Defaults: `{ position: 3, rotation: 1, scale: 3 }`.
   */
  precision?: TransformPrecisionConfig;

  /**
   * Step values per row, forwarded to each `VectorInput.step`.
   * Defaults: `{ position: 0.1, rotation: 1, scale: 0.01 }`.
   */
  step?: TransformStepConfig;

  /**
   * Units appended to each axis input.
   * Defaults: `{ position: 'm', rotation: '°', scale: '' }`.
   */
  units?: TransformUnitsConfig;

  /**
   * Size for the underlying `VectorInput` and `Select` controls.
   * @default `'sm'`
   */
  size?: Size;

  /** Disable all interactions. */
  disabled?: boolean;

  /**
   * When `true`, render a reset button next to each row that resets that
   * row's value (position/rotation → `(0,0,0)`, scale → `(1,1,1)`).
   * @default `false`
   */
  showReset?: boolean;
}

export type TransformControlProps = Prettify<TransformControlBaseProps>;
