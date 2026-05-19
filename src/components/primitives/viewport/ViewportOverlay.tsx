'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import type { ViewportOverlayProps } from './Viewport.types';
import { overlayLayerStyle } from './Viewport.css';

/**
 * Container for HTML children positioned in **screen coordinates**, rendered
 * above all canvas layers and world children.
 *
 * Typical use: toolbars, status text, minimap, or any UI that should stay
 * pinned to the viewport regardless of pan/zoom.
 *
 * @example
 * ```tsx
 * <ViewportOverlay>
 *   <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
 *     <Minimap />
 *   </div>
 * </ViewportOverlay>
 * ```
 */
export const ViewportOverlay: React.FC<ViewportOverlayProps> = ({
  children,
  className,
  style,
}) => {
  return (
    <div className={cx(overlayLayerStyle, className)} style={style}>
      {children}
    </div>
  );
};

ViewportOverlay.displayName = 'ViewportOverlay';
