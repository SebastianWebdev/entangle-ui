import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Search icon component for search functionality.
 * 
 * A standard magnifying glass icon commonly used for search operations,
 * filters, and find functionality in editor interfaces and applications.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <SearchIcon />
 * 
 * // With custom size and color
 * <SearchIcon size="lg" color="primary" />
 * 
 * // In a search button
 * <Button icon={<SearchIcon />}>Search</Button>
 * ```
 */
export const SearchIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      {...props}
    />
  );
};
