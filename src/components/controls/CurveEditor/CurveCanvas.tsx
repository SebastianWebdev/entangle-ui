'use client';

import React, { useRef, useEffect, useState } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import type {
  CurveData,
  CurveViewport,
  CurveHitTest,
  CurveEditorSize,
  CurveBackgroundInfo,
} from './CurveEditor.types';
import { useCurveRenderer } from './useCurveRenderer';
import {
  canvasContainerRecipe,
  canvasRecipe,
  ariaLiveRegionStyle,
  canvasHeightVar,
} from './CurveEditor.css';

interface CurveCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  curve: CurveData;
  viewport: CurveViewport;
  showGrid: boolean;
  gridSubdivisions: number;
  showAxisLabels: boolean;
  labelX?: string;
  labelY?: string;
  curveColor: string;
  curveWidth: number;
  renderBackground?: (
    ctx: CanvasRenderingContext2D,
    info: CurveBackgroundInfo
  ) => void;
  selectedIds: Set<string>;
  hoveredElement: CurveHitTest | null;
  selectionBox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null;
  isDragging: boolean;
  lockTangents: boolean;
  height: number;
  responsive: boolean;
  disabled: boolean;
  size: CurveEditorSize;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onDoubleClick: (e: React.MouseEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  ariaLabel?: string;
  testId?: string;
}

export const CurveCanvas: React.FC<CurveCanvasProps> = ({
  canvasRef,
  curve,
  viewport,
  showGrid,
  gridSubdivisions,
  showAxisLabels,
  labelX,
  labelY,
  curveColor,
  curveWidth,
  renderBackground,
  selectedIds,
  hoveredElement,
  selectionBox,
  isDragging,
  lockTangents,
  height,
  responsive,
  disabled,
  handlers,
  ariaLabel,
  testId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizeToken, setResizeToken] = useState(0);

  // ResizeObserver for responsive mode -- triggers canvas re-render
  useEffect(() => {
    if (!responsive || !containerRef.current) return;

    const observer = new ResizeObserver(() => {
      setResizeToken(t => t + 1);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [responsive]);

  // Renderer hook
  useCurveRenderer({
    canvasRef,
    curve,
    viewport,
    showGrid,
    gridSubdivisions,
    showAxisLabels,
    labelX,
    labelY,
    curveColor,
    curveWidth,
    renderBackground,
    selectedIds,
    hoveredElement,
    selectionBox,
    disabled,
    isDragging,
    lockTangents,
    resizeToken,
  });

  // Build screen reader summary
  const kfCount = curve.keyframes.length;
  const firstKf = curve.keyframes[0];
  const lastKf = curve.keyframes[kfCount - 1];
  const srSummary =
    firstKf && lastKf
      ? `Curve from (${firstKf.x}, ${firstKf.y}) to (${lastKf.x}, ${lastKf.y}) with ${kfCount} keyframes`
      : `Empty curve`;

  // Selection announcement
  const selectedCount = selectedIds.size;
  const selectionAnnouncement =
    selectedCount > 0
      ? `${selectedCount} keyframe${selectedCount > 1 ? 's' : ''} selected`
      : '';

  return (
    <div
      ref={containerRef}
      className={canvasContainerRecipe({ responsive })}
      style={{
        ...assignInlineVars({ [canvasHeightVar]: `${height}px` }),
        minHeight: `${height}px`,
      }}
    >
      <canvas
        ref={canvasRef}
        className={canvasRecipe({ disabled })}
        role="application"
        aria-label={ariaLabel ?? 'Curve editor'}
        aria-roledescription={`curve editor with ${kfCount} keyframes`}
        tabIndex={disabled ? -1 : 0}
        data-testid={testId ? `${testId}-canvas` : undefined}
        onPointerDown={handlers.onPointerDown}
        onPointerMove={handlers.onPointerMove}
        onPointerUp={handlers.onPointerUp}
        onDoubleClick={handlers.onDoubleClick}
        onKeyDown={handlers.onKeyDown}
      />
      <div className={ariaLiveRegionStyle} aria-live="polite" role="status">
        {srSummary}. {selectionAnnouncement}
      </div>
    </div>
  );
};

CurveCanvas.displayName = 'CurveCanvas';
