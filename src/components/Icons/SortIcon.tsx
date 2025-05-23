// src/icons/SortIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Sort icon component for sorting actions.
 * 
 * A standard up/down arrows icon commonly used for sorting content,
 * data ordering, and list arrangement in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <SortIcon />
 * 
 * // With custom size and color
 * <SortIcon size="sm" color="muted" />
 * 
 * // In a sort context
 * <Button icon={<SortIcon />}>Sort</Button>
 * ```
 */
export const SortIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M3 6h18 M3 12h12 M3 18h6 M17 8l4-4 4 4 M21 4v16"
      {...props}
    />
  );
};