import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';
import type {
  CanvasViewport,
  CanvasBackgroundInfo,
} from '@/components/primitives/canvas';

export type CurveEditorSize = Size;

/**
 * Tangent handle mode — controls how handles behave around a keyframe.
 * - `free`: Each handle moves independently
 * - `aligned`: Handles stay co-linear but can differ in length
 * - `mirrored`: Handles are symmetric (same angle and length)
 * - `auto`: Smooth catmull-rom style — handles auto-computed from neighbors
 * - `linear`: No handles — straight line segments
 * - `step`: Constant value until next keyframe (hold / step function)
 */
export type TangentMode =
  | 'free'
  | 'aligned'
  | 'mirrored'
  | 'auto'
  | 'linear'
  | 'step';

/**
 * Single control point (keyframe) on the curve.
 */
export interface CurveKeyframe {
  /** X position in domain space (e.g., 0-1 for normalized, 0-100 for frames) */
  x: number;
  /** Y value at this position */
  y: number;
  /** Left tangent handle offset (relative to keyframe position) */
  handleIn: { x: number; y: number };
  /** Right tangent handle offset (relative to keyframe position) */
  handleOut: { x: number; y: number };
  /** Tangent mode for this keyframe */
  tangentMode: TangentMode;
  /** Optional unique ID (auto-generated if not provided) */
  id?: string;
}

/**
 * Complete curve data model.
 */
export interface CurveData {
  /** Ordered array of keyframes (sorted by x) */
  keyframes: CurveKeyframe[];
  /** Domain bounds — x range */
  domainX: [number, number];
  /** Domain bounds — y range */
  domainY: [number, number];
  /**
   * Pre-infinity behavior — what happens before the first keyframe
   * @default "constant"
   */
  preInfinity?: 'constant' | 'linear' | 'cycle' | 'pingpong';
  /**
   * Post-infinity behavior — what happens after the last keyframe
   * @default "constant"
   */
  postInfinity?: 'constant' | 'linear' | 'cycle' | 'pingpong';
}

// ─── CurveEditor Props ───

export interface CurveEditorBaseProps extends Omit<
  BaseComponent,
  'onChange' | 'value' | 'defaultValue'
