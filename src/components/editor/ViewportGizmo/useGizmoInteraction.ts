'use client';

import { useState, useCallback, useMemo, useRef } from 'react';

import { clamp } from '@/utils/mathUtils';

import { gizmoHitTest, axisToPresetView } from './gizmoMath';

import type {
  GizmoOrientation,
  GizmoUpAxis,
  GizmoPresetView,
  GizmoHitRegion,
  OrbitDelta,
} from './ViewportGizmo.types';
import type React from 'react';

interface UseGizmoInteractionOptions {
  orientation: GizmoOrientation;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  diameter: number;
  upAxis: GizmoUpAxis;
  interactionMode: 'full' | 'snap-only' | 'orbit-only' | 'display-only';
  orbitSpeed: number;
  constrainPitch: boolean;
  invertYaw: boolean;
  invertPitch: boolean;
  disabled: boolean;
  onOrbit?: (delta: OrbitDelta) => void;
  onOrbitEnd?: (finalOrientation: GizmoOrientation) => void;
  onSnapToView?: (view: GizmoPresetView) => void;
  onAxisClick?: (axis: 'x' | 'y' | 'z', positive: boolean) => void;
  onOriginClick?: () => void;
}

interface UseGizmoInteractionReturn {
  isDragging: boolean;
  hoveredRegion: GizmoHitRegion;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
}

const NONE_HIT: GizmoHitRegion = { type: 'none', distance: Infinity };

const ORBIT_KEY_STEP = 15;
const ORBIT_FINE_STEP = 5;

