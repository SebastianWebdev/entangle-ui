import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import type {
  ViewportPanConfig,
  ViewportSize,
  ViewportTransform,
  ViewportZoomConfig,
  WorldRect,
} from '@/components/primitives/viewport';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';

// ─── Geometry primitives ───

/** Side of a node a port is anchored to. */
export type NodeGraphPortSide = 'left' | 'right' | 'top' | 'bottom';

/** Reference to a single port on a node. */
export interface NodeGraphPortRef {
  /** Owning node id. */
  node: string;
  /** Port id within that node. */
  port: string;
}

// ─── Data model ───

/**
 * A port on a node. The position along the side is either explicitly set
 * via `offset` (0 = start, 1 = end) or distributed evenly across all ports
 * on the same side when `offset` is omitted.
 */
export interface NodeGraphPort {
  /** Stable identity within the owning node. */
  id: string;
  /** Which side of the node the port sits on. */
  side: NodeGraphPortSide;
  /**
   * Position along the side as a fraction in `[0, 1]`. When omitted,
   * ports without an explicit offset are spaced evenly across the side.
   */
  offset?: number;
  /**
   * Opaque data-type token. Not interpreted by the library — passed to
   * `isValidConnection` and to `renderNode` so the consumer can colour
   * the port, validate connections, etc.
   */
  dataType?: string;
  /** Optional human-readable label, surfaced via `aria-label`. */
  label?: string;
}

export interface NodeGraphNode {
  /** Stable identity. */
  id: string;
  /** Position in world coordinates (top-left corner of the node body). */
  position: Point2D;
  /**
   * Width of the node body in world units. Used for port-position math
   * and minimap mirroring. When omitted, defaults to `defaultNodeSize.width`.
   */
  width?: number;
  /** Height of the node body in world units. Defaults to `defaultNodeSize.height`. */
  height?: number;
  /** Ports attached to this node. */
  ports?: NodeGraphPort[];
  /** Arbitrary consumer payload passed to `renderNode`. */
  data?: unknown;
  /**
   * When false, the node cannot be moved by drag. Selection still works.
   * @default true
   */
  draggable?: boolean;
  /**
   * When false, the node cannot be selected (clicks pass through to the
   * background). Drag is also disabled.
   * @default true
   */
  selectable?: boolean;
}

export interface NodeGraphEdge {
  /** Stable identity. */
  id: string;
  /** Edge source endpoint. */
  source: NodeGraphPortRef;
  /** Edge target endpoint. */
  target: NodeGraphPortRef;
  /** Arbitrary consumer payload (e.g. animation flags, weights). */
  data?: unknown;
  /**
   * Optional HTML label rendered absolutely above the edge midpoint.
   * Use `renderEdgeLabel` for full control, or pass a node here for the
   * default centred placement.
   */
  label?: React.ReactNode;
}

/**
 * A visual backdrop rectangle drawn under nodes. Groups in v1 are purely
 * decorative — nodes are not children of a group, they simply happen to
 * overlap with it. Selection of a group through marquee/click can be
 * wired up by the consumer via `onContextMenu` / future selection API.
 */
export interface NodeGraphGroup {
  /** Stable identity. */
  id: string;
  /** Group rectangle in world coordinates. */
  bounds: WorldRect;
  /** Optional title shown above the group's top edge. */
  label?: string;
  /** Optional CSS colour string used for the group tint and label. */
  color?: string;
}

export interface NodeGraphSelection {
  /** Selected node ids. */
  nodes: string[];
  /** Selected edge ids. */
  edges: string[];
  /** Selected group ids. */
  groups: string[];
}

// ─── Targets / events ───

/** Discriminated union describing what was hit by a pointer event. */
export type NodeGraphTarget =
  | { kind: 'node'; id: string }
  | { kind: 'edge'; id: string }
  | { kind: 'port'; node: string; port: string }
  | { kind: 'group'; id: string }
  | { kind: 'empty'; worldPoint: Point2D };

export interface NodeGraphContextMenuInfo {
  target: NodeGraphTarget;
  /** Screen-space (CSS-pixel) position of the pointer relative to viewport. */
  screenPoint: Point2D;
  /** World-space position of the pointer. */
  worldPoint: Point2D;
}

export interface NodeGraphConnectStartInfo {
  source: NodeGraphPortRef;
  /** World-space position the drag started at (the source port). */
  worldPoint: Point2D;
}

