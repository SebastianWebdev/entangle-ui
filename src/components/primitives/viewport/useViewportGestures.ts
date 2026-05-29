'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useDebouncedCallback, useLatest } from '@/hooks';
import { clamp } from '@/utils/mathUtils';

import { screenToWorld } from './viewportCoords';
import { computeZoomTowardPivot, normalizeRect } from './viewportMath';

import type {
  ScreenRect,
  ViewportMouseButton,
  ViewportPanConfig,
  ViewportPanEndInfo,
  ViewportSelectionConfig,
  ViewportSelectionEvent,
  ViewportTransform,
  ViewportZoomConfig,
  WorldRect,
} from './Viewport.types';
import type { ViewportStore } from './ViewportStore';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type React from 'react';

interface GestureCallbacks {
  onPanStart?: () => void;
  onPanEnd?: (info: ViewportPanEndInfo) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
  onSelectionChange?: (info: ViewportSelectionEvent) => void;
}

interface UseViewportGesturesOptions {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  store: ViewportStore;
  /** Called to push a new transform through React state. */
  setTransform: (next: ViewportTransform) => void;
  disabled: boolean;
  minZoom: number;
  maxZoom: number;
  pan: ViewportPanConfig | false;
  zoom: ViewportZoomConfig | false;
  selectionRect: ViewportSelectionConfig;
  callbacks: GestureCallbacks;
}

interface UseViewportGesturesReturn {
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerEnter: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => void;
    onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
  };
}

const BUTTON_TO_NAME: Record<number, ViewportMouseButton> = {
  0: 'left',
  1: 'middle',
  2: 'right',
};

const DEFAULT_PAN: Required<ViewportPanConfig> = {
  button: 'middle',
  spaceKey: true,
};

const DEFAULT_ZOOM: Required<ViewportZoomConfig> = {
  wheel: true,
  pinch: true,
  speed: 0.0015,
};

const DEFAULT_SELECTION: Required<ViewportSelectionConfig> = {
  enabled: false,
  button: 'left',
  additiveModifier: 'shift',
};

const ZOOM_END_DELAY_MS = 180;
const MAX_VELOCITY_PX_PER_MS = 3;
const VELOCITY_SAMPLE_COUNT = 5;

type GestureKind = 'pan' | 'marquee';

interface ActiveGesture {
  kind: GestureKind;
  pointerId: number;
  startScreen: Point2D;
  startTransform: ViewportTransform;
  /** For marquee — additive modifier observed at gesture start. */
  additive: boolean;
}

/**
 * Resolves gesture event handlers (pan, zoom, marquee) for the Viewport
 * wrapper. Used internally by `<Viewport>` — every "live" value (current
 * transform, current size, latest callbacks) is read through the store
 * or through a `useLatest` ref so the wheel/keyboard listeners never
 * re-attach on prop changes.
 */
