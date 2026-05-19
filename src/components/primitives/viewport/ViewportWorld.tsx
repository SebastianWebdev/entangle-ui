'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import type { ViewportWorldProps } from './Viewport.types';
import { useViewportContext } from './ViewportContext';
import { worldLayerStyle } from './Viewport.css';

/**
 * Container for HTML children positioned in **world coordinates**.
 *
 * The wrapper applies the viewport's `translate(x, y) scale(zoom)` so that
 * children whose `left`/`top` are expressed in world units render at the
 * correct screen position and follow pan/zoom automatically.
 *
 * @example
 * ```tsx
 * <ViewportWorld>
 *   <div style={{ position: 'absolute', left: 100, top: 200 }}>
 *     Node at world (100, 200)
 *   </div>
 * </ViewportWorld>
 * ```
 */
export const ViewportWorld: React.FC<ViewportWorldProps> = ({
  children,
  className,
  style,
}) => {
  const { transform } = useViewportContext();
  return (
    <div
      className={cx(worldLayerStyle, className)}
      style={{
        ...style,
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      }}
    >
      {children}
    </div>
  );
};

ViewportWorld.displayName = 'ViewportWorld';
