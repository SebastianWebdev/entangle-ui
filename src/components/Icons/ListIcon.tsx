// src/icons/ListIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * List icon component for list view layouts.
 * 
 * A standard list lines icon commonly used for switching to list view,
 * linear data display, and structured content in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ListIcon />
 * 
 * // With custom size and color
 * <ListIcon size="md" color="primary" />
 * 
 * // In a view toggle
 * <Button icon={<ListIcon />}>List View</Button>
 * ```
 */
export const ListIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01"
      {...props}
    />
  );
};