import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import type {
  Point2D,
  CanvasThemeColors,
} from '@/components/primitives/canvas/canvas.types';

// ─── Transform ───

/**
 * Viewport transform — screen-space translation + uniform scale.
 *
 * `screenPos = worldPos * zoom + (x, y)`
 *
 * Equivalent to the 2D matrix `[zoom, 0, 0, zoom, x, y]`.
 */
export interface ViewportTransform {
  /** Screen-space translation X in CSS pixels, applied after scaling. */
  x: number;
  /** Screen-space translation Y in CSS pixels, applied after scaling. */
  y: number;
  /** Uniform scale (1 = identity). */
  zoom: number;
}

// ─── Geometry ───

/** Axis-aligned rectangle in world coordinates. */
export interface WorldRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Viewport dimensions in CSS pixels. */
export interface ViewportSize {
  width: number;
  height: number;
}

// ─── Gesture configuration ───

export type ViewportMouseButton = 'left' | 'middle' | 'right';
export type ViewportModifier = 'shift' | 'meta' | 'ctrl' | 'alt';

/** Pan gesture configuration. */
export interface ViewportPanConfig {
  /**
   * Mouse button used for click-and-drag pan. Set to `false` to disable
   * button-driven pan entirely (space-key may still enable pan if active).
   * @default 'middle'
   */
  button?: ViewportMouseButton | false;
  /**
   * When true, holding Space turns any left-button drag into a pan
   * (overrides marquee if both are enabled).
   * @default true
   */
  spaceKey?: boolean;
}

/** Zoom gesture configuration. */
export interface ViewportZoomConfig {
  /**
   * Enable wheel-to-zoom (zooms toward cursor position).
   * @default true
   */
  wheel?: boolean;
  /**
   * Enable trackpad pinch-to-zoom (handled as `ctrlKey + wheel`,
   * which is the browser convention for trackpad pinch).
   * @default true
   */
  pinch?: boolean;
  /**
   * Zoom factor per wheel unit. Lower = finer steps.
   * @default 0.0015
   */
  speed?: number;
}

/** Marquee (selection rectangle) gesture configuration. */
export interface ViewportSelectionConfig {
  /**
   * Enable marquee selection on drag from empty viewport background.
   * @default false
   */
  enabled?: boolean;
  /**
   * Mouse button used to start marquee.
   * @default 'left'
   */
  button?: ViewportMouseButton;
  /**
   * Modifier key that, when held, flags the selection as additive
   * (passed via `onSelectionChange` info).
   * @default 'shift'
   */
  additiveModifier?: ViewportModifier;
}

// ─── Events ───

/** Marquee selection result. */
export interface ViewportSelectionEvent {
  /** Selection rectangle in world coordinates (normalized: width/height >= 0). */
  rect: WorldRect;
  /** True when the additive modifier was held during the gesture. */
  additive: boolean;
  /** True for intermediate updates during drag, false on the final pointerup. */
  inProgress: boolean;
}

/** Info passed to `onPanEnd`. */
export interface ViewportPanEndInfo {
  /** Velocity at gesture end in screen px / ms (smoothed over a small window). */
  velocity: { x: number; y: number };
}

// ─── Imperative handle ───

export interface ViewportHandle {
  /**
   * Pan and zoom so that `bounds` fits inside the viewport with optional inner padding.
   * Padding is in screen pixels (deducted from the viewport on each side).
   */
  fitToContent(bounds: WorldRect, padding?: number): void;
  /** Alias for `fitToContent` — pan/zoom to fit the given world rect. */
  zoomToRect(rect: WorldRect, padding?: number): void;
  /** Center the viewport on a world point, optionally setting zoom. */
  centerOn(point: Point2D, zoom?: number): void;
  /** Read the current transform. */
  getTransform(): ViewportTransform;
  /** Read the current viewport size in CSS pixels. */
  getSize(): ViewportSize;
  /**
   * Force a redraw. With no `layerName`, all layers redraw on the next frame;
   * with `layerName`, only that layer redraws.
   */
  invalidate(layerName?: string): void;
}

// ─── Layer rendering ───

/** Info passed to a layer's `draw` callback. */
export interface ViewportLayerDrawInfo {
  /** Current viewport size in CSS pixels. */
  size: ViewportSize;
  /** Current transform. */
  transform: ViewportTransform;
  /** Resolved theme colors for canvas 2D drawing. */
  theme: CanvasThemeColors;
  /** Convert a world point to a screen (CSS-pixel) point. */
  worldToScreen(point: Point2D): Point2D;
  /** Convert a screen (CSS-pixel) point to a world point. */
  screenToWorld(point: Point2D): Point2D;
}

