'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseCanvasRendererOptions {
  /** The draw function to call each frame. */
  draw: () => void;
  /** Dependencies array — when these change, the canvas re-renders */
  deps: unknown[];
  /** Whether rendering is paused @default false */
  paused?: boolean;
}

/**
 * Hook that manages a rAF-based render loop for canvas drawing.
 *
 * Calls the provided draw function whenever deps change.
 * Does NOT run continuously — only re-renders when deps trigger a change.
 *
 * Extracted from CurveEditor's useCurveRenderer rAF pattern.
 */
export function useCanvasRenderer(options: UseCanvasRendererOptions): void {
  const { draw, deps, paused = false } = options;
  const rafRef = useRef<number>(0);

  const stableDraw = useCallback(draw, deps); // deps intentionally dynamic

  useEffect(() => {
    if (paused) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(stableDraw);

    return () => cancelAnimationFrame(rafRef.current);
  }, [stableDraw, paused]);
}
