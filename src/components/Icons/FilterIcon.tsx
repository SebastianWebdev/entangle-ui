import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Filter icon component for filtering and sorting actions.
 * 
 * A standard filter icon commonly used for filtering content,
 * applying search filters, and data sorting in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <FilterIcon />
 * 
 * // With custom size and color
 * <FilterIcon size="md" color="primary" />
 * 
 * // In a filter button
 * <Button icon={<FilterIcon />}>Filter</Button>
 * ```
 */
export const FilterIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
    </Icon>
  );
};
