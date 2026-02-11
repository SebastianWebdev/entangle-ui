import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import type { CanvasSize } from './canvas.types';

interface UseCanvasSetupOptions {
  /** Ref to the canvas element */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Ref to the container element (for ResizeObserver) */
  containerRef?: React.RefObject<HTMLDivElement | null>;
  /** Whether to use ResizeObserver for responsive sizing */
  responsive?: boolean;
  /** Callback when canvas is resized */
  onResize?: (size: CanvasSize) => void;
}

interface UseCanvasSetupReturn {
  /** Get current canvas size in CSS pixels */
  getCanvasSize: () => CanvasSize;
  /**
   * Prepare the canvas context for drawing.
   * Handles DPR scaling and returns the context + size.
   * Returns null if canvas is unavailable.
   */
  prepareContext: () => {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
  } | null;
}

/**
 * Hook that handles canvas DPR setup, resize observation, and context preparation.
 *
 * Extracted from CurveEditor's useCurveRenderer — the DPR handling and
 * resize logic is identical. This hook does NOT manage the render loop;
 * use useCanvasRenderer for that.
 */
export function useCanvasSetup(
  options: UseCanvasSetupOptions
): UseCanvasSetupReturn {
  const { canvasRef, containerRef, responsive = false, onResize } = options;
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const getCanvasSize = useCallback((): CanvasSize => {
    const canvas = canvasRef.current;
    if (!canvas) return { width: 0, height: 0 };
    const rect = canvas.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, [canvasRef]);

  const prepareContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Set canvas resolution for retina
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    } else {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    return { ctx, width: w, height: h };
  }, [canvasRef]);

  // ResizeObserver for responsive mode
  useEffect(() => {
    const target = containerRef?.current ?? canvasRef.current?.parentElement;
    if (!responsive || !target) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && onResize) {
        onResize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(target);
    resizeObserverRef.current = observer;

    return () => observer.disconnect();
  }, [responsive, containerRef, canvasRef, onResize]);

  return { getCanvasSize, prepareContext };
}
