'use client';

import React, { useCallback } from 'react';
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
 * Pointer events from interactive overlay children (buttons, sliders, …)
 * are stopped at the overlay boundary so a click on the toolbar does not
 * also start a Viewport pan or marquee gesture. The wrapper itself stays
 * `pointer-events: none`; children opt in with `pointerEvents: 'auto'`.
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
  // Stop pointer events from interactive overlay children from reaching the
  // Viewport wrapper. Without this, clicking a toolbar button starts a
  // marquee/pan gesture (and the gesture's `setPointerCapture` steals the
  // pointer-up event, so the button's `onClick` never fires).
  const stopPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);
  // Same problem for the native wheel listener: stopImmediatePropagation
  // prevents the Viewport's non-passive wheel zoom from firing when the user
  // scrolls inside an overlay (e.g., a scrollable list in a toolbar).
  const stopWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.nativeEvent.stopImmediatePropagation();
  }, []);

  return (
    <div
      className={cx(overlayLayerStyle, className)}
      style={style}
      onPointerDown={stopPointer}
      onPointerMove={stopPointer}
      onPointerUp={stopPointer}
      onPointerCancel={stopPointer}
      onWheel={stopWheel}
    >
      {children}
    </div>
  );
};

ViewportOverlay.displayName = 'ViewportOverlay';
