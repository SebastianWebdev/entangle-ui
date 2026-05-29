'use client';

import { useCallback, useMemo, useRef } from 'react';

import { useLatest } from '@/hooks';

import {
  getViewportCenterWorld,
  getViewportRectOnMinimap,
  minimapToWorld,
} from './minimapCoords';
import { hitTestItems } from './minimapHitTest';

import type {
  MinimapInteractionConfig,
  MinimapItem,
  MinimapNavigateInfo,
} from './Minimap.types';
import type { MinimapStore } from './MinimapStore';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type {
  ViewportSize,
  ViewportTransform,
  WorldRect,
} from '@/components/primitives/viewport';
import type React from 'react';

const CLICK_THRESHOLD_PX = 3;
/** Hover line-picking tolerance, in minimap CSS px. Translated to world units per gesture. */
const LINE_HIT_TOLERANCE_MINIMAP_PX = 4;

interface UseMinimapGesturesOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  store: MinimapStore;
  worldBounds: WorldRect;
  transform: ViewportTransform;
  viewportSize: ViewportSize;
  minimapSize: ViewportSize;
  items: ReadonlyArray<MinimapItem>;
  interactions: Required<MinimapInteractionConfig>;
  keyboardPanStep: number;
  disabled: boolean;
  onNavigate: ((info: MinimapNavigateInfo) => void) | undefined;
}

type GestureMode = 'pending-click' | 'drag-rect' | 'drag-pan' | 'cancelled';

interface PointerState {
  pointerId: number;
  mode: GestureMode;
  startScreen: Point2D;
  /** Drag-rect only: world-space offset from viewport center at drag-start. */
  grabOffsetWorld?: Point2D;
}

interface UseMinimapGesturesReturn {
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  };
}

function getLocalPointerPosition(
  e: React.PointerEvent<HTMLDivElement>,
  container: HTMLDivElement | null
): Point2D {
  if (!container) return { x: 0, y: 0 };
  const rect = container.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function pointInRect(
  p: Point2D,
  r: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height
  );
}

/**
 * Pointer + keyboard gesture machine for `<Minimap>`. All live props and
 * the `onNavigate` callback are read through `useLatest` refs so the
 * returned handlers are stable for the lifetime of the component —
 * pointer event listeners never re-attach on prop changes.
 *
 * Hover state and drag state are written directly to the `MinimapStore`,
 * not local React state, so slice subscribers (`useMinimapHover`,
 * `useMinimapDragState`) re-render independently and don't see the rest
 * of the world thrash.
 */
