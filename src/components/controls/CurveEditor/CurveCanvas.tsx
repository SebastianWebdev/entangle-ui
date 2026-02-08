import React, { useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import type {
  CurveData,
  CurveViewport,
  CurveHitTest,
  CurveEditorSize,
  CurveBackgroundInfo,
} from './CurveEditor.types';
import { useCurveRenderer } from './useCurveRenderer';

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

const StyledCanvasContainer = styled.div<{
  $height: number;
  $responsive: boolean;
}>`
  position: relative;
  width: 100%;
  height: ${p => (p.$responsive ? '100%' : `${p.$height}px`)};
  min-height: 100px;
  overflow: hidden;
`;

const StyledCanvas = styled.canvas<{ $disabled: boolean }>`
  display: block;
  width: 100%;
  height: 100%;
  outline: none;
  border: none;
  opacity: ${p => (p.$disabled ? 0.5 : 1)};

  &:focus-visible {
    box-shadow: ${p => p.theme.shadows.focus};
  }
`;

const AriaLiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
`;

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
  height,
  responsive,
  disabled,
  handlers,
  ariaLabel,
  testId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // ResizeObserver for responsive mode — triggers canvas re-render
  useEffect(() => {
    if (!responsive || !containerRef.current) return;

    const observer = new ResizeObserver(() => {
      // Canvas renderer reads dimensions from getBoundingClientRect
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
    <StyledCanvasContainer
      ref={containerRef}
      $height={height}
      $responsive={responsive}
    >
      <StyledCanvas
        ref={canvasRef}
        $disabled={disabled}
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
      <AriaLiveRegion aria-live="polite" role="status">
        {srSummary}. {selectionAnnouncement}
      </AriaLiveRegion>
    </StyledCanvasContainer>
  );
};

CurveCanvas.displayName = 'CurveCanvas';
