'use client';

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { resolveVarValue } from '@/components/primitives/canvas/canvasTheme';
import { useLatest } from '@/hooks';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';

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
import { MINIMAP_SLOT } from './Minimap.types';
import { MinimapStoreContext, useMinimapDragState } from './MinimapContext';
import { computeMinimapHeight } from './minimapCoords';
import { drawMinimap } from './minimapDrawing';
import { MinimapStore } from './MinimapStore';
import { useMinimapGestures } from './useMinimapGestures';

import type {
  MinimapCornerSide,
  MinimapFooterPlacement,
  MinimapInteractionConfig,
  MinimapProps,
  MinimapSlotKind,
  MinimapSlotMarker,
  MinimapTitlePlacement,
} from './Minimap.types';
import type { MinimapDrawColors } from './minimapDrawing';

const DEFAULT_OUTSIDE_OVERLAY = 'rgba(0, 0, 0, 0.4)';

const DEFAULT_INTERACTIONS: Required<MinimapInteractionConfig> = {
  click: true,
  dragViewportRect: true,
  dragFromEmpty: true,
};

const DISABLED_INTERACTIONS: Required<MinimapInteractionConfig> = {
  click: false,
  dragViewportRect: false,
  dragFromEmpty: false,
};

interface CategorizedSlots {
  titleAbove: React.ReactNode;
  titleInside: React.ReactNode;
  footerBelow: React.ReactNode;
  footerInside: React.ReactNode;
  corners: Partial<Record<MinimapCornerSide, React.ReactNode>>;
  other: React.ReactNode[];
}

function getSlotKind(el: React.ReactElement): MinimapSlotKind | null {
  const marker = (el.type as Partial<MinimapSlotMarker>)[MINIMAP_SLOT];
  return marker ?? null;
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
    const kind = getSlotKind(child);
    if (kind === null) {
      // Dev warning: a child whose displayName looks like a Minimap slot
      // (e.g. wrapped in React.memo) but lost the symbol marker.
      if (process.env['NODE_ENV'] !== 'production') {
        const displayName = (child.type as { displayName?: string } | undefined)
          ?.displayName;
        if (displayName?.startsWith('Minimap.')) {
          console.warn(
            `[Minimap] child "${displayName}" looks like a slot subcomponent ` +
              `but is missing the MINIMAP_SLOT symbol marker. It will render ` +
              `as a free-form overlay. If you wrapped a slot subcomponent ` +
              `(e.g. with React.memo), copy the symbol onto the wrapper.`
          );
        }
      }
      slots.other.push(child);
      return;
    }

    const props = child.props as {
      children?: React.ReactNode;
      placement?: MinimapTitlePlacement | MinimapFooterPlacement;
      side?: MinimapCornerSide;
      className?: string;
      style?: React.CSSProperties;
    };

    if (kind === 'title') {
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
    } else if (kind === 'footer') {
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
    } else {
      // kind is narrowed to 'corner' here (only remaining slot kind).
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
    }
  });

  return slots;
}

/**
 * The interactive body that hosts canvas + overlay layer + pointer/keyboard
 * handlers. Subscribes to the drag slice for its `data-dragging` attribute
 * + aria-live announcement so neither lives in React state on the outer
 * shell.
 */
