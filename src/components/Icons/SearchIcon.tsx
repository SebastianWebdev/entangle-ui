// src/icons/SearchIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Search icon component for search functionality.
 *
 * A standard magnifying glass icon commonly used for search inputs,
 * find operations, and lookup features in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SearchIcon />
 *
 * // With custom size and color
 * <SearchIcon size="md" color="primary" />
 *
 * // In a search input
 * <Input startIcon={<SearchIcon />} placeholder="Search..." />
 * ```
 */
export const SearchIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </Icon>
  );
};
