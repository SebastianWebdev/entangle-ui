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
export const ZoomOutIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </Icon>
  );
};
