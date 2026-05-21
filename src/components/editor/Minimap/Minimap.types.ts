import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import type {
  ViewportTransform,
  ViewportSize,
  WorldRect,
} from '@/components/primitives/viewport';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';

// ─── Items ───

interface MinimapItemBase {
  /** Stable identity. Not used for hit-testing today; reserved for future selection support. */
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

/** Discriminated union of all minimap item shapes. */
export type MinimapItem = MinimapRectItem | MinimapCircleItem | MinimapLineItem;

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

  /** Disable interactions and dim the minimap. @default false */
  disabled?: boolean;

  /** @default 'Minimap' */
  ariaLabel?: string;
}

export type MinimapProps = Prettify<MinimapBaseProps>;
