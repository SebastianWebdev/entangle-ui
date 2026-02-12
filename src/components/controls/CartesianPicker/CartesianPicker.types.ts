import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';
import type {
  Point2D,
  CanvasBackgroundInfo,
} from '@/components/primitives/canvas/canvas.types';

export type CartesianPickerSize = Size;

// ─── CartesianPicker Props ───

export interface CartesianPickerBaseProps extends Omit<
  BaseComponent,
  'onChange' | 'value' | 'defaultValue'
> {
  /**
   * Current point value (controlled)
   */
  value?: Point2D;

  /**
   * Default point value (uncontrolled)
   * @default { x: 0, y: 0 }
   */
  defaultValue?: Point2D;

  /**
   * Domain range for X axis
   * @default [-1, 1]
   */
  domainX?: [number, number];

  /**
   * Domain range for Y axis
   * @default [-1, 1]
   */
  domainY?: [number, number];

  // ─── Visual Options ───

  /**
   * Whether to show grid lines
   * @default true
   */
  showGrid?: boolean;

  /**
   * Grid subdivision count (lines between domain bounds)
   * @default 4
   */
  gridSubdivisions?: number;

  /**
   * Whether to show X/Y axis value labels on the grid
   * @default true
   */
  showAxisLabels?: boolean;

  /**
   * Whether to draw origin axes (X=0, Y=0) with emphasis.
   * Useful when domain is symmetric around origin.
   * @default true
   */
  showOriginAxes?: boolean;

  /**
   * Whether to draw crosshair lines from point to edges
   * @default true
   */
  showCrosshair?: boolean;

  /**
   * Crosshair line style
   * @default "dashed"
   */
  crosshairStyle?: 'solid' | 'dashed';

  /**
   * X axis name label (e.g. "Pan", "U", "X")
   */
  labelX?: string;

  /**
   * Y axis name label (e.g. "Tilt", "V", "Y")
   */
  labelY?: string;

  /**
   * Point marker radius in pixels
   * @default 6
   */
  markerRadius?: number;

  // ─── Constraints ───

  /**
   * Snap to grid subdivisions while dragging (Ctrl toggles)
   * @default false
   */
  snapToGrid?: boolean;

  /**
   * Discrete step for value snapping. Can be a single value for both axes
   * or [stepX, stepY] for per-axis steps.
   * Applied instead of grid snap when provided.
   */
  step?: number | [number, number];

  /**
   * Whether to clamp the point within domain bounds
   * @default true
   */
  clampToRange?: boolean;

  /**
   * Number format precision for displayed values
   * @default 2
   */
  precision?: number;

  // ─── Sizing ───

  /**
   * Width of the picker in pixels
   * @default 200
   */
  width?: number;

  /**
   * Height of the picker in pixels.
   * For square pickers (most common), set equal to width.
   * @default 200
   */
  height?: number;

  /**
   * Whether the picker fills its parent container.
   * Overrides width/height — uses ResizeObserver.
   * @default false
   */
  responsive?: boolean;

  /**
   * Component size — affects label/value display sizing
   * @default "md"
   */
  size?: CartesianPickerSize;

  // ─── State ───

  /**
   * Whether the picker is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the picker is read-only (can view but not edit)
   * @default false
   */
  readOnly?: boolean;

  // ─── Callbacks ───

  /**
   * Callback when point changes.
   * Fires continuously during drag.
   */
  onChange?: (point: Point2D) => void;

  /**
   * Callback when editing is committed (pointer up, click).
   * Use for undo system integration.
   */
  onChangeComplete?: (point: Point2D) => void;

  // ─── Render Props ───

  /**
   * Custom background renderer — called after clearing the canvas
   * but before drawing the grid.
   *
   * Use for heatmaps, gradients, or images behind the picker.
   */
  renderBackground?: (
    ctx: CanvasRenderingContext2D,
    info: CanvasBackgroundInfo
  ) => void;

  /**
   * Render prop for custom content below the canvas.
   * Receives the current point value for display.
   */
  renderBottomBar?: (info: CartesianPickerInfo) => React.ReactNode;
}

export type CartesianPickerProps = Prettify<CartesianPickerBaseProps>;

// ─── Info for render props ───

export interface CartesianPickerInfo {
  /** Current point value */
  point: Point2D;
  /** Whether the picker is disabled */
  disabled: boolean;
  /** Whether the picker is read-only */
  readOnly: boolean;
  /** Whether the user is currently dragging */
  isDragging: boolean;
  /** Domain X range */
  domainX: [number, number];
  /** Domain Y range */
  domainY: [number, number];
}
