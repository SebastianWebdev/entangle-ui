'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cx } from '@/utils/cx';
import { vars } from '@/theme/contract.css';
import { resolveVarValue } from '@/components/primitives/canvas/canvasTheme';
import type {
  MinimapContextValue,
  MinimapCornerSide,
  MinimapFooterPlacement,
  MinimapProps,
  MinimapTitlePlacement,
} from './Minimap.types';
import {
  minimapShellStyle,
  minimapBodyStyle,
  minimapCanvasStyle,
  minimapOverlayLayerStyle,
  titleOutsideStyle,
  titleInsideStyle,
  footerOutsideStyle,
  footerInsideStyle,
  cornerTopLeftStyle,
  cornerTopRightStyle,
  cornerBottomLeftStyle,
  cornerBottomRightStyle,
  ariaLiveRegionStyle,
} from './Minimap.css';
import { computeMinimapHeight } from './minimapCoords';
import { drawMinimap, type MinimapDrawColors } from './minimapDrawing';
import { useMinimapGestures } from './useMinimapGestures';
import { MinimapContext } from './MinimapContext';

const DEFAULT_INTERACTIONS = {
  click: true,
  dragViewportRect: true,
  dragFromEmpty: true,
} as const;
const DEFAULT_OUTSIDE_OVERLAY = 'rgba(0, 0, 0, 0.4)';
const FALLBACK_BG = '#1a1a1a';
const FALLBACK_ACCENT = '#4a86c8';

interface CategorizedSlots {
  titleAbove: React.ReactNode;
  titleInside: React.ReactNode;
  footerBelow: React.ReactNode;
  footerInside: React.ReactNode;
  corners: Partial<Record<MinimapCornerSide, React.ReactNode>>;
  other: React.ReactNode[];
}

function getDisplayName(el: React.ReactElement): string | undefined {
  return (el.type as { displayName?: string } | undefined)?.displayName;
}

function categorizeChildren(children: React.ReactNode): CategorizedSlots {
  const slots: CategorizedSlots = {
    titleAbove: null,
    titleInside: null,
    footerBelow: null,
    footerInside: null,
    corners: {},
    other: [],
  };

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      if (child !== null && child !== undefined && child !== false) {
        slots.other.push(child);
      }
      return;
    }
    const name = getDisplayName(child);
    const props = child.props as {
      children?: React.ReactNode;
      placement?: MinimapTitlePlacement | MinimapFooterPlacement;
      side?: MinimapCornerSide;
      className?: string;
      style?: React.CSSProperties;
    };

    if (name === 'Minimap.Title') {
      const placement: MinimapTitlePlacement =
        props.placement === 'top-inside' ? 'top-inside' : 'top-outside';
      const node = (
        <div
          className={cx(
            placement === 'top-inside' ? titleInsideStyle : titleOutsideStyle,
            props.className
          )}
          style={props.style}
        >
          {props.children}
        </div>
      );
      if (placement === 'top-inside') slots.titleInside = node;
      else slots.titleAbove = node;
    } else if (name === 'Minimap.Footer') {
      const placement: MinimapFooterPlacement =
        props.placement === 'bottom-inside'
          ? 'bottom-inside'
          : 'bottom-outside';
      const node = (
        <div
          className={cx(
            placement === 'bottom-inside'
              ? footerInsideStyle
              : footerOutsideStyle,
            props.className
          )}
          style={props.style}
        >
          {props.children}
        </div>
      );
      if (placement === 'bottom-inside') slots.footerInside = node;
      else slots.footerBelow = node;
    } else if (name === 'Minimap.Corner') {
      const side: MinimapCornerSide = props.side ?? 'top-right';
      const cornerStyle =
        side === 'top-left'
          ? cornerTopLeftStyle
          : side === 'top-right'
            ? cornerTopRightStyle
            : side === 'bottom-left'
              ? cornerBottomLeftStyle
              : cornerBottomRightStyle;
      slots.corners[side] = (
        <div className={cx(cornerStyle, props.className)} style={props.style}>
          {props.children}
        </div>
      );
    } else {
      slots.other.push(child);
    }
  });

  return slots;
}

/**
 * Compact navigation widget for editor viewports. Renders a miniature of
 * the world content alongside a draggable rectangle that mirrors the main
 * viewport's visible region. Intended to be shared by NodeGraph, Timeline,
 * and any custom 2D editor surface.
 *
 * Designed as a controlled primitive — pass the current `transform` /
 * `viewportSize` from your `<Viewport>` and translate `onNavigate.worldPoint`
 * into a `viewport.centerOn(...)` call.
 *
 * Children may include `<Minimap.Title>`, `<Minimap.Footer>`,
 * `<Minimap.Corner>` slot subcomponents — any other nodes render as a
 * free-form overlay layer above the canvas body. Children can read live
 * state (hover position, hovered item id, transform) via
 * `useMinimapContext()`.
 */
