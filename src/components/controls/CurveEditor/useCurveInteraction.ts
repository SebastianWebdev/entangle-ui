'use client';

import type React from 'react';
import { useState, useCallback, useRef } from 'react';
import { clamp, roundToPrecision } from '@/utils/mathUtils';
import type {
  CurveData,
  CurveKeyframe,
  CurveViewport,
  CurveHitTest,
  TangentMode,
} from './CurveEditor.types';
import {
  canvasToDomain,
  hitTest,
  sortKeyframes,
  generateKeyframeId,
  constrainTangent,
  computeAutoTangent,
} from './curveUtils';

type DragState =
  | { type: 'idle' }
  | { type: 'keyframe'; keyframeIndex: number; startX: number; startY: number }
  | { type: 'handleIn'; keyframeIndex: number }
  | { type: 'handleOut'; keyframeIndex: number }
  | { type: 'boxSelect'; startPx: number; startPy: number };

interface UseCurveInteractionOptions {
  curve: CurveData;
  viewport: CurveViewport;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  disabled: boolean;
  readOnly: boolean;
  allowAdd: boolean;
  allowDelete: boolean;
  maxKeyframes: number;
  lockEndpoints: boolean;
  clampY: boolean;
  snapToGrid: boolean;
  gridSubdivisions: number;
  lockTangents: boolean;
  minKeyframeDistance: number;
  precision: number;
  onChange: (curve: CurveData) => void;
  onChangeComplete?: (curve: CurveData) => void;
  onSelectionChange?: (ids: string[]) => void;
}

interface UseCurveInteractionReturn {
  selectedIds: Set<string>;
  hoveredElement: CurveHitTest | null;
  selectionBox: { x1: number; y1: number; x2: number; y2: number } | null;
  isDragging: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onDoubleClick: (e: React.MouseEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  setTangentMode: (mode: TangentMode) => void;
  selectAll: () => void;
  deleteSelected: () => void;
}

const TANGENT_CYCLE: TangentMode[] = [
  'free',
  'aligned',
  'mirrored',
  'auto',
  'linear',
  'step',
];

function getCanvasCoords(
  e: React.PointerEvent | React.MouseEvent,
  canvas: HTMLCanvasElement
): { px: number; py: number } {
  const rect = canvas.getBoundingClientRect();
  return { px: e.clientX - rect.left, py: e.clientY - rect.top };
}

export function useCurveInteraction(
  options: UseCurveInteractionOptions
): UseCurveInteractionReturn {
  const {
    curve,
    viewport,
    canvasRef,
    disabled,
    readOnly,
    allowAdd,
    allowDelete,
    maxKeyframes,
    lockEndpoints,
    lockTangents,
    clampY,
    snapToGrid,
    gridSubdivisions,
    minKeyframeDistance,
    precision,
    onChange,
    onChangeComplete,
    onSelectionChange,
  } = options;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredElement, setHoveredElement] = useState<CurveHitTest | null>(
    null
  );
  const [selectionBox, setSelectionBox] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  const dragStateRef = useRef<DragState>({ type: 'idle' });
  const curveBeforeDragRef = useRef<CurveData | null>(null);

  const isDragging = dragStateRef.current.type !== 'idle';