export function useGizmoInteraction(
  options: UseGizmoInteractionOptions
): UseGizmoInteractionReturn {
  const {
    orientation,
    canvasRef,
    diameter,
    upAxis,
    interactionMode,
    orbitSpeed,
    constrainPitch,
    invertYaw,
    invertPitch,
    disabled,
    onOrbit,
    onOrbitEnd,
    onSnapToView,
    onAxisClick,
    onOriginClick,
  } = options;

  const [hoveredRegion, setHoveredRegion] = useState<GizmoHitRegion>(NONE_HIT);
  // Ref drives synchronous reads inside the pointer handlers; the state mirror
  // is the value exposed for rendering (kept in sync on drag start/end).
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const allowSnap =
    interactionMode === 'full' || interactionMode === 'snap-only';
  const allowOrbit =
    interactionMode === 'full' || interactionMode === 'orbit-only';

  const armLength = (diameter / 2) * 0.65;
  const center = useMemo(
    () => ({ x: diameter / 2, y: diameter / 2 }),
    [diameter]
  );

  const getPointerPos = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { px: 0, py: 0 };
      const rect = canvas.getBoundingClientRect();
      return { px: e.clientX - rect.left, py: e.clientY - rect.top };
    },
    [canvasRef]
  );

  // Single emission point for orbit deltas so the pointer and keyboard paths
  // stay consistent. Inversion is applied last, then pitch is constrained
  // against the value that will actually be applied — this keeps the
  // constraint correct at both poles regardless of `invertPitch`.
  const emitOrbit = useCallback(
    (rawYaw: number, rawPitch: number) => {
      const deltaYaw = invertYaw ? -rawYaw : rawYaw;
      let deltaPitch = invertPitch ? -rawPitch : rawPitch;

      if (constrainPitch) {
        deltaPitch =
          clamp(orientation.pitch + deltaPitch, -90, 90) - orientation.pitch;
      }

      onOrbit?.({ deltaYaw, deltaPitch });
    },
    [invertYaw, invertPitch, constrainPitch, orientation.pitch, onOrbit]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || interactionMode === 'display-only' || e.button !== 0)
        return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { px, py } = getPointerPos(e);

      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      startPointerRef.current = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
      canvas.setPointerCapture(e.pointerId);

      // Store hit for click detection on pointer up
      const hit = gizmoHitTest(px, py, orientation, center, armLength, upAxis);
      setHoveredRegion(hit);
    },
    [
      disabled,
      interactionMode,
      canvasRef,
      getPointerPos,
      orientation,
      center,
      armLength,
      upAxis,
    ]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isDraggingRef.current && allowOrbit) {
        const dx = e.clientX - lastPointerRef.current.x;
        const dy = e.clientY - lastPointerRef.current.y;

        // Only count as drag if moved > 3px from start
        const totalDx = e.clientX - startPointerRef.current.x;
        const totalDy = e.clientY - startPointerRef.current.y;
        if (Math.sqrt(totalDx ** 2 + totalDy ** 2) > 3) {
          hasDraggedRef.current = true;
        }

        if (hasDraggedRef.current) {
          emitOrbit(dx * orbitSpeed * 0.5, -dy * orbitSpeed * 0.5);
        }

        lastPointerRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // Hover detection
      if (interactionMode === 'display-only') return;
      const { px, py } = getPointerPos(e);
      const hit = gizmoHitTest(px, py, orientation, center, armLength, upAxis);
      setHoveredRegion(hit);

      // Cursor
      if (disabled) {
        canvas.style.cursor = 'default';
      } else if (hit.type === 'axis-positive' || hit.type === 'origin') {
        canvas.style.cursor = 'pointer';
      } else if (allowOrbit) {
        canvas.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      } else {
        canvas.style.cursor = 'default';
      }
    },
    [
      canvasRef,
      allowOrbit,
      orbitSpeed,
      emitOrbit,
      orientation,
      interactionMode,
      disabled,
      getPointerPos,
      center,
      armLength,
      upAxis,
    ]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        canvas.releasePointerCapture(e.pointerId);

        if (hasDraggedRef.current) {
          // Finished orbit drag
          onOrbitEnd?.(orientation);
        } else if (allowSnap) {
          // Click (no drag) — check hit
          const { px, py } = getPointerPos(e);
          const hit = gizmoHitTest(
            px,
            py,
            orientation,
            center,
            armLength,
            upAxis
          );

          if (hit.type === 'origin') {
            onOriginClick?.();
          } else if (hit.type === 'axis-positive' && hit.axis) {
            onAxisClick?.(hit.axis, true);
            const view = axisToPresetView(hit.axis, true, upAxis);
            if (view) onSnapToView?.(view);
          } else if (hit.type === 'axis-negative' && hit.axis) {
            onAxisClick?.(hit.axis, false);
            const view = axisToPresetView(hit.axis, false, upAxis);
            if (view) onSnapToView?.(view);
          }
        }
      }
    },
    [
      canvasRef,
      allowSnap,
      getPointerPos,
      orientation,
      center,
      armLength,
      upAxis,
      onOrbitEnd,
      onOriginClick,
      onAxisClick,
      onSnapToView,
    ]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || interactionMode === 'display-only') return;

      const fine = e.shiftKey;
      const step = fine ? ORBIT_FINE_STEP : ORBIT_KEY_STEP;
      let handled = false;

      switch (e.key) {
        case 'ArrowLeft':
          if (allowOrbit) {
            emitOrbit(-step, 0);
            handled = true;
          }
          break;
        case 'ArrowRight':
          if (allowOrbit) {
            emitOrbit(step, 0);
            handled = true;
          }
          break;
        case 'ArrowUp':
          if (allowOrbit) {
            emitOrbit(0, step);
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (allowOrbit) {
            emitOrbit(0, -step);
            handled = true;
          }
          break;
        case '1':
          if (allowSnap) {
            onSnapToView?.(e.ctrlKey ? 'back' : 'front');
            handled = true;
          }
          break;
        case '3':
          if (allowSnap) {
            onSnapToView?.(e.ctrlKey ? 'left' : 'right');
            handled = true;
          }
          break;
        case '7':
          if (allowSnap) {
            onSnapToView?.(e.ctrlKey ? 'bottom' : 'top');
            handled = true;
          }
          break;
        case '5':
        case 'Home':
          onOriginClick?.();
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();
      }
    },
    [
      disabled,
      interactionMode,
      allowOrbit,
      allowSnap,
      emitOrbit,
      onSnapToView,
      onOriginClick,
    ]
  );

  return {
    isDragging,
    hoveredRegion,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onKeyDown,
    },
  };
}
