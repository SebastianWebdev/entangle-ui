// src/icons/GridIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Grid icon component for grid view layouts.
 * 
 * A standard grid pattern icon commonly used for switching to grid view,
 * layout controls, and structured data display in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <GridIcon />
 * 
 * // With custom size and color
 * <GridIcon size="sm" color="accent" />
 * 
 * // In a view toggle
 * <Button icon={<GridIcon />}>Grid View</Button>
 * ```
 */
export const GridIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z"
      {...props}
    />
  );
};