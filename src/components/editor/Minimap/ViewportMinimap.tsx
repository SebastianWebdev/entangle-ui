'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useViewportContext } from '@/components/primitives/viewport';
import { Minimap } from './Minimap';
import type { MinimapNavigateInfo, MinimapProps } from './Minimap.types';

export type ViewportMinimapPlacement =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | {
      top?: number | string;
      right?: number | string;
      bottom?: number | string;
      left?: number | string;
      width?: number | string;
      height?: number | string;
    };

export interface ViewportMinimapProps extends Omit<
  MinimapProps,
  'transform' | 'viewportSize'
> {
  /**
   * Anchored position inside the parent `<Viewport>`. Use a preset for
   * the four corners, or an object for custom anchoring.
   * @default 'bottom-right'
   */
  placement?: ViewportMinimapPlacement;
  /**
   * Distance (CSS px) from the viewport edge when using a preset placement.
   * Ignored when `placement` is an object.
   * @default 12
   */
  margin?: number;
  /**
   * When true, the minimap width tracks the wrapper's measured width via
   * ResizeObserver. The wrapper size must be controlled externally (e.g.
   * via custom `placement` or a parent container). The `width` prop, if
   * provided, becomes a fallback used until the first measurement lands.
   * @default false
   */
  responsive?: boolean;
}

function placementToStyle(
  placement: ViewportMinimapPlacement,
  margin: number
): React.CSSProperties {
  if (typeof placement === 'object') {
    return { position: 'absolute', pointerEvents: 'auto', ...placement };
  }
  const style: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'auto',
  };
  if (placement.startsWith('top')) style.top = margin;
  else style.bottom = margin;
  if (placement.endsWith('left')) style.left = margin;
  else style.right = margin;
  return style;
}

/**
 * Auto-bound minimap for use inside a `<Viewport>`. Reads live `transform`
 * and `size` from `useViewportContext()`, positions itself in a corner
 * (or custom anchor), and wires `onNavigate` to the viewport handle's
 * `centerOn`. Falls back to the manual `<Minimap>` if you need the
 * minimap outside the Viewport tree.
 *
 * Recognized by `<Viewport>` as an overlay child — drop it among layers
 * and world/overlay siblings without an explicit `<ViewportOverlay>` wrapper.
 */
export const ViewportMinimap: React.FC<ViewportMinimapProps> = ({
  placement = 'bottom-right',
  margin = 12,
  responsive = false,
  width: widthProp,
  onNavigate: userOnNavigate,
  ...minimapProps
}) => {
  const { transform, size, handle } = useViewportContext();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!responsive) return;
    const wrapper = wrapperRef.current;
    if (!wrapper || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) setMeasuredWidth(entry.contentRect.width);
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [responsive]);

  const wrapperStyle = useMemo(
    () => placementToStyle(placement, margin),
    [placement, margin]
  );

  const effectiveWidth = responsive
    ? (measuredWidth ?? widthProp ?? 200)
    : widthProp;

  const handleNavigate = (info: MinimapNavigateInfo): void => {
    handle.centerOn(info.worldPoint);
    userOnNavigate?.(info);
  };

  return (
    <div ref={wrapperRef} style={wrapperStyle}>
      <Minimap
        {...minimapProps}
        transform={transform}
        viewportSize={size}
        width={effectiveWidth}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

ViewportMinimap.displayName = 'ViewportMinimap';
