'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp } from '@/utils/mathUtils';
import type { Point2D } from '@/components/primitives/canvas/canvas.types';
import type {
  ViewportMouseButton,
  ViewportPanConfig,
  ViewportPanEndInfo,
  ViewportSelectionConfig,
  ViewportSelectionEvent,
  ViewportSize,
  ViewportTransform,
  ViewportZoomConfig,
  WorldRect,
} from './Viewport.types';
import { screenToWorld } from './viewportCoords';
import { computeZoomTowardPivot, normalizeRect } from './viewportMath';

interface UseViewportGesturesOptions {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  transform: ViewportTransform;
  setTransform: (next: ViewportTransform) => void;
  getSize: () => ViewportSize;
  disabled: boolean;
  minZoom: number;
  maxZoom: number;
  pan: ViewportPanConfig | false;
  zoom: ViewportZoomConfig | false;
  selectionRect: ViewportSelectionConfig;
  onPanStart?: () => void;
  onPanEnd?: (info: ViewportPanEndInfo) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
  onSelectionChange?: (info: ViewportSelectionEvent) => void;
}

interface UseViewportGesturesReturn {
  /** True while a pan gesture is active. */
  isPanning: boolean;
  /** Pointer/wheel/keyboard handlers to spread on the viewport wrapper. */
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
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
 * Resolves gesture event handlers (pan, zoom, marquee, keyboard helpers)
 * for the Viewport wrapper. Used internally by `<Viewport>`.
 */
export function useViewportGestures(
  options: UseViewportGesturesOptions
): UseViewportGesturesReturn {
  const {
    viewportRef,
    transform,
    setTransform,
    getSize,
    disabled,
    minZoom,
    maxZoom,
    pan,
    zoom,
    selectionRect,
    onPanStart,
    onPanEnd,
    onZoomStart,
    onZoomEnd,
    onSelectionChange,
  } = options;

  const panCfg: Required<ViewportPanConfig> =
    pan === false
      ? { button: false, spaceKey: false }
      : { ...DEFAULT_PAN, ...pan };
  const zoomCfg: Required<ViewportZoomConfig> =
    zoom === false
      ? { wheel: false, pinch: false, speed: DEFAULT_ZOOM.speed }
      : { ...DEFAULT_ZOOM, ...zoom };
  const selCfg: Required<ViewportSelectionConfig> = {
    ...DEFAULT_SELECTION,
    ...selectionRect,
  };

  // Stable refs for the things gesture handlers read at "runtime"
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const setTransformRef = useRef(setTransform);
  setTransformRef.current = setTransform;
  const getSizeRef = useRef(getSize);
  getSizeRef.current = getSize;
  const callbacksRef = useRef({
    onPanStart,
    onPanEnd,
    onZoomStart,
    onZoomEnd,
    onSelectionChange,
  });
  callbacksRef.current = {
    onPanStart,
    onPanEnd,
    onZoomStart,
    onZoomEnd,
    onSelectionChange,
  };

  const [isPanning, setIsPanning] = useState(false);
  const activeRef = useRef<ActiveGesture | null>(null);
  const spaceHeldRef = useRef(false);

  // Velocity smoothing — track last two moves to compute pointer-up velocity
  const lastMoveRef = useRef<{ point: Point2D; time: number } | null>(null);
  const prevMoveRef = useRef<{ point: Point2D; time: number } | null>(null);

  // Zoom-end debounce
  const zoomEndTimerRef = useRef<number | null>(null);
  const zoomActiveRef = useRef(false);

  // ── Space key tracking ──
  // We listen on `window` so Space works no matter which descendant of the
  // viewport currently has focus, but we only act when focus is inside the
  // viewport — otherwise we'd hijack Space across the whole page.
  useEffect(() => {
    if (!panCfg.spaceKey || disabled) {
      spaceHeldRef.current = false;
      return;
    }
    const focusIsInViewport = (): boolean => {
      const root = viewportRef.current;
      const active = document.activeElement;
      if (!root || !active) return false;
      return root === active || root.contains(active);
    };
    const handleDown = (e: KeyboardEvent): void => {
      if (e.code !== 'Space') return;
      if (!focusIsInViewport()) return;
      spaceHeldRef.current = true;
      // Suppress the browser's default page-scroll on Space.
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

  // ── Native wheel listener ──
  // React's synthetic `onWheel` is registered passively, so `preventDefault()`
  // there is a no-op. Attach a native non-passive listener so we can suppress
  // page scroll when the viewport handles the wheel.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || disabled) return;
    if (zoomCfg.wheel === false && zoomCfg.pinch === false) return;

    const handler = (e: WheelEvent): void => {
      const isPinch = e.ctrlKey;
      if (isPinch && !zoomCfg.pinch) return;
      if (!isPinch && !zoomCfg.wheel) return;

      // We're going to consume this wheel event — stop the page from scrolling.
      e.preventDefault();

      if (!zoomActiveRef.current) {
        zoomActiveRef.current = true;
        callbacksRef.current.onZoomStart?.();
      }
      if (zoomEndTimerRef.current !== null) {
        window.clearTimeout(zoomEndTimerRef.current);
      }
      zoomEndTimerRef.current = window.setTimeout(() => {
        zoomActiveRef.current = false;
        zoomEndTimerRef.current = null;
        callbacksRef.current.onZoomEnd?.();
      }, ZOOM_END_DELAY_MS);

      const rect = el.getBoundingClientRect();
      const pivot: Point2D = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      const factor = Math.exp(-e.deltaY * zoomCfg.speed);
      const next = computeZoomTowardPivot(pivot, factor, transformRef.current, {
        minZoom,
        maxZoom,
      });
      setTransformRef.current(next);
    };

    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [
    viewportRef,
    disabled,
    zoomCfg.wheel,
    zoomCfg.pinch,
    zoomCfg.speed,
    minZoom,
    maxZoom,
  ]);

  const resolveGesture = useCallback(
    (buttonNum: number): GestureKind | null => {
      const button = BUTTON_TO_NAME[buttonNum];
      if (!button) return null;

      // Space override: any button while space held → pan
      if (panCfg.spaceKey && spaceHeldRef.current && panCfg.button !== false) {
        return 'pan';
      }
      // Direct pan-button match
      if (panCfg.button !== false && button === panCfg.button) {
        return 'pan';
      }
      // Marquee
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
      const t = transformRef.current;
      const startWorld = screenToWorld(startScreen, t);
      const endWorld = screenToWorld(endScreen, t);
      const rect: WorldRect = normalizeRect({
        x: startWorld.x,
        y: startWorld.y,
        width: endWorld.x - startWorld.x,
        height: endWorld.y - startWorld.y,
      });
      callbacksRef.current.onSelectionChange?.({
        rect,
        additive,
        inProgress,
      });
    },
    []
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
        startTransform: transformRef.current,
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

      lastMoveRef.current = { point: local, time: performance.now() };
      prevMoveRef.current = null;

      e.currentTarget.setPointerCapture(e.pointerId);
      // Prevent text selection during marquee/pan
      e.preventDefault();

      if (kind === 'pan') {
        setIsPanning(true);
        callbacksRef.current.onPanStart?.();
      } else {
        // marquee — emit zero-size selection so consumers can start rendering it
        emitSelection(local, local, activeRef.current.additive, true);
      }
    },
    [
      disabled,
      resolveGesture,
      getLocalPoint,
      selCfg.additiveModifier,
      emitSelection,
    ]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const g = activeRef.current;
      if (g?.pointerId !== e.pointerId) return;

      const local = getLocalPoint(e);

      // Velocity smoothing
      prevMoveRef.current = lastMoveRef.current;
      lastMoveRef.current = { point: local, time: performance.now() };

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
    [getLocalPoint, emitSelection]
  );

  const endGesture = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean): void => {
      const g = activeRef.current;
      if (g?.pointerId !== e.pointerId) return;

      const local = getLocalPoint(e);

      if (g.kind === 'pan') {
        // Compute end velocity from the smoothing window
        let vx = 0;
        let vy = 0;
        const last = lastMoveRef.current;
        const prev = prevMoveRef.current;
        if (last && prev && last.time > prev.time) {
          const dt = last.time - prev.time;
          vx = clamp(
            (last.point.x - prev.point.x) / dt,
            -MAX_VELOCITY_PX_PER_MS,
            MAX_VELOCITY_PX_PER_MS
          );
          vy = clamp(
            (last.point.y - prev.point.y) / dt,
            -MAX_VELOCITY_PX_PER_MS,
            MAX_VELOCITY_PX_PER_MS
          );
        }
        setIsPanning(false);
        callbacksRef.current.onPanEnd?.({ velocity: { x: vx, y: vy } });
      } else if (!cancelled) {
        emitSelection(g.startScreen, local, g.additive, false);
      }

      activeRef.current = null;
      lastMoveRef.current = null;
      prevMoveRef.current = null;

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [getLocalPoint, emitSelection]
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

  // Suppress native context menu when middle/right-button pan is enabled,
  // so right-drag works as a pan gesture without popping the OS menu.
  const onContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (panCfg.button === 'right') e.preventDefault();
    },
    [panCfg.button]
  );

  // Cleanup pending zoom-end timer
  useEffect(() => {
    return () => {
      if (zoomEndTimerRef.current !== null) {
        window.clearTimeout(zoomEndTimerRef.current);
      }
    };
  }, []);

  return {
    isPanning,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onContextMenu,
    },
  };
}