  const getCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { w: 320, h: 200 };
    const rect = canvas.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }, [canvasRef]);

  const updateSelection = useCallback(
    (ids: Set<string>) => {
      setSelectedIds(ids);
      onSelectionChange?.(Array.from(ids));
    },
    [onSelectionChange]
  );

  const snapValue = useCallback(
    (value: number, domainRange: number): number => {
      const gridStep = domainRange / gridSubdivisions;
      return Math.round(value / gridStep) * gridStep;
    },
    [gridSubdivisions]
  );

  const applyAutoTangents = useCallback(
    (keyframes: CurveKeyframe[]): CurveKeyframe[] => {
      return keyframes.map((kf, i) => {
        if (kf.tangentMode !== 'auto') return kf;
        const prev = i > 0 ? (keyframes[i - 1] ?? null) : null;
        const next =
          i < keyframes.length - 1 ? (keyframes[i + 1] ?? null) : null;
        const tangents = computeAutoTangent(prev, kf, next);
        return {
          ...kf,
          handleIn: tangents.handleIn,
          handleOut: tangents.handleOut,
        };
      });
    },
    []
  );

  // ─── Pointer Down ───
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { px, py } = getCanvasCoords(e, canvas);
      const { w, h } = getCanvasSize();

      if (e.button !== 0) return;

      const hit = hitTest(px, py, curve, viewport, w, h);

      if (hit.type === 'keyframe') {
        const kf = curve.keyframes[hit.keyframeIndex];
        if (!kf?.id) return;

        if (e.shiftKey) {
          // Toggle selection
          const newSel = new Set(selectedIds);
          if (newSel.has(kf.id)) {
            newSel.delete(kf.id);
          } else {
            newSel.add(kf.id);
          }
          updateSelection(newSel);
        } else if (!selectedIds.has(kf.id)) {
          updateSelection(new Set([kf.id]));
        }

        if (!readOnly) {
          curveBeforeDragRef.current = {
            ...curve,
            keyframes: [...curve.keyframes],
          };
          dragStateRef.current = {
            type: 'keyframe',
            keyframeIndex: hit.keyframeIndex,
            startX: kf.x,
            startY: kf.y,
          };
          canvas.setPointerCapture(e.pointerId);
        }
        return;
      }

      if (
        (hit.type === 'handleIn' || hit.type === 'handleOut') &&
        !readOnly &&
        !lockTangents
      ) {
        const kf = curve.keyframes[hit.keyframeIndex];
        if (!kf?.id) return;
        updateSelection(new Set([kf.id]));
        curveBeforeDragRef.current = {
          ...curve,
          keyframes: [...curve.keyframes],
        };
        dragStateRef.current = {
          type: hit.type,
          keyframeIndex: hit.keyframeIndex,
        };
        canvas.setPointerCapture(e.pointerId);
        return;
      }

      // Empty area — start box select or clear selection
      if (!e.shiftKey) {
        updateSelection(new Set());
      }

      dragStateRef.current = { type: 'boxSelect', startPx: px, startPy: py };
      canvas.setPointerCapture(e.pointerId);
    },
    [
      disabled,
      readOnly,
      canvasRef,
      curve,
      viewport,
      selectedIds,
      updateSelection,
      getCanvasSize,
    ]
  );

  // ─── Pointer Move ───
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { px, py } = getCanvasCoords(e, canvas);
      const { w, h } = getCanvasSize();
      const drag = dragStateRef.current;

      if (drag.type === 'idle') {
        // Hover detection
        const hit = hitTest(px, py, curve, viewport, w, h);
        setHoveredElement(hit.type !== 'none' ? hit : null);

        // Cursor
        if (hit.type === 'keyframe') {
          canvas.style.cursor = 'pointer';
        } else if (
          (hit.type === 'handleIn' || hit.type === 'handleOut') &&
          !lockTangents
        ) {
          canvas.style.cursor = 'crosshair';
        } else if (hit.type === 'curve') {
          canvas.style.cursor = 'pointer';
        } else {
          canvas.style.cursor = disabled ? 'not-allowed' : 'default';
        }
        return;
      }

      if (drag.type === 'boxSelect') {
        setSelectionBox({ x1: drag.startPx, y1: drag.startPy, x2: px, y2: py });
        return;
      }

      if (readOnly) return;

      if (drag.type === 'keyframe') {
        const domain = canvasToDomain(px, py, viewport, w, h);
        const kf = curve.keyframes[drag.keyframeIndex];
        if (!kf) return;

        const isEndpoint =
          drag.keyframeIndex === 0 ||
          drag.keyframeIndex === curve.keyframes.length - 1;

        let newX = domain.x;
        let newY = domain.y;

        // Apply snap
        const shouldSnap = snapToGrid !== e.ctrlKey; // Ctrl toggles snap
        if (shouldSnap) {
          const xRange = curve.domainX[1] - curve.domainX[0];
          const yRange = curve.domainY[1] - curve.domainY[0];
          newX = snapValue(newX, xRange);
          newY = snapValue(newY, yRange);
        }

        newX = roundToPrecision(newX, precision);
        newY = roundToPrecision(newY, precision);

        // Lock X for endpoints
        if (lockEndpoints && isEndpoint) {
          newX = kf.x;
        }

        // Clamp X between neighbors
        if (!isEndpoint || !lockEndpoints) {
          const prevKf = curve.keyframes[drag.keyframeIndex - 1];
          const nextKf = curve.keyframes[drag.keyframeIndex + 1];
          if (prevKf) {
            newX = Math.max(newX, prevKf.x + minKeyframeDistance);
          }
          if (nextKf) {
            newX = Math.min(newX, nextKf.x - minKeyframeDistance);
          }
        }

        // Clamp Y to domain
        if (clampY) {
          newY = clamp(newY, curve.domainY[0], curve.domainY[1]);
        }

        const newKeyframes = curve.keyframes.map((k, i) =>
          i === drag.keyframeIndex ? { ...k, x: newX, y: newY } : k
        );

        onChange({
          ...curve,
          keyframes: applyAutoTangents(newKeyframes),
        });
        return;
      }

      if (drag.type === 'handleIn' || drag.type === 'handleOut') {
        const kf = curve.keyframes[drag.keyframeIndex];
        if (!kf) return;

        const domain = canvasToDomain(px, py, viewport, w, h);
        const handleOffset = {
          x: roundToPrecision(domain.x - kf.x, precision),
          y: roundToPrecision(domain.y - kf.y, precision),
        };

        let updatedKf: CurveKeyframe;
        if (drag.type === 'handleIn') {
          updatedKf = { ...kf, handleIn: handleOffset };
        } else {
          updatedKf = { ...kf, handleOut: handleOffset };
        }

        // Promote auto → free when the user manually adjusts a handle.
        // This prevents applyAutoTangents from overwriting the change.
        if (updatedKf.tangentMode === 'auto') {
          updatedKf = { ...updatedKf, tangentMode: 'free' };
        }

        // Apply tangent constraints
        updatedKf = constrainTangent(
          updatedKf,
          drag.type === 'handleIn' ? 'in' : 'out'
        );

        const newKeyframes = curve.keyframes.map((k, i) =>
          i === drag.keyframeIndex ? updatedKf : k
        );

        onChange({ ...curve, keyframes: newKeyframes });
        return;
      }
    },
    [
      canvasRef,
      curve,
      viewport,
      disabled,
      readOnly,
      snapToGrid,
      lockEndpoints,
      clampY,
      minKeyframeDistance,
      precision,
      gridSubdivisions,
      onChange,
      getCanvasSize,
      snapValue,
      applyAutoTangents,
    ]
  );

  // ─── Pointer Up ───
  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const drag = dragStateRef.current;

      if (drag.type === 'boxSelect') {
        // Resolve box selection
        if (selectionBox) {
          const { w, h } = getCanvasSize();
          const newSel = new Set(e.shiftKey ? selectedIds : new Set<string>());

          for (let i = 0; i < curve.keyframes.length; i++) {
            const kf = curve.keyframes[i];
            if (!kf) continue;
            if (!kf.id) continue;

            const [vxMin, vxMax] = viewport.viewX;
            const [vyMin, vyMax] = viewport.viewY;
            const vw = vxMax - vxMin || 1;
            const vh = vyMax - vyMin || 1;
            const kfPx = ((kf.x - vxMin) / vw) * w;
            const kfPy = ((vyMax - kf.y) / vh) * h;

            const boxLeft = Math.min(selectionBox.x1, selectionBox.x2);
            const boxRight = Math.max(selectionBox.x1, selectionBox.x2);
            const boxTop = Math.min(selectionBox.y1, selectionBox.y2);
            const boxBottom = Math.max(selectionBox.y1, selectionBox.y2);

            if (
              kfPx >= boxLeft &&
              kfPx <= boxRight &&
              kfPy >= boxTop &&
              kfPy <= boxBottom
            ) {
              newSel.add(kf.id);
            }
          }

          updateSelection(newSel);
        }

        setSelectionBox(null);
      }

      if (
        (drag.type === 'keyframe' ||
          drag.type === 'handleIn' ||
          drag.type === 'handleOut') &&
        curveBeforeDragRef.current
      ) {
        onChangeComplete?.(curve);
        curveBeforeDragRef.current = null;
      }

      dragStateRef.current = { type: 'idle' };
      canvas.releasePointerCapture(e.pointerId);
    },
    [
      canvasRef,
      curve,
      viewport,
      selectionBox,
      selectedIds,
      updateSelection,
      onChangeComplete,
      getCanvasSize,
    ]
  );

  // ─── Double Click ───
  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || readOnly) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { px, py } = getCanvasCoords(
        e as unknown as React.PointerEvent,
        canvas
      );
      const { w, h } = getCanvasSize();
      const hit = hitTest(px, py, curve, viewport, w, h);

      if (hit.type === 'keyframe') {
        if (lockTangents) return;
        // Cycle tangent mode
        const kf = curve.keyframes[hit.keyframeIndex];
        if (!kf) return;

        const currentIndex = TANGENT_CYCLE.indexOf(kf.tangentMode);
        const nextIndex = (currentIndex + 1) % TANGENT_CYCLE.length;
        const nextMode = TANGENT_CYCLE[nextIndex] ?? 'free';

        const newKeyframes = curve.keyframes.map((k, i) =>
          i === hit.keyframeIndex ? { ...k, tangentMode: nextMode } : k
        );

        const updated = {
          ...curve,
          keyframes: applyAutoTangents(newKeyframes),
        };
        onChange(updated);
        onChangeComplete?.(updated);
        return;
      }

      if (allowAdd && curve.keyframes.length < maxKeyframes) {
        // Add keyframe at cursor position
        const domain = canvasToDomain(px, py, viewport, w, h);
        const newX = roundToPrecision(domain.x, precision);
        let newY = roundToPrecision(domain.y, precision);

        // Check within domain X
        if (newX < curve.domainX[0] || newX > curve.domainX[1]) return;

        // Clamp Y to domain
        if (clampY) {
          newY = clamp(newY, curve.domainY[0], curve.domainY[1]);
        }

        const newKf: CurveKeyframe = {
          x: newX,
          y: newY,
          handleIn: { x: 0, y: 0 },
          handleOut: { x: 0, y: 0 },
          tangentMode: 'auto',
          id: generateKeyframeId(),
        };

        const newKeyframes = sortKeyframes([...curve.keyframes, newKf]);
        const updated = {
          ...curve,
          keyframes: applyAutoTangents(newKeyframes),
        };
        onChange(updated);
        onChangeComplete?.(updated);

        if (newKf.id) {
          updateSelection(new Set([newKf.id]));
        }
      }
    },
    [
      disabled,
      readOnly,
      canvasRef,
      curve,
      viewport,
      allowAdd,
      maxKeyframes,
      clampY,
      precision,
      onChange,
      onChangeComplete,
      updateSelection,
      getCanvasSize,
      applyAutoTangents,
    ]
  );

  // ─── Keyboard ───
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace': {
          if (readOnly || !allowDelete) return;
          e.preventDefault();
          deleteSelectedFn();
          break;
        }
        case 'a': {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            selectAllFn();
          }
          break;
        }
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight': {
          if (readOnly || selectedIds.size === 0) return;
          e.preventDefault();
          nudgeSelected(e.key, e.shiftKey);
          break;
        }
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6': {
          if (readOnly || lockTangents || selectedIds.size === 0) return;
          e.preventDefault();
          const modeIndex = parseInt(e.key) - 1;
          const mode = TANGENT_CYCLE[modeIndex];
          if (mode) setTangentModeFn(mode);
          break;
        }
      }
    },
    [disabled, readOnly, lockTangents, allowDelete, selectedIds]
  );

  // ─── Actions ───
  const deleteSelectedFn = useCallback(() => {
    if (readOnly || !allowDelete) return;

    const newKeyframes = curve.keyframes.filter(kf => {
      if (!kf.id || !selectedIds.has(kf.id)) return true;

      // Don't delete endpoints if locked
      if (lockEndpoints) {
        const idx = curve.keyframes.indexOf(kf);
        if (idx === 0 || idx === curve.keyframes.length - 1) return true;
      }
      return false;
    });

    // Must keep at least 2 keyframes
    if (newKeyframes.length < 2) return;

    const updated = { ...curve, keyframes: applyAutoTangents(newKeyframes) };
    onChange(updated);
    onChangeComplete?.(updated);
    updateSelection(new Set());
  }, [
    curve,
    selectedIds,
    readOnly,
    allowDelete,
    lockEndpoints,
    onChange,
    onChangeComplete,
    updateSelection,
    applyAutoTangents,
  ]);

  const selectAllFn = useCallback(() => {
    const allIds = new Set(
      curve.keyframes.map(kf => kf.id).filter(Boolean) as string[]
    );
    updateSelection(allIds);
  }, [curve, updateSelection]);

  const setTangentModeFn = useCallback(
    (mode: TangentMode) => {
      if (readOnly || lockTangents || selectedIds.size === 0) return;

      const newKeyframes = curve.keyframes.map(kf => {
        if (!kf.id || !selectedIds.has(kf.id)) return kf;

        if (mode === 'linear') {
          return {
            ...kf,
            tangentMode: mode,
            handleIn: { x: 0, y: 0 },
            handleOut: { x: 0, y: 0 },
          };
        }
        return { ...kf, tangentMode: mode };
      });

      const updated = { ...curve, keyframes: applyAutoTangents(newKeyframes) };
      onChange(updated);
      onChangeComplete?.(updated);
    },
    [
      curve,
      selectedIds,
      readOnly,
      lockTangents,
      onChange,
      onChangeComplete,
      applyAutoTangents,
    ]
  );

  const nudgeSelected = useCallback(
    (direction: string, fine: boolean) => {
      const [vxMin, vxMax] = viewport.viewX;
      const [vyMin, vyMax] = viewport.viewY;

      const baseStep = fine ? 0.001 : 0.01;
      const xStep = (vxMax - vxMin) * baseStep;
      const yStep = (vyMax - vyMin) * baseStep;

      const newKeyframes = curve.keyframes.map(kf => {
        if (!kf.id || !selectedIds.has(kf.id)) return kf;

        let { x, y } = kf;
        const idx = curve.keyframes.indexOf(kf);
        const isEndpoint = idx === 0 || idx === curve.keyframes.length - 1;

        switch (direction) {
          case 'ArrowLeft':
            if (!(lockEndpoints && isEndpoint)) x -= xStep;
            break;
          case 'ArrowRight':
            if (!(lockEndpoints && isEndpoint)) x += xStep;
            break;
          case 'ArrowUp':
            y += yStep;
            break;
          case 'ArrowDown':
            y -= yStep;
            break;
        }

        if (clampY) {
          y = clamp(y, curve.domainY[0], curve.domainY[1]);
        }

        return {
          ...kf,
          x: roundToPrecision(x, precision),
          y: roundToPrecision(y, precision),
        };
      });

      const updated = {
        ...curve,
        keyframes: applyAutoTangents(sortKeyframes(newKeyframes)),
      };
      onChange(updated);
      onChangeComplete?.(updated);
    },
    [
      curve,
      viewport,
      selectedIds,
      lockEndpoints,
      clampY,
      precision,
      onChange,
      onChangeComplete,
      applyAutoTangents,
    ]
  );

  return {
    selectedIds,
    hoveredElement,
    selectionBox,
    isDragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onDoubleClick,
      onKeyDown,
    },
    setTangentMode: setTangentModeFn,
    selectAll: selectAllFn,
    deleteSelected: deleteSelectedFn,
  };
}
