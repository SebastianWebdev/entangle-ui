// src/icons/ZoomOutIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Zoom Out icon component for zoom out actions.
 * 
 * A standard magnifying glass with minus icon commonly used for zooming out,
 * reducing content, and scale decrease operations in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ZoomOutIcon />
 * 
 * // With custom size and color
 * <ZoomOutIcon size="lg" color="secondary" />
 * 
 * // In a zoom context
 * <Button icon={<ZoomOutIcon />}>Zoom Out</Button>
 * ```
 */
export const ZoomOutIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z M7 10h6"
      {...props}
    />
  );
};