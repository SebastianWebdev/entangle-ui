'use client';

import { useCallback, useRef, useState } from 'react';
import type React from 'react';
import type {
  ViewportTransform,
  ViewportSize,
  WorldRect,
} from '@/components/primitives/viewport';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type {
  MinimapInteractionConfig,
  MinimapNavigateInfo,
} from './Minimap.types';
import {
  getViewportCenterWorld,
  getViewportRectOnMinimap,
  minimapToWorld,
} from './minimapCoords';

const CLICK_THRESHOLD_PX = 3;

interface UseMinimapGesturesOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  worldBounds: WorldRect;
  transform: ViewportTransform;
  viewportSize: ViewportSize;
  minimapSize: ViewportSize;
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
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  };
  isDragging: boolean;
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

export function useMinimapGestures(
  opts: UseMinimapGesturesOptions
): UseMinimapGesturesReturn {
  const {
    containerRef,
    worldBounds,
    transform,
    viewportSize,
    minimapSize,
    interactions,
    keyboardPanStep,
    disabled,
    onNavigate,
  } = opts;

  const stateRef = useRef<PointerState | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const emit = useCallback(
    (info: MinimapNavigateInfo): void => {
      onNavigate?.(info);
    },
    [onNavigate]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      if (disabled || e.button !== 0) return;
      const container = containerRef.current;
      if (!container) return;

      const screen = getLocalPointerPosition(e, container);
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
        setIsDragging(true);
        emit({ worldPoint, phase: 'drag-start' });
      } else if (mode === 'drag-rect') {
        setIsDragging(true);
        const center = getViewportCenterWorld(transform, viewportSize);
        emit({ worldPoint: center, phase: 'drag-start' });
      }
    },
    [
      containerRef,
      disabled,
      interactions,
      transform,
      viewportSize,
      worldBounds,
      minimapSize,
      emit,
    ]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const state = stateRef.current;
      if (state?.pointerId !== e.pointerId) return;
      const container = containerRef.current;
      if (!container) return;

      const screen = getLocalPointerPosition(e, container);
      const dx = screen.x - state.startScreen.x;
      const dy = screen.y - state.startScreen.y;
      const moved = Math.hypot(dx, dy) >= CLICK_THRESHOLD_PX;

      if (state.mode === 'pending-click') {
        if (!moved) return;
        if (interactions.dragFromEmpty) {
          state.mode = 'drag-pan';
          setIsDragging(true);
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

      if (state.mode === 'drag-rect') {
        const pointerWorld = minimapToWorld(screen, worldBounds, minimapSize);
        const offset = state.grabOffsetWorld ?? { x: 0, y: 0 };
        emit({
          worldPoint: {
            x: pointerWorld.x - offset.x,
            y: pointerWorld.y - offset.y,
          },
          phase: 'drag',
        });
      }
    },
    [containerRef, worldBounds, minimapSize, interactions, emit]
  );

  const endGesture = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean): void => {
      const state = stateRef.current;
      if (state?.pointerId !== e.pointerId) return;
      const container = containerRef.current;
      if (container?.hasPointerCapture(e.pointerId)) {
        container.releasePointerCapture(e.pointerId);
      }

      if (!cancelled) {
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
      setIsDragging(false);
    },
    [containerRef, worldBounds, minimapSize, emit]
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
      if (disabled) return;
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
    [disabled, transform, viewportSize, keyboardPanStep, emit]
  );

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onKeyDown: handleKeyDown,
    },
    isDragging,
  };
}