> {
  /**
   * Curve data (controlled)
   */
  value?: CurveData;

  /**
   * Default curve data (uncontrolled)
   * @default ease-in-out preset
   */
  defaultValue?: CurveData;

  /**
   * Width of the editor in pixels
   * @default 320
   */
  width?: number;

  /**
   * Height of the editor in pixels
   * @default 200
   */
  height?: number;

  /**
   * Whether the editor fills its parent container.
   * Overrides width/height — uses ResizeObserver.
   * @default false
   */
  responsive?: boolean;

  /**
   * Whether to show the toolbar (presets, tangent mode, zoom)
   * @default true
   */
  showToolbar?: boolean;

  /**
   * Whether to show the grid lines
   * @default true
   */
  showGrid?: boolean;

  /**
   * Grid subdivision count (lines between domain bounds)
   * @default 4
   */
  gridSubdivisions?: number;

  /**
   * Whether to display X/Y axis value labels on the grid
   * @default true
   */
  showAxisLabels?: boolean;

  /**
   * Whether to allow adding new keyframes by double-clicking the curve
   * @default true
   */
  allowAdd?: boolean;

  /**
   * Maximum number of keyframes allowed.
   * When reached, double-click will not add new keyframes.
   * @default Infinity
   */
  maxKeyframes?: number;

  /**
   * Whether to allow deleting keyframes (Delete/Backspace key)
   * @default true
   */
  allowDelete?: boolean;

  /**
   * Whether the first and last keyframe X positions are locked
   * (user can change Y but not move them along X axis)
   * @default true
   */
  lockEndpoints?: boolean;

  /**
   * Minimum distance between keyframes on the X axis.
   * Prevents overlapping keyframes.
   * @default 0.001
   */
  minKeyframeDistance?: number;

  /**
   * Whether Y values are clamped to domainY bounds.
   * @default true
   */
  clampY?: boolean;

  /**
   * Snap to grid while dragging (hold Ctrl to toggle)
   * @default false
   */
  snapToGrid?: boolean;

  /**
   * Number format precision for displayed values
   * @default 3
   */
  precision?: number;

  /**
   * X axis label (e.g., "Time", "Input", "Distance")
   */
  labelX?: string;

  /**
   * Y axis label (e.g., "Value", "Output", "Intensity")
   */
  labelY?: string;

  /**
   * Preset curves available in the toolbar.
   * Merged with built-in presets.
   */
  presets?: CurvePreset[];

  /**
   * Component size — affects toolbar and label sizing
   * @default "md"
   */
  size?: CurveEditorSize;

  /**
   * Whether the editor is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the editor is read-only (can view but not edit)
   * @default false
   */
  readOnly?: boolean;

  /**
   * Curve line color
   * @default theme.colors.accent.primary
   */
  curveColor?: string;

  /**
   * Curve line width in pixels
   * @default 2
   */
  curveWidth?: number;

  /**
   * Callback when curve data changes.
   * Fires continuously during drag.
   */
  onChange?: (curve: CurveData) => void;

  /**
   * Callback when editing is committed (drag end, keyframe add/delete).
   * Use for undo system integration.
   */
  onChangeComplete?: (curve: CurveData) => void;

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selectedIds: string[]) => void;

  /**
   * Callback to evaluate the curve at a given X position.
   * Useful for displaying a preview value indicator.
   */
  onEvaluate?: (x: number, y: number) => void;

  /**
   * Custom background renderer — called after clearing the canvas but before
   * drawing the grid. Use this to draw histograms, gradients, or other
   * visualisations behind the curve (like Photoshop / Lightroom curves).
   *
   * The callback receives the canvas 2D context already scaled for
   * `devicePixelRatio`, the drawable area in CSS pixels, and the current
   * viewport so you can map domain values to pixel positions with
   * `domainToCanvas()`.
   */
  renderBackground?: (
    ctx: CanvasRenderingContext2D,
    info: CurveBackgroundInfo
  ) => void;

  /**
   * Render prop for custom content below the canvas.
   * Use for channel selectors, coordinate displays, color space
   * pickers, or any custom status bar content.
   *
   * The callback receives curve state so the bottom bar can display
   * reactive data (selected keyframe coordinates, evaluated values, etc.).
   */
  renderBottomBar?: (info: CurveBottomBarInfo) => React.ReactNode;

  /**
   * Whether tangent editing is locked.
   * When true:
   * - Tangent mode buttons are hidden from the toolbar
   * - Tangent handle lines/circles are not drawn on canvas
   * - Handle dragging is disabled
   * - Double-click on keyframes does not cycle tangent modes
   * - Keyboard shortcuts 1-6 for tangent modes are ignored
   *
   * The curve still renders normally using each keyframe's existing
   * tangentMode — this prop only locks UI-based changes.
   * @default false
   */
  lockTangents?: boolean;
}

export type CurveEditorProps = Prettify<CurveEditorBaseProps>;

// ─── Presets ───

export interface CurvePreset {
  /** Display name in the preset selector */
  label: string;
  /** Preset identifier */
  id: string;
  /** Curve data for this preset */
  curve: CurveData;
  /** Optional category for grouping presets */
  category?: string;
  /** Optional icon element */
  icon?: React.ReactNode;
}

/**
 * Information passed to the `renderBottomBar` render prop.
 */
export interface CurveBottomBarInfo {
  /** Current curve data */
  curve: CurveData;
  /** IDs of currently selected keyframes */
  selectedIds: string[];
  /** The actual selected keyframe objects */
  selectedKeyframes: CurveKeyframe[];
  /** Evaluate the curve at a given X position */
  evaluate: (x: number) => number;
  /** Whether the editor is disabled */
  disabled: boolean;
  /** Whether the editor is read-only */
  readOnly: boolean;
}

/**
 * Information passed to the `renderBackground` callback.
 * Extends the shared CanvasBackgroundInfo — structurally identical,
 * with CurveViewport (which has zoom/pan) instead of CanvasViewport.
 */
export interface CurveBackgroundInfo extends CanvasBackgroundInfo {
  /** Current viewport mapping (use with `domainToCanvas`) */
  viewport: CurveViewport;
}

// ─── Internal types (not exported from index) ───

export interface CurveViewport extends CanvasViewport {
  /** Zoom level (1 = fit to bounds) */
  zoom: number;
  /** Pan offset in domain units */
  panX: number;
  panY: number;
}

export interface CurveHitTest {
  type: 'keyframe' | 'handleIn' | 'handleOut' | 'curve' | 'none';
  keyframeIndex: number;
  /** Distance from the hit in pixels (for tolerance) */
  distance: number;
}