export function useViewportGestures(
  options: UseViewportGesturesOptions
): UseViewportGesturesReturn {
  const {
    viewportRef,
    store,
    setTransform,
    disabled,
    minZoom,
    maxZoom,
    pan,
    zoom,
    selectionRect,
    callbacks,
  } = options;

  const panCfg = useMemo<Required<ViewportPanConfig>>(
    () =>
      pan === false
        ? { button: false, spaceKey: false }
        : { ...DEFAULT_PAN, ...pan },
    [pan]
  );
  const zoomCfg = useMemo<Required<ViewportZoomConfig>>(
    () =>
      zoom === false
        ? { wheel: false, pinch: false, speed: DEFAULT_ZOOM.speed }
        : { ...DEFAULT_ZOOM, ...zoom },
    [zoom]
  );
  const selCfg = useMemo<Required<ViewportSelectionConfig>>(
    () => ({ ...DEFAULT_SELECTION, ...selectionRect }),
    [selectionRect]
  );

  const callbacksRef = useLatest(callbacks);
  const setTransformRef = useLatest(setTransform);
  const limitsRef = useLatest({ minZoom, maxZoom });
  const zoomSpeedRef = useLatest(zoomCfg.speed);

  const activeRef = useRef<ActiveGesture | null>(null);
  const spaceHeldRef = useRef(false);
  const pointerInsideRef = useRef(false);

  // Ring-buffer of recent pointer-move samples for velocity smoothing.
  const samplesRef = useRef<Array<{ point: Point2D; time: number }>>([]);

  const zoomActiveRef = useRef(false);

  const fireZoomEnd = useDebouncedCallback(() => {
    zoomActiveRef.current = false;
    callbacksRef.current.onZoomEnd?.();
  }, ZOOM_END_DELAY_MS);

  // ── Space-key tracking (window-scoped, gated by pointer/focus state) ──
  useEffect(() => {
    if (!panCfg.spaceKey || disabled) {
      spaceHeldRef.current = false;
      return;
    }
    const isInteractingWithViewport = (): boolean => {
      if (pointerInsideRef.current) return true;
      const root = viewportRef.current;
      const active = document.activeElement;
      if (!root || !active) return false;
      return root === active || root.contains(active);
    };
    const handleDown = (e: KeyboardEvent): void => {
      if (e.code !== 'Space') return;
      if (!isInteractingWithViewport()) return;
      spaceHeldRef.current = true;
      e.preventDefault();
    };
    const handleUp = (e: KeyboardEvent): void => {
      if (e.code === 'Space') {
        spaceHeldRef.current = false;
      }
    };
    const handleBlur = (): void => {
      spaceHeldRef.current = false;
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [panCfg.spaceKey, disabled, viewportRef]);

  // ── Native wheel listener (non-passive so we can preventDefault page scroll) ──
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || disabled) return;
    if (!zoomCfg.wheel && !zoomCfg.pinch) return;

    const handler = (e: WheelEvent): void => {
      const isPinch = e.ctrlKey;
      if (isPinch && !zoomCfg.pinch) return;
      if (!isPinch && !zoomCfg.wheel) return;

      e.preventDefault();

      if (!zoomActiveRef.current) {
        zoomActiveRef.current = true;
        callbacksRef.current.onZoomStart?.();
      }
      fireZoomEnd();

      const rect = el.getBoundingClientRect();
      const pivot: Point2D = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      const factor = Math.exp(-e.deltaY * zoomSpeedRef.current);
      const next = computeZoomTowardPivot(
        pivot,
        factor,
        store.getTransform(),
        limitsRef.current
      );
      setTransformRef.current(next);
    };

    el.addEventListener('wheel', handler, { passive: false });
    return () => {
      el.removeEventListener('wheel', handler);
    };
  }, [
    viewportRef,
    disabled,
    zoomCfg.wheel,
    zoomCfg.pinch,
    store,
    callbacksRef,
    fireZoomEnd,
    limitsRef,
    setTransformRef,
    zoomSpeedRef,
  ]);

  const resolveGesture = useCallback(
    (buttonNum: number): GestureKind | null => {
      const button = BUTTON_TO_NAME[buttonNum];
      if (!button) return null;

      if (panCfg.spaceKey && spaceHeldRef.current && panCfg.button !== false) {
        return 'pan';
      }
      if (panCfg.button !== false && button === panCfg.button) {
        return 'pan';
      }
      if (selCfg.enabled && button === selCfg.button) {
        return 'marquee';
      }
      return null;
    },
    [panCfg.spaceKey, panCfg.button, selCfg.enabled, selCfg.button]
  );

  const getLocalPoint = useCallback(
    (e: { clientX: number; clientY: number }): Point2D => {
      const el = viewportRef.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    [viewportRef]
  );

  const emitSelection = useCallback(
    (
      startScreen: Point2D,
      endScreen: Point2D,
      additive: boolean,
      inProgress: boolean
    ): void => {
      const t = store.getTransform();
      const startWorld = screenToWorld(startScreen, t);
      const endWorld = screenToWorld(endScreen, t);
      const rect: WorldRect = normalizeRect({
        x: startWorld.x,
        y: startWorld.y,
        width: endWorld.x - startWorld.x,
        height: endWorld.y - startWorld.y,
      });
      const screenRect: ScreenRect = normalizeRect({
        x: startScreen.x,
        y: startScreen.y,
        width: endScreen.x - startScreen.x,
        height: endScreen.y - startScreen.y,
      });
      store.setMarqueeRect(inProgress ? screenRect : null);
      callbacksRef.current.onSelectionChange?.({
        rect,
        additive,
        inProgress,
      });
    },
    [store, callbacksRef]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (activeRef.current) return;

      const kind = resolveGesture(e.button);
      if (!kind) return;

      const local = getLocalPoint(e);

      activeRef.current = {
        kind,
        pointerId: e.pointerId,
        startScreen: local,
        startTransform: store.getTransform(),
        additive: ((): boolean => {
          switch (selCfg.additiveModifier) {
            case 'shift':
              return e.shiftKey;
            case 'meta':
              return e.metaKey;
            case 'ctrl':
              return e.ctrlKey;
            case 'alt':
              return e.altKey;
            default:
              return false;
          }
        })(),
      };

      samplesRef.current = [{ point: local, time: performance.now() }];

      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();

      if (kind === 'pan') {
        store.setIsPanning(true);
        callbacksRef.current.onPanStart?.();
      } else {
        emitSelection(local, local, activeRef.current.additive, true);
      }
    },
    [
      disabled,
      resolveGesture,
      getLocalPoint,
      store,
      selCfg.additiveModifier,
      emitSelection,
      callbacksRef,
    ]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const g = activeRef.current;
      if (g?.pointerId !== e.pointerId) return;

      const local = getLocalPoint(e);

      const samples = samplesRef.current;
      samples.push({ point: local, time: performance.now() });
      if (samples.length > VELOCITY_SAMPLE_COUNT) samples.shift();

      if (g.kind === 'pan') {
        const dx = local.x - g.startScreen.x;
        const dy = local.y - g.startScreen.y;
        setTransformRef.current({
          x: g.startTransform.x + dx,
          y: g.startTransform.y + dy,
          zoom: g.startTransform.zoom,
        });
      } else {
        emitSelection(g.startScreen, local, g.additive, true);
      }
    },
    [getLocalPoint, emitSelection, setTransformRef]
  );

  const endGesture = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean): void => {
      const g = activeRef.current;
      if (g?.pointerId !== e.pointerId) return;

      const local = getLocalPoint(e);

      if (g.kind === 'pan') {
        let vx = 0;
        let vy = 0;
        const samples = samplesRef.current;
        if (samples.length >= 2) {
          const first = samples[0];
          const last = samples[samples.length - 1];
          if (first && last) {
            const dt = last.time - first.time;
            if (dt > 0) {
              vx = clamp(
                (last.point.x - first.point.x) / dt,
                -MAX_VELOCITY_PX_PER_MS,
                MAX_VELOCITY_PX_PER_MS
              );
              vy = clamp(
                (last.point.y - first.point.y) / dt,
                -MAX_VELOCITY_PX_PER_MS,
                MAX_VELOCITY_PX_PER_MS
              );
            }
          }
        }
        store.setIsPanning(false);
        callbacksRef.current.onPanEnd?.({ velocity: { x: vx, y: vy } });
      } else if (!cancelled) {
        emitSelection(g.startScreen, local, g.additive, false);
      } else {
        store.setMarqueeRect(null);
      }

      activeRef.current = null;
      samplesRef.current = [];

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [getLocalPoint, emitSelection, store, callbacksRef]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      endGesture(e, false);
    },
    [endGesture]
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      endGesture(e, true);
    },
    [endGesture]
  );

  const onPointerEnter = useCallback(() => {
    pointerInsideRef.current = true;
  }, []);

  const onPointerLeave = useCallback(() => {
    pointerInsideRef.current = false;
  }, []);

  const onContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (panCfg.button === 'right') e.preventDefault();
    },
    [panCfg.button]
  );

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerEnter,
      onPointerLeave,
      onContextMenu,
    },
  };
}
