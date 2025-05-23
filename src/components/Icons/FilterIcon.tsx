// src/icons/FilterIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Filter icon component for filtering actions.
 * 
 * A standard funnel icon commonly used for filtering content,
 * data refinement, and search operations in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <FilterIcon />
 * 
 * // With custom size and color
 * <FilterIcon size="lg" color="secondary" />
 * 
 * // In a filter context
 * <Button icon={<FilterIcon />}>Filter</Button>
 * ```
 */
export const FilterIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
      {...props}
    />
  );
};