import type { ColorFormat } from '@/components/controls/ColorPicker';
import type { BaseComponent, Size } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type GradientEditorSize = Size;

/**
 * Gradient kind.
 * - `linear`: straight color band along `angle`
 * - `radial`: color band emanating from the center
 * - `conic`: color band swept around the center starting at `angle`
 */
export type GradientType = 'linear' | 'radial' | 'conic';

/**
 * Single color stop on the gradient ramp.
 */
export interface GradientStop {
  /** Unique identifier (auto-generated if not provided) */
  id: string;
  /** Any valid CSS color string (hex / rgb(a) / hsl(a)) */
  color: string;
  /** Position along the ramp, 0–1 */
  position: number;
}

/**
 * Complete gradient data model — the controlled `value` shape.
 *
 * Mirrors the structured-value approach used by CurveEditor (`CurveData`):
 * the component speaks objects, and a CSS string is available on demand via
 * `formatGradientCSS` / the copy button.
 */
export interface GradientData {
  /** Gradient kind */
  type: GradientType;
  /**
   * Direction in degrees.
   * - `linear`: the gradient line angle (0 = to top, 90 = to right)
   * - `conic`: the starting angle of the sweep
   * - `radial`: ignored
   * @default 90
   */
  angle: number;
  /** Color stops, ordered by `position` (always ≥ 2) */
  stops: GradientStop[];
}

/**
 * How a stop's color is edited from its card in the stops grid.
 * - `popover`: clicking a card's swatch opens a ColorPicker in a popover
 *   anchored to it
 * - `inline`: clicking a card selects it and a single ColorPicker panel is
 *   rendered below the grid, editing the selected stop
 * @default "popover"
 */
export type GradientColorEditorMode = 'popover' | 'inline';

export interface GradientEditorBaseProps extends Omit<
  BaseComponent,
  'onChange' | 'value' | 'defaultValue'
> {
  /**
   * Gradient data (controlled).
   */
  value?: GradientData;

  /**
   * Default gradient data (uncontrolled).
   * @default a black→white horizontal linear gradient
   */
  defaultValue?: GradientData;

  /**
   * Width of the editor in pixels. Ignored when the editor is allowed to
   * stretch by its container (no explicit width given via `style`).
   * @default 280
   */
  width?: number;

  /**
   * Gradient types offered in the type toggle.
   * @default ['linear', 'radial', 'conic']
   */
  types?: GradientType[];

  /**
   * How a stop's color is edited from its card (popover per card, or a shared
   * inline picker below the grid).
   * @default "popover"
   */
  colorEditor?: GradientColorEditorMode;

  /**
   * Color format shown on each stop card's value label.
   * @default "hex"
   */
  swatchFormat?: ColorFormat;

  /**
   * Whether the ColorPicker exposes the alpha channel.
   * @default true
   */
  showAlpha?: boolean;

  /**
   * Whether to show the angle control (only meaningful for linear/conic).
   * @default true
   */
  showAngle?: boolean;

  /**
   * Whether to show the read-only CSS output row with a copy button.
   * @default true
   */
  showCssOutput?: boolean;

  /**
   * Maximum number of stops allowed. Adding is blocked once reached.
   * @default 16
   */
  maxStops?: number;

  /**
   * Minimum number of stops. Deletion is blocked once reached.
   * @default 2
   */
  minStops?: number;

  /**
   * Component size — affects control density.
   * @default "md"
   */
  size?: GradientEditorSize;

  /**
   * Whether the editor is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Callback fired continuously while editing (drag, type change, etc).
   */
  onChange?: (value: GradientData) => void;

  /**
   * Callback fired when an edit is committed (drag end, add, delete).
   * Use this for undo-system integration.
   */
  onChangeComplete?: (value: GradientData) => void;

  /**
   * Callback fired when the selected stop changes.
   */
  onSelectionChange?: (stopId: string | null) => void;
}

export type GradientEditorProps = Prettify<GradientEditorBaseProps>;