function MinimapBody({
  bodyRef,
  canvasRef,
  width,
  height,
  ariaLabel,
  disabled,
  handlers,
  overlayChildren,
  ariaLiveActive,
}: {
  bodyRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  ariaLabel: string;
  disabled: boolean;
  handlers: ReturnType<typeof useMinimapGestures>['handlers'];
  overlayChildren: React.ReactNode;
  ariaLiveActive: boolean;
}): React.ReactElement {
  const isDragging = useMinimapDragState();
  return (
    // The minimap body is a labelled landmark region that doubles as an
    // interactive pan/zoom surface (focusable, with pointer + key handlers).
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
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
      <div className={minimapOverlayLayerStyle}>{overlayChildren}</div>
      <div className={ariaLiveRegionStyle} aria-live="polite" role="status">
        {ariaLiveActive && isDragging ? 'Panning viewport' : ''}
      </div>
    </div>
  );
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
 * `useMinimapContext()` / `useMinimapHover()` / `useMinimapGeometry()` /
 * `useMinimapDragState()`.
 */
export const Minimap = ({
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
  ref,
  ...rest
}: MinimapProps): React.ReactElement => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const height = useMemo(
    () => computeMinimapHeight(width, worldBounds, minHeight, maxHeight),
    [width, worldBounds, minHeight, maxHeight]
  );
  const minimapSize = useMemo(() => ({ width, height }), [width, height]);

  const interactionsConfig = useMemo<Required<MinimapInteractionConfig>>(
    () =>
      interactions === false
        ? DISABLED_INTERACTIONS
        : {
            click: interactions.click ?? true,
            dragViewportRect: interactions.dragViewportRect ?? true,
            dragFromEmpty: interactions.dragFromEmpty ?? true,
          },
    [interactions]
  );

  // ── Store ──

  const store = useMemo(() => new MinimapStore(), []);

  useLayoutEffect(() => {
    store.setGeometry({ transform, viewportSize, worldBounds, minimapSize });
  }, [store, transform, viewportSize, worldBounds, minimapSize]);

  useLayoutEffect(() => {
    store.configureHandle({
      focus: () => bodyRef.current?.focus(),
      getElement: () => bodyRef.current,
    });
  }, [store]);

  useImperativeHandle(ref, () => store.handle, [store]);

  // ── Gestures ──

  const { handlers } = useMinimapGestures({
    containerRef: bodyRef,
    store,
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

  // ── Draw — useLayoutEffect + scheduleDraw, theme resolved per-frame ──

  const renderOverlayRef = useLatest(renderOverlay);
  const itemsRef = useLatest(items);
  const rafRef = useRef<number>(0);

  const scheduleDraw = useCallback((): void => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const targetW = Math.max(1, Math.round(width * dpr));
      const targetH = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const colors: MinimapDrawColors = {
        background:
          backgroundColor ??
          resolveVarValue(canvas, vars.colors.background.secondary),
        defaultItem:
          defaultItemColor ??
          resolveVarValue(canvas, vars.colors.accent.primary),
        viewportRectStroke:
          viewportRectStroke ??
          resolveVarValue(canvas, vars.colors.accent.primary),
        outsideOverlay,
      };

      drawMinimap({
        ctx,
        size: { width, height },
        worldBounds,
        transform,
        viewportSize,
        items: itemsRef.current,
        colors,
        renderOverlay: renderOverlayRef.current,
      });
    });
  }, [
    width,
    height,
    worldBounds,
    transform,
    viewportSize,
    backgroundColor,
    defaultItemColor,
    viewportRectStroke,
    outsideOverlay,
    itemsRef,
    renderOverlayRef,
  ]);

  useLayoutEffect(() => {
    scheduleDraw();
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleDraw]);

  // Redraw when DPR changes (e.g. dragging to a different display).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
    const handler = (): void => {
      scheduleDraw();
    };
    mq.addEventListener('change', handler);
    return () => {
      mq.removeEventListener('change', handler);
    };
  }, [scheduleDraw]);

  // ── Slots ──

  const slots = useMemo(() => categorizeChildren(children), [children]);

  const overlayChildren = (
    <>
      {slots.titleInside}
      {slots.footerInside}
      {slots.corners['top-left']}
      {slots.corners['top-right']}
      {slots.corners['bottom-left']}
      {slots.corners['bottom-right']}
      {slots.other}
    </>
  );

  return (
    <MinimapStoreContext.Provider value={store}>
      <div
        className={cx(minimapShellStyle, className)}
        data-testid={testId}
        id={id}
        style={style}
        {...rest}
      >
        {slots.titleAbove}
        <MinimapBody
          bodyRef={bodyRef}
          canvasRef={canvasRef}
          width={width}
          height={height}
          ariaLabel={ariaLabel}
          disabled={disabled}
          handlers={handlers}
          overlayChildren={overlayChildren}
          ariaLiveActive={!disabled}
        />
        {slots.footerBelow}
      </div>
    </MinimapStoreContext.Provider>
  );
};

Minimap.displayName = 'Minimap';
