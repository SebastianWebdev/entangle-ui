'use client';

import type React from 'react';
import { useState, useCallback, useRef } from 'react';
import { clamp, roundToPrecision } from '@/utils/mathUtils';
import type { Point2D, CanvasViewport } from '@/components/primitives/canvas';
import {
  canvasToDomain,
  getCanvasPointerPosition,
  hitTestPoint,
} from '@/components/primitives/canvas';

interface UseCartesianInteractionOptions {
  point: Point2D;
  viewport: CanvasViewport;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  domainX: [number, number];
  domainY: [number, number];
  disabled: boolean;
  readOnly: boolean;
  clampToRange: boolean;
  snapToGrid: boolean;
  gridSubdivisions: number;
  step?: number | [number, number];
  precision: number;
  onChange: (point: Point2D) => void;
  onChangeComplete?: (point: Point2D) => void;
}

interface UseCartesianInteractionReturn {
  isDragging: boolean;
  isHovered: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
}

function snapValue(value: number, step: number): number {
  if (step === 0) return value;
  return Math.round(value / step) * step;
}

export function useCartesianInteraction(
  options: UseCartesianInteractionOptions
): UseCartesianInteractionReturn {
  const {
    point,
    viewport,
    canvasRef,
    domainX,
    domainY,
    disabled,
    readOnly,
    clampToRange,
    snapToGrid,
    gridSubdivisions,
    step,
    precision,
    onChange,
    onChangeComplete,
  } = options;

  const [isHovered, setIsHovered] = useState(false);
  const isDraggingRef = useRef(false);
  const [, setForceUpdate] = useState(0);

  const getCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { w: 200, h: 200 };
    const rect = canvas.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }, [canvasRef]);

  const applyConstraints = useCallback(
    (rawX: number, rawY: number, ctrlKey: boolean): Point2D => {
      let newX = rawX;
      let newY = rawY;

      // Apply snap
      if (step) {
        const [stepX, stepY] = Array.isArray(step) ? step : [step, step];
        newX = snapValue(newX, stepX);
        newY = snapValue(newY, stepY);
      } else if (snapToGrid !== ctrlKey) {
        // Ctrl toggles snap behavior
        const xStep = (domainX[1] - domainX[0]) / gridSubdivisions;
        const yStep = (domainY[1] - domainY[0]) / gridSubdivisions;
        newX = snapValue(newX, xStep);
        newY = snapValue(newY, yStep);
      }

      newX = roundToPrecision(newX, precision);
      newY = roundToPrecision(newY, precision);

      if (clampToRange) {
        newX = clamp(newX, domainX[0], domainX[1]);
        newY = clamp(newY, domainY[0], domainY[1]);
      }

      return { x: newX, y: newY };
    },
    [
      step,
      snapToGrid,
      gridSubdivisions,
      domainX,
      domainY,
      precision,
      clampToRange,
    ]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || readOnly || e.button !== 0) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { px, py } = getCanvasPointerPosition(e, canvas);
      const { w, h } = getCanvasSize();

      const domain = canvasToDomain(px, py, viewport, w, h);
      const newPoint = applyConstraints(domain.x, domain.y, e.ctrlKey);

      isDraggingRef.current = true;
      setForceUpdate(n => n + 1);
      canvas.setPointerCapture(e.pointerId);

      onChange(newPoint);
    },
    [
      disabled,
      readOnly,
      canvasRef,
      viewport,
      getCanvasSize,
      applyConstraints,
      onChange,
    ]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isDraggingRef.current) {
        if (readOnly) return;
        const { px, py } = getCanvasPointerPosition(e, canvas);
        const { w, h } = getCanvasSize();
        const domain = canvasToDomain(px, py, viewport, w, h);
        const newPoint = applyConstraints(domain.x, domain.y, e.ctrlKey);
        onChange(newPoint);
        return;
      }

      // Hover detection
      const { px, py } = getCanvasPointerPosition(e, canvas);
      const { w, h } = getCanvasSize();
      const dist = hitTestPoint(px, py, point, viewport, w, h, 12);
      const hovering = dist !== Infinity;
      setIsHovered(hovering);

      if (disabled) {
        canvas.style.cursor = 'not-allowed';
      } else if (readOnly) {
        canvas.style.cursor = 'default';
      } else if (hovering) {
        canvas.style.cursor = 'grab';
      } else {
        canvas.style.cursor = 'crosshair';
      }
    },
    [
      canvasRef,
      viewport,
      point,
      disabled,
      readOnly,
      getCanvasSize,
      applyConstraints,
      onChange,
    ]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setForceUpdate(n => n + 1);
        canvas.releasePointerCapture(e.pointerId);

        // Compute final point for onChangeComplete
        const { px, py } = getCanvasPointerPosition(e, canvas);
        const { w, h } = getCanvasSize();
        const domain = canvasToDomain(px, py, viewport, w, h);
        const finalPoint = applyConstraints(domain.x, domain.y, e.ctrlKey);
        onChangeComplete?.(finalPoint);
      }
    },
    [canvasRef, viewport, getCanvasSize, applyConstraints, onChangeComplete]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || readOnly) return;

      const xRange = domainX[1] - domainX[0];
      const yRange = domainY[1] - domainY[0];

      let baseStep: number;
      if (step) {
        const [stepX] = Array.isArray(step) ? step : [step, step];
        baseStep = stepX;
      } else {
        baseStep = xRange / gridSubdivisions;
      }

      const fineMultiplier = e.shiftKey ? 0.1 : 1;
      const xStep = baseStep * fineMultiplier;
      const yStep =
        (step
          ? Array.isArray(step)
            ? step[1]
            : step
          : yRange / gridSubdivisions) * fineMultiplier;

      let newX = point.x;
      let newY = point.y;
      let handled = false;

      switch (e.key) {
        case 'ArrowLeft':
          newX -= xStep;
          handled = true;
          break;
        case 'ArrowRight':
          newX += xStep;
          handled = true;
          break;
        case 'ArrowUp':
          newY += yStep;
          handled = true;
          break;
        case 'ArrowDown':
          newY -= yStep;
          handled = true;
          break;
        case 'Home': {
          // Reset to center of domain
          newX = (domainX[0] + domainX[1]) / 2;
          newY = (domainY[0] + domainY[1]) / 2;
          handled = true;
          break;
        }
        case '0': {
          // Reset to origin
          newX = 0;
          newY = 0;
          handled = true;
          break;
        }
      }

      if (!handled) return;
      e.preventDefault();

      newX = roundToPrecision(newX, precision);
      newY = roundToPrecision(newY, precision);

      if (clampToRange) {
        newX = clamp(newX, domainX[0], domainX[1]);
        newY = clamp(newY, domainY[0], domainY[1]);
      }

      const newPoint = { x: newX, y: newY };
      onChange(newPoint);
      onChangeComplete?.(newPoint);
    },
    [
      disabled,
      readOnly,
      point,
      domainX,
      domainY,
      step,
      gridSubdivisions,
      precision,
      clampToRange,
      onChange,
      onChangeComplete,
    ]
  );

  return {
    isDragging: isDraggingRef.current,
    isHovered,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onKeyDown,
    },
  };
}
