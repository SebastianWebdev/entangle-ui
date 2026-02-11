import React, { useRef } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import type { CanvasContainerProps } from './canvas.types';
import {
  canvasContainerRecipe,
  canvasContainerHeightVar,
  canvasRecipe,
  ariaLiveRegionStyle,
} from './CanvasContainer.css';

/**
 * Styled container + canvas + a11y live region.
 *
 * Provides the boilerplate every canvas control needs:
 * - Responsive or fixed-height container
 * - Canvas element with proper styling
 * - Screen reader announcements region
 * - Disabled opacity
 * - Focus-visible ring
 *
 * Does NOT manage rendering — consumers use useCanvasSetup + useCanvasRenderer.
 */
export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  canvasRef,
  height = 200,
  responsive = false,
  disabled = false,
  role = 'application',
  ariaLabel,
  ariaRoledescription,
  liveAnnouncement,
  handlers,
  className,
  style,
  testId,
  id,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`${canvasContainerRecipe({ responsive })}${className ? ` ${className}` : ''}`}
      style={{
        ...style,
        ...assignInlineVars({
          [canvasContainerHeightVar]: `${height}px`,
        }),
        minHeight: `${height}px`,
      }}
      id={id}
      data-testid={testId}
    >
      <canvas
        ref={canvasRef}
        className={canvasRecipe({ disabled })}
        role={role}
        aria-label={ariaLabel}
        aria-roledescription={ariaRoledescription}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={handlers?.onPointerDown}
        onPointerMove={handlers?.onPointerMove}
        onPointerUp={handlers?.onPointerUp}
        onDoubleClick={handlers?.onDoubleClick}
        onKeyDown={handlers?.onKeyDown}
      />
      <div className={ariaLiveRegionStyle} aria-live="polite" role="status">
        {liveAnnouncement}
      </div>
    </div>
  );
};

CanvasContainer.displayName = 'CanvasContainer';
