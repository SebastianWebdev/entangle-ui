'use client';

import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { useResizeObserver } from '@/hooks';
import { useViewportStore } from '@/components/primitives/viewport/ViewportContext';
import { cx } from '@/utils/cx';
import { portSlotRecipe } from './NodeGraph.css';
import type { NodeGraphPortSlotProps } from './NodeGraph.types';
import { useNodeGraphStore } from './NodeGraphContext';
import { useNodeGraphNodeContext } from './NodeGraphNodeContext';
import { useStoreSlice } from './useStoreSlice';
import { NodeGraphPortVisual } from './NodeGraphPortVisual';

interface PortVisualState {
  isSource: boolean;
  isCandidate: boolean;
  isInvalid: boolean;
  isHovered: boolean;
}

const EMPTY_VISUAL: PortVisualState = {
  isSource: false,
  isCandidate: false,
  isInvalid: false,
  isHovered: false,
};

function visualEqual(a: PortVisualState, b: PortVisualState): boolean {
  return (
    a.isSource === b.isSource &&
    a.isCandidate === b.isCandidate &&
    a.isInvalid === b.isInvalid &&
    a.isHovered === b.isHovered
  );
}

/**
 * `<NodeGraph.Port>` — compound slot that declares a connection endpoint
 * for the current node. Render it anywhere inside `renderNode`; the
 * library measures its DOM position, registers it as the anchor for any
 * edge that references this port id, and wires pointer events so the
 * user can drag from it to start a connection.
 *
 * The slot renders a single `<span>` with `display: inline-flex` — drop
 * it inline next to a label and it will sit beside the text. The wrapper
 * carries the default UE-style circle / exec-triangle visual; pass
 * `children` to replace the chrome entirely (state for theming is
 * exposed via `data-port-*` attributes).
 *
 * @example
 * ```tsx
 * <NodeGraph.Port id="in" side="left" dataType="exec" />
 * ```
 *
 * Wrapped in `React.memo` — ports re-mount on every consumer `renderNode`
 * call by default, so memoization only helps consumers who memoize their
 * own node body. When they do, ports skip re-renders on unrelated store
 * updates entirely.
 */
