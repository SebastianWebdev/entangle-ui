import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

// ─── Geometry ───

/** A 2D point in domain (logical) coordinates */
export interface Point2D {
  x: number;
  y: number;
}

/** A viewport mapping domain coordinates to canvas pixels */
export interface CanvasViewport {
  /** Visible domain X range [min, max] */
  viewX: [number, number];
  /** Visible domain Y range [min, max] */
  viewY: [number, number];
}

/** Domain bounds for both axes */
export interface DomainBounds {
  /** Domain X range — e.g. [0, 1], [-1, 1], [0, 255] */
  domainX: [number, number];
  /** Domain Y range */
  domainY: [number, number];
}

// ─── Canvas Setup ───

/** Canvas dimensions in CSS pixels (already DPR-corrected) */
export interface CanvasSize {
  /** Width in CSS pixels */
  width: number;
  /** Height in CSS pixels */
  height: number;
}

/** Information passed to custom background renderers */
export interface CanvasBackgroundInfo {
  /** Canvas width in CSS pixels */
  width: number;
  /** Canvas height in CSS pixels */
  height: number;
  /** Current viewport mapping (use with domainToCanvas) */
  viewport: CanvasViewport;
  /** Domain X range */
  domainX: [number, number];
  /** Domain Y range */
  domainY: [number, number];
}

// ─── Canvas Theme Colors ───

/**
 * Resolved theme colors for canvas 2D rendering.
 *
 * Canvas contexts can't read CSS variables directly, so these must be
 * pre-resolved via getComputedStyle before drawing.
 */
export interface CanvasThemeColors {
  backgroundSecondary: string;
  borderDefault: string;
  textMuted: string;
  textPrimary: string;
  textSecondary: string;
  accentPrimary: string;
  fontSizeXs: number;
}

// ─── Drawing Options ───

/** Configuration for grid drawing */
export interface GridOptions {
  /** Number of grid subdivisions between domain bounds */
  subdivisions: number;
  /** Domain bounds to subdivide */
  domain: DomainBounds;
  /** Current viewport for coordinate mapping */
  viewport: CanvasViewport;
  /** Overall opacity multiplier (e.g. 0.4 for disabled) */
  opacity?: number;
}

/** Configuration for axis label drawing */
export interface AxisLabelOptions extends GridOptions {
  /** X-axis name label (e.g. "Time", "X") */
  labelX?: string;
  /** Y-axis name label (e.g. "Value", "Y") */
  labelY?: string;
}

/** Configuration for crosshair drawing */
export interface CrosshairOptions {
  /** Point position in domain coordinates */
  point: Point2D;
  /** Current viewport for coordinate mapping */
  viewport: CanvasViewport;
  /** Line style: solid, dashed */
  lineStyle?: 'solid' | 'dashed';
  /** Line width in pixels @default 1 */
  lineWidth?: number;
  /** Whether to extend lines to canvas edges @default true */
  fullSpan?: boolean;
  /** Opacity multiplier @default 1 */
  opacity?: number;
}

/** Configuration for point marker drawing */
export interface PointMarkerOptions {
  /** Point position in domain coordinates */
  point: Point2D;
  /** Current viewport for coordinate mapping */
  viewport: CanvasViewport;
  /** Marker radius in pixels @default 6 */
  radius?: number;
  /** Whether the marker is hovered */
  hovered?: boolean;
  /** Whether the marker is being dragged */
  dragging?: boolean;
  /** Opacity multiplier @default 1 */
  opacity?: number;
}

// ─── CanvasContainer Props ───

export type CanvasContainerSize = Size;

export interface CanvasContainerBaseProps
  extends Omit<BaseComponent<HTMLDivElement>, 'onChange'> {
  /**
   * Ref to the underlying <canvas> element.
   * Required — the consumer manages the ref for rendering/interaction hooks.
   */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;

  /**
   * Fixed height in pixels (ignored if responsive=true)
   * @default 200
   */
  height?: number;

  /**
   * Whether the canvas fills its parent container.
   * Uses ResizeObserver to track size changes.
   * @default false
   */
  responsive?: boolean;

  /**
   * Whether the canvas is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * ARIA role for the canvas
   * @default "application"
   */
  role?: string;

  /**
   * ARIA label for the canvas
   */
  ariaLabel?: string;

  /**
   * ARIA role description for the canvas
   */
  ariaRoledescription?: string;

  /**
   * Content for the aria-live announcements region
   */
  liveAnnouncement?: string;

  /**
   * Pointer event handlers — passed directly to <canvas>
   */
  handlers?: {
    onPointerDown?: (e: React.PointerEvent) => void;
    onPointerMove?: (e: React.PointerEvent) => void;
    onPointerUp?: (e: React.PointerEvent) => void;
    onDoubleClick?: (e: React.MouseEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
  };
}

export type CanvasContainerProps = Prettify<CanvasContainerBaseProps>;
