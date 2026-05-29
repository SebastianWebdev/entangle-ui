'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';

import type React from 'react';

interface ActiveGesture {
  pointerId: number;
  teardown: () => void;
}

export interface DragGestureHandlers {
  /** Fired on each document `pointermove` for the captured pointer. */
  onMove: (event: PointerEvent) => void;
  /**
   * Fired on `pointercancel` for the captured pointer. Document listeners are
   * already detached by the time this runs — just reset business state.
   */
  onCancel: () => void;
}

export interface DragGestureControls {
  /**
   * Begin a pointer-drag on `event.currentTarget`: capture the pointer, attach
   * document `pointermove` / `pointercancel` listeners, and remember the
   * gesture so `finish` (or unmount) can release it. Any gesture still in
   * flight is torn down first — defensive against a lost `pointercancel`
   * (e.g. pointer capture dropped on alt-tab between moves).
   */
  begin: (
    event: React.PointerEvent<HTMLElement>,
    handlers: DragGestureHandlers
  ) => void;
  /**
   * Finish from a `pointerup` handler: release pointer capture and detach the
   * document listeners. Returns `false` when the up doesn't belong to the
   * active gesture (stale or secondary pointer) so the caller can bail.
   */
  finish: (event: React.PointerEvent<HTMLElement>) => boolean;
}

/**
 * Mechanical lifecycle for a pointer-capture drag gesture, shared by the node
 * and group drag controllers. Owns pointer capture, document listener
 * attach/detach, the per-pointer id guard, and cleanup on unmount — leaving
 * each hook to supply only its own move / cancel / up business logic. Document
 * listeners exist only while a gesture is in flight, so there's zero
 * pointermove cost between drags.
 */
export function useDragGesture(): DragGestureControls {
  const activeRef = useRef<ActiveGesture | null>(null);

  // Release in-flight document listeners if the component unmounts mid-drag.
  useLayoutEffect(() => {
    return () => {
      activeRef.current?.teardown();
      activeRef.current = null;
    };
  }, []);

  const begin = useCallback(
    (
      event: React.PointerEvent<HTMLElement>,
      handlers: DragGestureHandlers
    ): void => {
      activeRef.current?.teardown();

      const pointerId = event.pointerId;
      event.currentTarget.setPointerCapture(pointerId);

      const handleMove = (e: PointerEvent): void => {
        if (e.pointerId !== pointerId) return;
        handlers.onMove(e);
      };
      const handleCancel = (e: PointerEvent): void => {
        if (e.pointerId !== pointerId) return;
        teardown();
        handlers.onCancel();
      };
      // Function declaration (hoisted) so the handlers above can close over it.
      function teardown(): void {
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointercancel', handleCancel);
        if (activeRef.current?.pointerId === pointerId) {
          activeRef.current = null;
        }
      }

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointercancel', handleCancel);
      activeRef.current = { pointerId, teardown };
    },
    []
  );

  const finish = useCallback(
    (event: React.PointerEvent<HTMLElement>): boolean => {
      const active = activeRef.current;
      if (active?.pointerId !== event.pointerId) return false;
      const target = event.currentTarget;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
      active.teardown();
      return true;
    },
    []
  );

  return { begin, finish };
}
