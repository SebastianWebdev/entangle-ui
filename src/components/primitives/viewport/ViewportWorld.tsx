'use client';

import React, { useSyncExternalStore } from 'react';

import { cx } from '@/utils/cx';

import { worldLayerStyle } from './Viewport.css';
import { useViewportStore } from './ViewportContext';

import type { ViewportWorldProps } from './Viewport.types';

/**
 * Container for HTML children positioned in **world coordinates**.
 *
 * The wrapper applies the viewport's `translate(x, y) scale(zoom)` so that
 * children whose `left`/`top` are expressed in world units render at the
 * correct screen position and follow pan/zoom automatically.
 *
 * Subscribes only to the `transform` slice of the store — re-renders when
 * the transform changes, not when `isPanning` or `marqueeRect` flip.
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
  const store = useViewportStore();
  const transform = useSyncExternalStore(
    store.subscribeTransform,
    store.getTransform
  );

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
