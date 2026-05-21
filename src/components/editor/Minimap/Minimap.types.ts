import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import type {
  ViewportTransform,
  ViewportSize,
  WorldRect,
} from '@/components/primitives/viewport';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';

// ─── Drawing info ───

/**
 * Helpers and current state passed to `renderOverlay` and to custom item
 * `draw` callbacks. Exposes the same world ↔ minimap math the built-in
 * shapes use, so consumer drawing stays aligned with everything else.
 */
export interface MinimapDrawInfo {
  /** Minimap size in CSS pixels (canvas already DPR-scaled). */
  minimapSize: ViewportSize;
  /** World rectangle this minimap maps from. */
  worldBounds: WorldRect;
  /** Current main-viewport transform (mirrored). */
  transform: ViewportTransform;
  /** Current main-viewport size in CSS pixels (mirrored). */
  viewportSize: ViewportSize;
  /** Uniform world → minimap scale (px per world unit). */
  scale: number;
  /** Letterbox offset applied when minimap aspect ≠ worldBounds aspect. */
  offset: Point2D;
  /** Map a world point to a minimap CSS-pixel point. */
  worldToMinimap: (point: Point2D) => Point2D;
  /** Inverse of `worldToMinimap`. */
  minimapToWorld: (point: Point2D) => Point2D;
}

// ─── Items ───

interface MinimapItemBase {
  /** Stable identity. Used for hover hit-testing and future selection support. */
  id: string;
  /** Override draw color for this item. Falls back to `defaultItemColor`. */
  color?: string;
}

export interface MinimapRectItem extends MinimapItemBase {
  type: 'rect';
  /** Top-left X in world units. */
  x: number;
  /** Top-left Y in world units. */
  y: number;
  /** Width in world units. */
  width: number;
  /** Height in world units. */
  height: number;
}

export interface MinimapCircleItem extends MinimapItemBase {
  type: 'circle';
  /** Center X in world units. */
  cx: number;
  /** Center Y in world units. */
  cy: number;
  /** Radius in world units. */
  r: number;
}

export interface MinimapLineItem extends MinimapItemBase {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Stroke width in minimap CSS pixels (does not scale with content). @default 1 */
  lineWidth?: number;
}

/**
 * Caller-defined item. `draw` is invoked with the minimap canvas context
 * and a `MinimapDrawInfo` object containing world ↔ minimap helpers.
 * `bounds` (world coords) is used for hover hit-testing.
 */
export interface MinimapCustomItem extends MinimapItemBase {
  type: 'custom';
  bounds: WorldRect;
  draw: (ctx: CanvasRenderingContext2D, info: MinimapDrawInfo) => void;
}

/** Discriminated union of all minimap item shapes. */
export type MinimapItem =
  | MinimapRectItem
  | MinimapCircleItem
  | MinimapLineItem
  | MinimapCustomItem;

// ─── Interactions ───

export type MinimapNavigatePhase = 'click' | 'drag-start' | 'drag' | 'drag-end';

/**
 * Info passed to `onNavigate` for every navigation event.
 *
 * `worldPoint` is the world-space point the user wants at the center
 * of the main viewport — call `viewport.centerOn(info.worldPoint)`
 * (or update your transform accordingly) to satisfy the request.
 */
export interface MinimapNavigateInfo {
  worldPoint: Point2D;
  phase: MinimapNavigatePhase;
}

/** Fine-grained gesture toggles. Pass `false` to `interactions` to disable everything. */
export interface MinimapInteractionConfig {
  /** Tap outside the viewport rect → `phase: 'click'`. @default true */
  click?: boolean;
  /** Drag the viewport rect itself → `phase: 'drag-*'`. @default true */
  dragViewportRect?: boolean;
  /** Drag starting outside the rect → immediately jumps + pans. @default true */
  dragFromEmpty?: boolean;
}

// ─── Subcomponent placement ───

export type MinimapTitlePlacement = 'top-outside' | 'top-inside';
export type MinimapFooterPlacement = 'bottom-outside' | 'bottom-inside';
export type MinimapCornerSide =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

// ─── Props ───