export interface NodeGraphConnectEndInfo {
  source: NodeGraphPortRef;
  /** Resolved drop target, or null when the drag ended on empty space. */
  target: NodeGraphPortRef | null;
  /** True when the drop was rejected (target invalid or empty). */
  cancelled: boolean;
}

export interface NodeGraphConnectionValidationInfo {
  /** True when source and target reference the same node. */
  sameNode: boolean;
  /** Side combination shorthand, e.g. 'right→left'. */
  sideCombo: string;
}

// ─── Rendering ───

/** Context passed to `renderNode`. */
export interface NodeGraphRenderCtx {
  /** True when the node is part of the current selection. */
  selected: boolean;
  /** True when the node is being dragged (single or multi). */
  dragging: boolean;
  /** True when the pointer is hovering over the node body. */
  hovered: boolean;
  /** Current viewport zoom — useful for LOD rendering. */
  zoom: number;
}

// ─── Imperative handle ───

export interface NodeGraphHandle {
  /** Pan/zoom so all nodes fit inside the viewport with optional padding. */
  fitToContent(padding?: number): void;
  /** Pan/zoom so all *selected* nodes fit. No-op when selection is empty. */
  fitToSelection(padding?: number): void;
  /** Center the viewport on a specific node. */
  focusNode(id: string): void;
  /** Center on a world point, optionally setting zoom. */
  centerOn(point: Point2D, zoom?: number): void;
  /** Pan/zoom to fit a world rectangle. */
  zoomToRect(rect: WorldRect, padding?: number): void;
  /** Read the current transform. */
  getTransform(): ViewportTransform;
  /** Read the current viewport size in CSS pixels. */
  getSize(): ViewportSize;
  /** Convert a world point to a screen (CSS-pixel) point. */
  worldToScreen(point: Point2D): Point2D;
  /** Convert a screen (CSS-pixel) point to a world point. */
  screenToWorld(point: Point2D): Point2D;
  /**
   * Force a redraw. With no `layerName`, all canvas layers redraw on the
   * next frame; with a name (`'edges' | 'groups' | 'preview'`), only that
   * layer redraws.
   */
  invalidate(layerName?: NodeGraphLayerName): void;
}

export type NodeGraphLayerName = 'groups' | 'edges' | 'preview';

// ─── Slot markers ───

/**
 * Symbol attached to `<NodeGraph.Minimap>` and other slot subcomponents so
 * the parent `<NodeGraph>` can identify them without relying on
 * `displayName` (which gets clobbered by `React.memo` / minifiers).
 */
export const NODE_GRAPH_SLOT: unique symbol = Symbol.for('etui.nodegraph.slot');

export type NodeGraphSlotKind = 'minimap' | 'background';

export interface NodeGraphSlotMarker {
  [NODE_GRAPH_SLOT]: NodeGraphSlotKind;
}

// ─── Props ───

