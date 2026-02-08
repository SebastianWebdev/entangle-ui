import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

export type VectorInputSize = Size;

/**
 * Number of components in the vector.
 */
export type VectorDimension = 2 | 3 | 4;

/**
 * Axis label preset configurations.
 * - `xyz`: X, Y, Z, W — position, rotation, scale
 * - `rgba`: R, G, B, A — color channels
 * - `uvw`: U, V, W — texture coordinates
 * - `custom`: use `axisLabels` prop
 */
export type VectorLabelPreset = 'xyz' | 'rgba' | 'uvw' | 'custom';

/**
 * Color coding preset for axis labels.
 * - `spatial`: X=red, Y=green, Z=blue, W=purple (standard 3D convention)
 * - `color`: R=red, G=green, B=blue, A=white
 * - `none`: all labels use default text color
 * - `custom`: use `axisColors` prop
 */
export type VectorColorPreset = 'spatial' | 'color' | 'none' | 'custom';

export interface VectorInputBaseProps
  extends Omit<BaseComponent, 'onChange' | 'value' | 'defaultValue'> {
  /**
   * Current vector value (controlled).
   * Array length must match `dimension`.
   */
  value?: number[];

  /**
   * Default vector value (uncontrolled).
   */
  defaultValue?: number[];

  /**
   * Number of vector components.
   * @default 3
   */
  dimension?: VectorDimension;

  /**
   * Axis label preset.
   * @default "xyz"
   */
  labelPreset?: VectorLabelPreset;

  /**
   * Custom axis labels (when labelPreset is "custom").
   * Array length must match `dimension`.
   */
  axisLabels?: string[];

  /**
   * Color coding for axis labels.
   * @default "spatial"
   */
  colorPreset?: VectorColorPreset;

  /**
   * Custom axis colors (when colorPreset is "custom").
   * Array of CSS color strings, length must match `dimension`.
   */
  axisColors?: string[];

  /**
   * Minimum allowed value (applies to all axes).
   */
  min?: number;

  /**
   * Maximum allowed value (applies to all axes).
   */
  max?: number;

  /**
   * Step size for value increments.
   * @default 1
   */
  step?: number;

  /**
   * Step size when Shift is held (precision mode).
   */
  precisionStep?: number;

  /**
   * Step size when Ctrl is held (large steps).
   */
  largeStep?: number;

  /**
   * Number of decimal places.
   * @default 2
   */
  precision?: number;

  /**
   * Unit suffix displayed in each input (e.g., "px", "deg", "%").
   */
  unit?: string;

  /**
   * Component size using standard library sizing.
   * @default "md"
   */
  size?: VectorInputSize;

  /**
   * Label displayed above the vector input.
   */
  label?: string;

  /**
   * Helper text displayed below.
   */
  helperText?: string;

  /**
   * Error state.
   * @default false
   */
  error?: boolean;

  /**
   * Error message.
   */
  errorMessage?: string;

  /**
   * Whether the vector input is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to show the lock/link proportions toggle.
   * @default false
   */
  showLink?: boolean;

  /**
   * Whether axes are linked by default.
   * @default false
   */
  defaultLinked?: boolean;

  /**
   * Whether axes are linked (controlled).
   */
  linked?: boolean;

  /**
   * Callback when linked state changes.
   */
  onLinkedChange?: (linked: boolean) => void;

  /**
   * Layout direction.
   * @default "row"
   */
  direction?: 'row' | 'column';

  /**
   * Gap between axis inputs in pixels.
   * @default 2
   */
  gap?: number;

  /**
   * Callback when any axis value changes.
   * @param value - Complete vector array with the changed axis.
   * @param axisIndex - Which axis changed (0-based).
   */
  onChange?: (value: number[], axisIndex: number) => void;

  /**
   * Callback when editing is committed (blur, Enter).
   */
  onChangeComplete?: (value: number[]) => void;
}

export type VectorInputProps = Prettify<VectorInputBaseProps>;
