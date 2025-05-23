// src/icons/ZoomInIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Zoom In icon component for zoom in actions.
 * 
 * A standard magnifying glass with plus icon commonly used for zooming in,
 * enlarging content, and scale increase operations in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ZoomInIcon />
 * 
 * // With custom size and color
 * <ZoomInIcon size="md" color="accent" />
 * 
 * // In a zoom context
 * <Button icon={<ZoomInIcon />}>Zoom In</Button>
 * ```
 */
export const ZoomInIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z M10 7v6 M7 10h6"
      {...props}
    />
  );
};