function NodeGraphPortImpl({
  id,
  side,
  dataType,
  shape = 'circle',
  color,
  filled,
  children,
  label,
  className,
  style,
}: NodeGraphPortSlotProps): React.ReactElement {
  const { nodeId, onPortPointerDown } = useNodeGraphNodeContext();
  const store = useNodeGraphStore();
  const viewportStore = useViewportStore();
  const elementRef = useRef<HTMLSpanElement>(null);

  // ── Connected state (slice subscription — only flips re-render) ──
  // The store recomputes the connected-ports index when edges change, so
  // each port re-renders only when its own connected-ness actually flips.
  const connected = useStoreSlice(
    store.subscribeConnectedPorts,
    store.getConnectedPorts,
    () => store.isPortConnected(nodeId, id)
  );

  // ── Per-port visual state (slice subscription — no re-render storm) ──
  const visual = useStoreSlice(
    store.subscribeInteraction,
    store.getInteraction,
    interaction => {
      if (interaction.kind !== 'connect') return EMPTY_VISUAL;
      const isSource =
        interaction.source.node === nodeId && interaction.source.port === id;
      const isCandidate =
        interaction.candidate !== null &&
        interaction.candidate.node === nodeId &&
        interaction.candidate.port === id;
      if (!isSource && !isCandidate) return EMPTY_VISUAL;
      return {
        isSource,
        isCandidate,
        isInvalid: isCandidate && interaction.invalid,
        isHovered: false,
      };
    },
    visualEqual
  );

  const hoverState = useStoreSlice(
    store.subscribeHover,
    store.getHover,
    hover => ({
      ...EMPTY_VISUAL,
      isHovered:
        hover.hoveredPort !== null &&
        hover.hoveredPort.node === nodeId &&
        hover.hoveredPort.port === id,
    }),
    visualEqual
  );

  const isHovered = hoverState.isHovered;
  const isSource = visual.isSource;
  const isCandidate = visual.isCandidate;
  const isInvalid = visual.isInvalid;

  // ── DOM measurement → store ──
  //
  // Run synchronously before paint so first frame's edges anchor at the
  // correct point. `useResizeObserver` picks up later size changes on the
  // port itself, and the per-node layout-version subscription below picks
  // up layout shifts inside the node body that move the port without
  // resizing it (e.g. a sibling row expands).
  //
  // `closest('[data-node-id]:not([data-port-id])')` skips the slot itself
  // — the slot wrapper carries `data-node-id` too (so connection-drop
  // hit-tests can walk up from any descendant), so a plain `[data-node-id]`
  // would match the port and report position (~6, ~6) for every port.
  const measure = useCallback((): void => {
    const el = elementRef.current;
    if (!el) return;
    const wrapper = el.closest('[data-node-id]:not([data-port-id])');
    if (!wrapper) return;
    const portRect = el.getBoundingClientRect();
    const nodeRect = wrapper.getBoundingClientRect();
    // Convert from screen pixels to node-local world units. `ViewportWorld`
    // applies `transform: scale(zoom)` to all node wrappers, so the rects
    // we just read are scaled by `zoom`. Dividing brings us back to the
    // un-scaled layout pixels, which are 1:1 with world units inside a node.
    const zoom = viewportStore.getTransform().zoom || 1;
    const x = (portRect.left + portRect.width / 2 - nodeRect.left) / zoom;
    const y = (portRect.top + portRect.height / 2 - nodeRect.top) / zoom;
    store.setPortPosition(nodeId, id, { x, y, side, dataType });
  }, [store, viewportStore, nodeId, id, side, dataType]);

  // Re-measure triggers (the per-port `ResizeObserver` only fires when
  // the port's own size changes, which misses layout shifts inside the
  // node body that move the port without resizing it — e.g. a sibling
  // row expanding). Subscribing to the per-node measured size makes this
  // component re-render on every wrapper resize, and the layout effect
  // below re-runs the measurement.
  const getMeasuredForNode = useMemo(
    () => () => store.getMeasuredSize(nodeId),
    [store, nodeId]
  );
  const measuredSize = useSyncExternalStore(
    store.subscribeMeasuredSizes,
    getMeasuredForNode
  );

  useLayoutEffect(() => {
    measure();
  }, [measure, measuredSize]);

  useResizeObserver(elementRef, () => measure());

  // Unregister on unmount / id change.
  useLayoutEffect(() => {
    return () => {
      store.removePortPosition(nodeId, id);
    };
  }, [store, nodeId, id]);

  // ── Hover wiring ──
  //
  // Update the store's `hoveredPort` slice on enter/leave so node bodies,
  // edges, and other ports can react. Library guards against duplicate
  // notifications when the value doesn't actually change.
  const onPointerEnter = useCallback((): void => {
    const current = store.getHover();
    if (current.hoveredPort?.node === nodeId && current.hoveredPort.port === id)
      return;
    store.setHover({ ...current, hoveredPort: { node: nodeId, port: id } });
  }, [store, nodeId, id]);

  const onPointerLeave = useCallback((): void => {
    const current = store.getHover();
    if (current.hoveredPort?.node !== nodeId || current.hoveredPort.port !== id)
      return;
    store.setHover({ ...current, hoveredPort: null });
  }, [store, nodeId, id]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>): void => {
      onPortPointerDown(event, id);
    },
    [onPortPointerDown, id]
  );

  const hasCustomVisual = children !== undefined && children !== null;
  const isFilled = filled ?? connected;

  // Route the consumer's `color` into the slot via a CSS custom property so
  // the built-in visual (which paints with `currentColor`) picks it up,
  // while the source / candidate / invalid recipe variants can still
  // override `color` to keep connection-drag feedback visible.
  const portStyle: React.CSSProperties | undefined =
    color !== undefined
      ? { ['--etui-ng-port-color' as string]: color, ...style }
      : style;

  return (
    <span
      ref={elementRef}
      role="button"
      tabIndex={-1}
      aria-label={label ?? `${side} port ${id}`}
      data-node-id={nodeId}
      data-port-id={id}
      data-port-side={side}
      data-port-data-type={dataType}
      data-port-source={isSource || undefined}
      data-port-candidate={isCandidate || undefined}
      data-port-invalid={isInvalid || undefined}
      data-port-hovered={isHovered || undefined}
      data-port-connected={connected || undefined}
      className={cx(
        portSlotRecipe({
          side,
          custom: hasCustomVisual,
          source: isSource,
          candidate: isCandidate,
          invalid: isInvalid,
        }),
        className
      )}
      style={portStyle}
      onPointerDown={handlePointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {hasCustomVisual ? (
        children
      ) : (
        <NodeGraphPortVisual shape={shape} filled={isFilled} />
      )}
    </span>
  );
}

export const NodeGraphPort = React.memo(NodeGraphPortImpl);
NodeGraphPort.displayName = 'NodeGraphPort';