export interface ViewportLayerBaseProps {
  /** Unique layer name, used by `handle.invalidate(name)`. */
  name: string;
  /** Draw callback. Called whenever the layer invalidates. */
  draw: (ctx: CanvasRenderingContext2D, info: ViewportLayerDrawInfo) => void;
  /** Extra reactive dependencies that trigger a redraw when they change. */
  invalidateOn?: ReadonlyArray<unknown>;
  /**
   * Pause drawing for this layer. The layer canvas stays mounted; it just
   * stops re-rendering on transform/size/`invalidateOn` changes.
   * @default false
   */
  paused?: boolean;
  /** Optional className applied to the underlying `<canvas>` element. */
  className?: string;
}
export type ViewportLayerProps = Prettify<ViewportLayerBaseProps>;

// ─── World / Overlay slots ───

export interface ViewportWorldBaseProps {
  /** Children positioned in world coordinates. Use `position: absolute` + `left`/`top`. */
  children?: React.ReactNode;
  /** Optional className for the world-space wrapper. */
  className?: string;
  /** Optional inline styles for the world-space wrapper. */
  style?: React.CSSProperties;
}
export type ViewportWorldProps = Prettify<ViewportWorldBaseProps>;

export interface ViewportOverlayBaseProps {
  /** Children positioned in screen coordinates (above world + layers). */
  children?: React.ReactNode;
  /** Optional className for the overlay wrapper. */
  className?: string;
  /** Optional inline styles for the overlay wrapper. */
  style?: React.CSSProperties;
}
export type ViewportOverlayProps = Prettify<ViewportOverlayBaseProps>;

// ─── Viewport context ───

export interface ViewportContextValue {
  transform: ViewportTransform;
  size: ViewportSize;
  handle: ViewportHandle;
  /** True when the user is actively panning (cursor visual hint). */
  isPanning: boolean;
}

// ─── Main Viewport props ───

export interface ViewportBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onChange' | 'ref'
> {
  /** Controlled transform. */
  transform?: ViewportTransform;
  /**
   * Default transform when uncontrolled.
   * @default { x: 0, y: 0, zoom: 1 }
   */
  defaultTransform?: ViewportTransform;
  /** Called when the transform changes (gestures or imperative API). */
  onTransformChange?: (transform: ViewportTransform) => void;

  /**
   * Minimum zoom level.
   * @default 0.1
   */
  minZoom?: number;
  /**
   * Maximum zoom level.
   * @default 8
   */
  maxZoom?: number;

  /**
   * Pan gesture configuration, or `false` to disable all pan gestures.
   * @default { button: 'middle', spaceKey: true }
   */
  pan?: ViewportPanConfig | false;
  /**
   * Zoom gesture configuration, or `false` to disable all zoom gestures.
   * @default { wheel: true, pinch: true }
   */
  zoom?: ViewportZoomConfig | false;
  /**
   * Marquee selection rectangle. Disabled by default.
   * @default { enabled: false }
   */
  selectionRect?: ViewportSelectionConfig;

  /** Called during marquee drag (intermediate + final). */
  onSelectionChange?: (info: ViewportSelectionEvent) => void;

  /** Called when a pan gesture starts. */
  onPanStart?: () => void;
  /** Called when a pan gesture ends. Includes velocity for inertia recipes. */
  onPanEnd?: (info: ViewportPanEndInfo) => void;
  /** Called when a zoom gesture starts. */
  onZoomStart?: () => void;
  /** Called when a zoom gesture ends (after a brief idle period). */
  onZoomEnd?: () => void;

  /**
   * Whether the viewport fills its parent (uses ResizeObserver).
   * @default false
   */
  responsive?: boolean;
  /**
   * Fixed height in pixels (ignored when `responsive` is true).
   * @default 300
   */
  height?: number;

  /**
   * Disable all interaction and dim the viewport.
   * @default false
   */
  disabled?: boolean;

  /**
   * ARIA role applied to the viewport wrapper.
   * @default 'application'
   */
  role?: string;
  ariaLabel?: string;
  ariaRoledescription?: string;

  /**
   * Layers (`<ViewportLayer>`), world children (`<ViewportWorld>`),
   * and overlay children (`<ViewportOverlay>`).
   */
  children?: React.ReactNode;

  /** Imperative handle (fitToContent, centerOn, etc.). */
  ref?: React.Ref<ViewportHandle>;
}
export type ViewportProps = Prettify<ViewportBaseProps>;