export interface NodeGraphBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onChange' | 'onContextMenu' | 'ref'
> {
  // ── Nodes (controlled / uncontrolled) ──
  nodes?: NodeGraphNode[];
  defaultNodes?: NodeGraphNode[];
  onNodesChange?: (nodes: NodeGraphNode[]) => void;

  // ── Edges (controlled / uncontrolled) ──
  edges?: NodeGraphEdge[];
  defaultEdges?: NodeGraphEdge[];
  onEdgesChange?: (edges: NodeGraphEdge[]) => void;

  // ── Groups (controlled / uncontrolled) ──
  groups?: NodeGraphGroup[];
  defaultGroups?: NodeGraphGroup[];
  onGroupsChange?: (groups: NodeGraphGroup[]) => void;

  // ── Selection (controlled / uncontrolled) ──
  selection?: NodeGraphSelection;
  defaultSelection?: NodeGraphSelection;
  onSelectionChange?: (selection: NodeGraphSelection) => void;

  // ── Rendering slots ──
  /**
   * Render the body of a node. The returned content sits inside a wrapper
   * `<div>` positioned in world space — do not set position/transform
   * yourself. Ports are rendered separately around the wrapper.
   */
  renderNode?: (
    node: NodeGraphNode,
    ctx: NodeGraphRenderCtx
  ) => React.ReactNode;
  /**
   * Render a label above the midpoint of an edge. Receives the edge data.
   * When omitted, `edge.label` is used as-is (if defined).
   */
  renderEdgeLabel?: (edge: NodeGraphEdge) => React.ReactNode;

  // ── Interaction ──
  /**
   * Validate a connection between two ports. Return `false` to reject the
   * drop; the preview edge is still drawn while the user is hovering, but
   * styled as invalid.
   */
  isValidConnection?: (
    source: NodeGraphPortRef,
    target: NodeGraphPortRef,
    info: NodeGraphConnectionValidationInfo
  ) => boolean;
  /**
   * Snap node positions to a grid of `snapToGrid` world units. Pass `false`
   * to disable snapping. Affects drag (mouse), not programmatic position
   * updates.
   * @default false
   */
  snapToGrid?: number | false;
  /** Fired when a connection drag starts (pointer-down on a port). */
  onConnectStart?: (info: NodeGraphConnectStartInfo) => void;
  /** Fired when a connection drag ends (drop on a port or cancellation). */
  onConnectEnd?: (info: NodeGraphConnectEndInfo) => void;
  /**
   * Fired on a context menu (right-click) over any part of the graph.
   * Includes a discriminated target so the consumer can render contextual
   * menus for nodes / edges / ports / groups / empty background.
   */
  onContextMenu?: (info: NodeGraphContextMenuInfo) => void;
  /** Fired when Delete/Backspace is pressed with a non-empty selection. */
  onDelete?: (selection: NodeGraphSelection) => void;
  /** Fired when Enter is pressed with a single focused node. */
  onActivate?: (node: NodeGraphNode) => void;

  // ── Viewport pass-through ──
  /**
   * Pan gesture configuration, or `false` to disable. Defaults match
   * `<Viewport>`: middle-mouse drag + space-key + left-drag.
   */
  pan?: ViewportPanConfig | false;
  /** Zoom gesture configuration, or `false` to disable. */
  zoom?: ViewportZoomConfig | false;
  /** @default 0.1 */
  minZoom?: number;
  /** @default 4 */
  maxZoom?: number;
  /**
   * Enable marquee selection rectangle. When true, dragging on empty
   * background draws a marquee that selects intersecting nodes.
   * @default true
   */
  selectionRect?: boolean;
  /**
   * Track parent size via `ResizeObserver`. Identical to `<Viewport>`'s
   * `responsive`. @default false
   */
  responsive?: boolean;
  /** Fixed height when not responsive. @default 480 */
  height?: number;
  /**
   * Default size used for nodes that don't declare `width` / `height`.
   * @default { width: 180, height: 80 }
   */
  defaultNodeSize?: { width: number; height: number };
  /**
   * Disable all interaction and dim the surface.
   * @default false
   */
  disabled?: boolean;

  // ── Accessibility ──
  /** @default 'Node graph' */
  ariaLabel?: string;

  /** Slot children: `<NodeGraph.Minimap>`, `<NodeGraph.Background>`. */
  children?: React.ReactNode;

  /** Imperative handle. */
  ref?: React.Ref<NodeGraphHandle>;
}

export type NodeGraphProps = Prettify<NodeGraphBaseProps>;

// ─── Subcomponent props ───

export interface NodeGraphMinimapSlotProps {
  /**
   * Anchored position inside the graph. Matches `ViewportMinimap`'s
   * `placement` (string preset or custom anchor object).
   * @default 'bottom-right'
   */
  placement?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | {
        top?: number | string;
        right?: number | string;
        bottom?: number | string;
        left?: number | string;
        width?: number | string;
        height?: number | string;
      };
  /** Distance from the edge for preset placements (CSS px). @default 12 */
  margin?: number;
  /** Minimap width in CSS pixels. @default 200 */
  width?: number;
  /** Optional title (rendered as `<Minimap.Title>`). */
  title?: React.ReactNode;
  /** Optional className applied to the minimap wrapper. */
  className?: string;
}

export interface NodeGraphBackgroundSlotProps {
  /**
   * Background style. `'dots'` and `'grid'` are built in; pass `'none'`
   * for an opaque background only.
   * @default 'dots'
   */
  variant?: 'dots' | 'grid' | 'none';
  /**
   * Grid spacing in world units. The pattern repeats at this interval
   * regardless of zoom.
   * @default 24
   */
  gap?: number;
  /** Optional dot/line colour. Defaults to theme `border.default`. */
  color?: string;
  /** Optional background colour. Defaults to theme `background.primary`. */
  background?: string;
}
