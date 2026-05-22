'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/primitives/Button';
import { useViewportStore } from '@/components/primitives/viewport/ViewportContext';
import { cx } from '@/utils/cx';
import {
  nodeGraphToolbarRecipe,
  nodeGraphToolbarSeparatorStyle,
} from './NodeGraph.css';
import { useNodeGraphStore } from './NodeGraphContext';
import { useStoreSlice } from './useStoreSlice';
import { computeNodesBounds } from './nodeGraphMath';
import type { NodeGraphToolbarSlotProps } from './NodeGraph.types';

/**
 * Live renderer for `<NodeGraph.Toolbar>`. Mounted inside the
 * `<ViewportOverlay>` so the toolbar sits above the graph but ignores
 * pan/zoom (toolbar buttons stay anchored to a viewport corner).
 *
 * Pointer events are auto-handled — the wrapper enables them so clicks
 * on toolbar buttons don't fall through to the underlying graph (which
 * would start a marquee selection).
 */
export function NodeGraphToolbarInner({
  placement = 'top-left',
  margin = 12,
  gap = 4,
  className,
  style,
  children,
}: NodeGraphToolbarSlotProps): React.ReactElement {
  return (
    <div
      className={cx(nodeGraphToolbarRecipe({ placement }), className)}
      style={{
        margin,
        gap,
        ...style,
      }}
      onPointerDown={e => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

/**
 * Visual separator for grouping toolbar buttons. Just a 1 px line; pass
 * `orientation="vertical"` (default) inside a horizontal toolbar.
 */
export interface NodeGraphToolbarSeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function NodeGraphToolbarSeparator({
  orientation = 'vertical',
  className,
}: NodeGraphToolbarSeparatorProps): React.ReactElement {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cx(nodeGraphToolbarSeparatorStyle, className)}
      style={
        orientation === 'horizontal'
          ? { width: '100%', height: 1 }
          : { width: 1, height: 18 }
      }
    />
  );
}

// ─── Action buttons ────────────────────────────────────────────────

interface CommonButtonProps {
  /** Override the label text. */
  label?: React.ReactNode;
  /** Override the icon (replaces the default). */
  icon?: React.ReactNode;
  /** Pass-through to the underlying `<Button>`. */
  size?: 'sm' | 'md' | 'lg';
  /** Pass-through variant. */
  variant?: 'default' | 'ghost' | 'filled';
  /** Extra class on the button. */
  className?: string;
  /** Inline style override. */
  style?: React.CSSProperties;
  /** Override the title / tooltip. */
  title?: string;
}

/** Fit all nodes inside the viewport. Calls the same code path as `ref.fitToContent`. */
export interface NodeGraphFitContentButtonProps extends CommonButtonProps {
  /** World-unit padding around the fitted bounds. @default 32 */
  padding?: number;
}

export function NodeGraphFitContentButton({
  padding = 32,
  label = 'Fit',
  icon = '⊕',
  size = 'sm',
  variant = 'ghost',
  className,
  style,
  title = 'Fit all content in viewport',
}: NodeGraphFitContentButtonProps): React.ReactElement {
  const ngStore = useNodeGraphStore();
  const vpStore = useViewportStore();
  const onClick = useCallback((): void => {
    const data = ngStore.getData();
    const bounds = computeNodesBounds(
      data.nodes,
      ngStore.getMeasuredSize,
      data.defaultNodeSize
    );
    if (bounds.width === 0 && bounds.height === 0) return;
    vpStore.handle.fitToContent(bounds, padding);
  }, [ngStore, vpStore, padding]);
  return (
    <Button
      size={size}
      variant={variant}
      onClick={onClick}
      className={className}
      style={style}
      title={title}
      aria-label={title}
    >
      {icon != null ? <span aria-hidden="true">{icon}</span> : null}
      {label}
    </Button>
  );
}

/**
 * Fit the currently-selected nodes inside the viewport. Disabled when
 * the selection contains no nodes — reads the live selection slice so
 * the button's disabled state updates without consumer plumbing.
 */
export interface NodeGraphFitSelectionButtonProps extends CommonButtonProps {
  padding?: number;
}

export function NodeGraphFitSelectionButton({
  padding = 64,
  label = 'Fit selection',
  icon = '◎',
  size = 'sm',
  variant = 'ghost',
  className,
  style,
  title = 'Fit selected nodes in viewport',
}: NodeGraphFitSelectionButtonProps): React.ReactElement {
  const ngStore = useNodeGraphStore();
  const vpStore = useViewportStore();
  // Live disabled state — re-renders when the selection slice changes.
  const hasNodeSelection = useStoreSlice(
    ngStore.subscribeSelection,
    ngStore.getSelection,
    sel => sel.nodes.length > 0
  );
  const onClick = useCallback((): void => {
    const data = ngStore.getData();
    const sel = ngStore.getSelection();
    if (sel.nodes.length === 0) return;
    const selectedNodes = data.nodes.filter(n => sel.nodes.includes(n.id));
    const bounds = computeNodesBounds(
      selectedNodes,
      ngStore.getMeasuredSize,
      data.defaultNodeSize
    );
    if (bounds.width === 0 && bounds.height === 0) return;
    vpStore.handle.fitToContent(bounds, padding);
  }, [ngStore, vpStore, padding]);
  return (
    <Button
      size={size}
      variant={variant}
      onClick={onClick}
      disabled={!hasNodeSelection}
      className={className}
      style={style}
      title={title}
      aria-label={title}
    >
      {icon != null ? <span aria-hidden="true">{icon}</span> : null}
      {label}
    </Button>
  );
}

/** Zoom in by a fixed factor (default 1.25×). */
export interface NodeGraphZoomButtonProps extends CommonButtonProps {
  /** Multiplier applied to the current zoom. @default 1.25 */
  factor?: number;
}

function applyZoomStep(
  vpStore: ReturnType<typeof useViewportStore>,
  factor: number
): void {
  const t = vpStore.getTransform();
  const size = vpStore.getSize();
  // Anchor zoom at the viewport centre so the visible content stays put.
  const centerScreen = { x: size.width / 2, y: size.height / 2 };
  const centerWorld = {
    x: (centerScreen.x - t.x) / t.zoom,
    y: (centerScreen.y - t.y) / t.zoom,
  };
  const nextZoom = t.zoom * factor;
  // Reposition pan so `centerWorld` stays under `centerScreen` at the new zoom.
  vpStore.handle.centerOn(centerWorld, nextZoom);
}

export function NodeGraphZoomInButton({
  factor = 1.25,
  label = '',
  icon = '+',
  size = 'sm',
  variant = 'ghost',
  className,
  style,
  title = 'Zoom in',
}: NodeGraphZoomButtonProps): React.ReactElement {
  const vpStore = useViewportStore();
  return (
    <Button
      size={size}
      variant={variant}
      onClick={() => applyZoomStep(vpStore, factor)}
      className={className}
      style={style}
      title={title}
      aria-label={title}
    >
      {icon != null ? <span aria-hidden="true">{icon}</span> : null}
      {label}
    </Button>
  );
}

export function NodeGraphZoomOutButton({
  factor = 1.25,
  label = '',
  icon = '−',
  size = 'sm',
  variant = 'ghost',
  className,
  style,
  title = 'Zoom out',
}: NodeGraphZoomButtonProps): React.ReactElement {
  const vpStore = useViewportStore();
  return (
    <Button
      size={size}
      variant={variant}
      onClick={() => applyZoomStep(vpStore, 1 / factor)}
      className={className}
      style={style}
      title={title}
      aria-label={title}
    >
      {icon != null ? <span aria-hidden="true">{icon}</span> : null}
      {label}
    </Button>
  );
}

/** Reset zoom to 1× centred on the world origin. */
export function NodeGraphResetZoomButton({
  label = '1:1',
  icon,
  size = 'sm',
  variant = 'ghost',
  className,
  style,
  title = 'Reset zoom to 100%',
}: CommonButtonProps): React.ReactElement {
  const vpStore = useViewportStore();
  return (
    <Button
      size={size}
      variant={variant}
      onClick={() => vpStore.handle.centerOn({ x: 0, y: 0 }, 1)}
      className={className}
      style={style}
      title={title}
      aria-label={title}
    >
      {icon != null ? <span aria-hidden="true">{icon}</span> : null}
      {label}
    </Button>
  );
}