export const Minimap: React.FC<MinimapProps> = ({
  items,
  worldBounds,
  transform,
  viewportSize,
  onNavigate,
  width = 200,
  minHeight = 60,
  maxHeight = 200,
  interactions = DEFAULT_INTERACTIONS,
  keyboardPanStep = 0.1,
  backgroundColor,
  defaultItemColor,
  viewportRectStroke,
  outsideOverlay = DEFAULT_OUTSIDE_OVERLAY,
  renderOverlay,
  disabled = false,
  ariaLabel = 'Minimap',
  className,
  style,
  testId,
  id,
  children,
  ...rest
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const height = useMemo(
    () => computeMinimapHeight(width, worldBounds, minHeight, maxHeight),
    [width, worldBounds, minHeight, maxHeight]
  );
  const minimapSize = useMemo(() => ({ width, height }), [width, height]);

  const interactionsConfig = useMemo(() => {
    if (interactions === false) {
      return {
        click: false,
        dragViewportRect: false,
        dragFromEmpty: false,
      } as const;
    }
    return {
      click: interactions.click ?? true,
      dragViewportRect: interactions.dragViewportRect ?? true,
      dragFromEmpty: interactions.dragFromEmpty ?? true,
    };
  }, [interactions]);

  const {
    handlers,
    isDragging,
    hoverMinimapPoint,
    hoverWorldPoint,
    hoveredItemId,
  } = useMinimapGestures({
    containerRef: bodyRef,
    worldBounds,
    transform,
    viewportSize,
    minimapSize,
    items,
    interactions: interactionsConfig,
    keyboardPanStep,
    disabled,
    onNavigate,
  });

  const [resolvedColors, setResolvedColors] = useState<MinimapDrawColors>({
    background: backgroundColor ?? FALLBACK_BG,
    defaultItem: defaultItemColor ?? FALLBACK_ACCENT,
    viewportRectStroke: viewportRectStroke ?? FALLBACK_ACCENT,
    outsideOverlay,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setResolvedColors({
      background:
        backgroundColor ??
        resolveVarValue(canvas, vars.colors.background.secondary),
      defaultItem:
        defaultItemColor ?? resolveVarValue(canvas, vars.colors.accent.primary),
      viewportRectStroke:
        viewportRectStroke ??
        resolveVarValue(canvas, vars.colors.accent.primary),
      outsideOverlay,
    });
  }, [backgroundColor, defaultItemColor, viewportRectStroke, outsideOverlay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const raf = requestAnimationFrame(() => {
      drawMinimap({
        ctx,
        size: { width, height },
        worldBounds,
        transform,
        viewportSize,
        items,
        colors: resolvedColors,
        renderOverlay,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [
    width,
    height,
    worldBounds,
    transform,
    viewportSize,
    items,
    resolvedColors,
    renderOverlay,
  ]);

  const slots = useMemo(() => categorizeChildren(children), [children]);

  const contextValue = useMemo<MinimapContextValue>(
    () => ({
      worldBounds,
      minimapSize,
      transform,
      viewportSize,
      hoverWorldPoint,
      hoverMinimapPoint,
      hoveredItemId,
      isDragging,
    }),
    [
      worldBounds,
      minimapSize,
      transform,
      viewportSize,
      hoverWorldPoint,
      hoverMinimapPoint,
      hoveredItemId,
      isDragging,
    ]
  );

  return (
    <MinimapContext.Provider value={contextValue}>
      <div
        className={cx(minimapShellStyle, className)}
        data-testid={testId}
        id={id}
        style={style}
        {...rest}
      >
        {slots.titleAbove}
        <div
          ref={bodyRef}
          className={minimapBodyStyle}
          data-dragging={isDragging || undefined}
          data-disabled={disabled || undefined}
          role="region"
          aria-label={ariaLabel}
          tabIndex={disabled ? -1 : 0}
          style={{ width, height }}
          onPointerDown={handlers.onPointerDown}
          onPointerMove={handlers.onPointerMove}
          onPointerUp={handlers.onPointerUp}
          onPointerCancel={handlers.onPointerCancel}
          onPointerLeave={handlers.onPointerLeave}
          onKeyDown={handlers.onKeyDown}
        >
          <canvas
            ref={canvasRef}
            className={minimapCanvasStyle}
            style={{ width, height }}
          />
          <div className={minimapOverlayLayerStyle}>
            {slots.titleInside}
            {slots.footerInside}
            {slots.corners['top-left']}
            {slots.corners['top-right']}
            {slots.corners['bottom-left']}
            {slots.corners['bottom-right']}
            {slots.other}
          </div>
          <div className={ariaLiveRegionStyle} aria-live="polite" role="status">
            {isDragging ? 'Panning viewport' : ''}
          </div>
        </div>
        {slots.footerBelow}
      </div>
    </MinimapContext.Provider>
  );
};

Minimap.displayName = 'Minimap';