export function useMinimapGestures(
  opts: UseMinimapGesturesOptions
): UseMinimapGesturesReturn {
  const { containerRef, store } = opts;

  // Live refs — handlers always see the latest values without re-binding.
  const worldBoundsRef = useLatest(opts.worldBounds);
  const transformRef = useLatest(opts.transform);
  const viewportSizeRef = useLatest(opts.viewportSize);
  const minimapSizeRef = useLatest(opts.minimapSize);
  const itemsRef = useLatest(opts.items);
  const interactionsRef = useLatest(opts.interactions);
  const keyboardPanStepRef = useLatest(opts.keyboardPanStep);
  const disabledRef = useLatest(opts.disabled);
  const onNavigateRef = useLatest(opts.onNavigate);

  const stateRef = useRef<PointerState | null>(null);

  const emit = useCallback(
    (info: MinimapNavigateInfo): void => {
      onNavigateRef.current?.(info);
    },
    [onNavigateRef]
  );

  const updateHover = useCallback(
    (screen: Point2D | null): void => {
      if (!screen) {
        store.setHover({ hoverWorldPoint: null, hoveredItemId: null });
        return;
      }
      const worldBounds = worldBoundsRef.current;
      const minimapSize = minimapSizeRef.current;
      const items = itemsRef.current;
      const worldPoint = minimapToWorld(screen, worldBounds, minimapSize);
      const scaleX =
        worldBounds.width > 0 ? minimapSize.width / worldBounds.width : 1;
      const scaleY =
        worldBounds.height > 0 ? minimapSize.height / worldBounds.height : 1;
      const scale = Math.min(scaleX, scaleY) || 1;
      const tolerance = LINE_HIT_TOLERANCE_MINIMAP_PX / scale;
      store.setHover({
        hoverWorldPoint: worldPoint,
        hoveredItemId: hitTestItems(worldPoint, items, tolerance),
      });
    },
    [store, worldBoundsRef, minimapSizeRef, itemsRef]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      if (disabledRef.current || e.button !== 0) return;
      const container = containerRef.current;
      if (!container) return;

      const screen = getLocalPointerPosition(e, container);
      const worldBounds = worldBoundsRef.current;
      const minimapSize = minimapSizeRef.current;
      const transform = transformRef.current;
      const viewportSize = viewportSizeRef.current;
      const interactions = interactionsRef.current;

      const viewportRect = getViewportRectOnMinimap(
        transform,
        viewportSize,
        worldBounds,
        minimapSize
      );
      const inside = pointInRect(screen, viewportRect);

      let mode: GestureMode | null = null;
      let grabOffsetWorld: Point2D | undefined;

      if (inside && interactions.dragViewportRect) {
        mode = 'drag-rect';
        const pointerWorld = minimapToWorld(screen, worldBounds, minimapSize);
        const center = getViewportCenterWorld(transform, viewportSize);
        grabOffsetWorld = {
          x: pointerWorld.x - center.x,
          y: pointerWorld.y - center.y,
        };
      } else if (!inside && interactions.click) {
        // Tap-vs-drag is resolved on pointermove / pointerup.
        // dragFromEmpty (if enabled) takes over after the click threshold.
        mode = 'pending-click';
      } else if (!inside && interactions.dragFromEmpty) {
        mode = 'drag-pan';
      } else {
        return;
      }

      e.preventDefault();
      container.setPointerCapture(e.pointerId);

      stateRef.current = {
        pointerId: e.pointerId,
        mode,
        startScreen: screen,
        grabOffsetWorld,
      };

      if (mode === 'drag-pan') {
        const worldPoint = minimapToWorld(screen, worldBounds, minimapSize);
        store.setIsDragging(true);
        emit({ worldPoint, phase: 'drag-start' });
      } else if (mode === 'drag-rect') {
        store.setIsDragging(true);
        const center = getViewportCenterWorld(transform, viewportSize);
        emit({ worldPoint: center, phase: 'drag-start' });
      }
    },
    [
      containerRef,
      disabledRef,
      interactionsRef,
      transformRef,
      viewportSizeRef,
      worldBoundsRef,
      minimapSizeRef,
      store,
      emit,
    ]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const container = containerRef.current;
      if (!container) return;
      const screen = getLocalPointerPosition(e, container);
      // Always update hover state — independent of gesture capture.
      updateHover(screen);

      const state = stateRef.current;
      if (state?.pointerId !== e.pointerId) return;

      const worldBounds = worldBoundsRef.current;
      const minimapSize = minimapSizeRef.current;
      const interactions = interactionsRef.current;

      const dx = screen.x - state.startScreen.x;
      const dy = screen.y - state.startScreen.y;
      const moved = Math.hypot(dx, dy) >= CLICK_THRESHOLD_PX;

      if (state.mode === 'pending-click') {
        if (!moved) return;
        if (interactions.dragFromEmpty) {
          state.mode = 'drag-pan';
          store.setIsDragging(true);
          const worldPoint = minimapToWorld(screen, worldBounds, minimapSize);
          emit({ worldPoint, phase: 'drag-start' });
        } else {
          // Threshold exceeded but drag-from-empty is disabled — cancel the click.
          state.mode = 'cancelled';
        }
        return;
      }

      if (state.mode === 'cancelled') return;

      if (state.mode === 'drag-pan') {
        const worldPoint = minimapToWorld(screen, worldBounds, minimapSize);
        emit({ worldPoint, phase: 'drag' });
        return;
      }

      // Only 'drag-rect' remains after the early returns above.
      const pointerWorld = minimapToWorld(screen, worldBounds, minimapSize);
      const offset = state.grabOffsetWorld ?? { x: 0, y: 0 };
      emit({
        worldPoint: {
          x: pointerWorld.x - offset.x,
          y: pointerWorld.y - offset.y,
        },
        phase: 'drag',
      });
    },
    [
      containerRef,
      worldBoundsRef,
      minimapSizeRef,
      interactionsRef,
      store,
      emit,
      updateHover,
    ]
  );

  const handlePointerLeave = useCallback((): void => {
    if (stateRef.current) return; // keep hover during drag (pointer capture)
    updateHover(null);
  }, [updateHover]);

  const endGesture = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean): void => {
      const state = stateRef.current;
      if (state?.pointerId !== e.pointerId) return;
      const container = containerRef.current;
      if (container?.hasPointerCapture(e.pointerId)) {
        container.releasePointerCapture(e.pointerId);
      }

      if (!cancelled) {
        const worldBounds = worldBoundsRef.current;
        const minimapSize = minimapSizeRef.current;
        const screen = getLocalPointerPosition(e, container);
        if (state.mode === 'pending-click') {
          const worldPoint = minimapToWorld(
            state.startScreen,
            worldBounds,
            minimapSize
          );
          emit({ worldPoint, phase: 'click' });
        } else if (state.mode === 'drag-pan') {
          const worldPoint = minimapToWorld(screen, worldBounds, minimapSize);
          emit({ worldPoint, phase: 'drag-end' });
        } else if (state.mode === 'drag-rect') {
          const pointerWorld = minimapToWorld(screen, worldBounds, minimapSize);
          const offset = state.grabOffsetWorld ?? { x: 0, y: 0 };
          emit({
            worldPoint: {
              x: pointerWorld.x - offset.x,
              y: pointerWorld.y - offset.y,
            },
            phase: 'drag-end',
          });
        }
      }

      stateRef.current = null;
      store.setIsDragging(false);
    },
    [containerRef, worldBoundsRef, minimapSizeRef, store, emit]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      endGesture(e, false);
    },
    [endGesture]
  );

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      endGesture(e, true);
    },
    [endGesture]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      if (disabledRef.current) return;
      let dx = 0;
      let dy = 0;
      switch (e.key) {
        case 'ArrowLeft':
          dx = -1;
          break;
        case 'ArrowRight':
          dx = 1;
          break;
        case 'ArrowUp':
          dy = -1;
          break;
        case 'ArrowDown':
          dy = 1;
          break;
        default:
          return;
      }
      e.preventDefault();

      const transform = transformRef.current;
      const viewportSize = viewportSizeRef.current;
      const keyboardPanStep = keyboardPanStepRef.current;

      const zoom = transform.zoom === 0 ? 1 : transform.zoom;
      const worldViewW = viewportSize.width / zoom;
      const worldViewH = viewportSize.height / zoom;
      const stepMul = e.shiftKey ? 5 : 1;
      const stepW = worldViewW * keyboardPanStep * stepMul;
      const stepH = worldViewH * keyboardPanStep * stepMul;

      const currentCenter = getViewportCenterWorld(transform, viewportSize);
      emit({
        worldPoint: {
          x: currentCenter.x + dx * stepW,
          y: currentCenter.y + dy * stepH,
        },
        phase: 'click',
      });
    },
    [disabledRef, transformRef, viewportSizeRef, keyboardPanStepRef, emit]
  );

  const handlers = useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerLeave,
      onKeyDown: handleKeyDown,
    }),
    [
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerCancel,
      handlePointerLeave,
      handleKeyDown,
    ]
  );

  return { handlers };
}