export interface MinimapBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onChange'
> {
  /** Items rendered as the content miniature. */
  items: ReadonlyArray<MinimapItem>;
  /**
   * World-space rectangle the minimap maps to. Use the exported
   * `computeBoundsFromItems(items, padding?)` helper if you don't already
   * track one yourself.
   */
  worldBounds: WorldRect;
  /** Current main-viewport transform — drives the viewport rect overlay. */
  transform: ViewportTransform;
  /** Current main-viewport size in CSS pixels — drives the viewport rect overlay. */
  viewportSize: ViewportSize;

  /**
   * Called when the user navigates via click, drag, or arrow keys.
   * `info.worldPoint` is the world-space point that should sit at the
   * center of the main viewport — pass it to `viewport.centerOn(...)`.
   */
  onNavigate?: (info: MinimapNavigateInfo) => void;

  /**
   * Minimap width in CSS pixels. Height is derived from `worldBounds`
   * aspect ratio and clamped to `[minHeight, maxHeight]`.
   * @default 200
   */
  width?: number;
  /** @default 60 */
  minHeight?: number;
  /** @default 200 */
  maxHeight?: number;

  /**
   * Gesture configuration. Pass `false` to disable all interactions.
   * @default { click: true, dragViewportRect: true, dragFromEmpty: true }
   */
  interactions?: MinimapInteractionConfig | false;

  /**
   * Keyboard pan step, as a fraction of the current main-viewport's
   * world-space extent per arrow-key press. Shift × 5.
   * @default 0.1
   */
  keyboardPanStep?: number;

  /** Override background color. Defaults to theme `--etui-color-bg-secondary`. */
  backgroundColor?: string;
  /** Default item color. Defaults to theme accent. */
  defaultItemColor?: string;
  /** Viewport-rect outline color. Defaults to theme accent. */
  viewportRectStroke?: string;
  /**
   * Dimmed overlay color covering the area outside the viewport rect.
   * @default 'rgba(0, 0, 0, 0.4)'
   */
  outsideOverlay?: string;

  /**
   * Custom canvas drawing pass executed after items and before the
   * viewport-rect shroud + outline. Use for backdrops, playheads, grid
   * overlays, selection regions — anything that should sit between items
   * and the viewport-rect chrome.
   */
  renderOverlay?: (
    ctx: CanvasRenderingContext2D,
    info: MinimapDrawInfo
  ) => void;

  /** Disable interactions and dim the minimap. @default false */
  disabled?: boolean;

  /** @default 'Minimap' */
  ariaLabel?: string;

  /**
   * Slot children. Pass `<Minimap.Title>`, `<Minimap.Footer>`,
   * `<Minimap.Corner>` subcomponents for chrome, or arbitrary nodes for
   * absolute overlays inside the canvas body. Children that aren't
   * recognised slot markers render as a free-form overlay layer.
   */
  children?: React.ReactNode;
}

export type MinimapProps = Prettify<MinimapBaseProps>;

// ─── Subcomponent props ───

export interface MinimapTitleProps {
  children?: React.ReactNode;
  /** @default 'top-outside' */
  placement?: MinimapTitlePlacement;
  className?: string;
  style?: React.CSSProperties;
}

export interface MinimapFooterProps {
  children?: React.ReactNode;
  /** @default 'bottom-outside' */
  placement?: MinimapFooterPlacement;
  className?: string;
  style?: React.CSSProperties;
}

export interface MinimapCornerProps {
  children?: React.ReactNode;
  /** Which corner of the canvas body to anchor in. @default 'top-right' */
  side?: MinimapCornerSide;
  className?: string;
  style?: React.CSSProperties;
}

// ─── MinimapContext ───

/**
 * Live state available to children of a `<Minimap>` via `useMinimapContext()`.
 * Includes hover information so consumers can build coordinate readouts,
 * tooltips, or "show selected item" widgets without re-implementing
 * hit-testing.
 */
export interface MinimapContextValue {
  worldBounds: WorldRect;
  minimapSize: ViewportSize;
  transform: ViewportTransform;
  viewportSize: ViewportSize;
  /** Current pointer position in world coordinates, or null when not hovering. */
  hoverWorldPoint: Point2D | null;
  /** Current pointer position in minimap CSS coords, or null when not hovering. */
  hoverMinimapPoint: Point2D | null;
  /** Id of the item currently under the pointer (hit-test), or null. */
  hoveredItemId: string | null;
  /** True during an active drag (rect or pan). */
  isDragging: boolean;
}
