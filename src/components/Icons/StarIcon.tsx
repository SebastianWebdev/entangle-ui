// src/icons/StarIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Star icon component for favorites and ratings.
 * 
 * A standard star icon commonly used for favorites, bookmarks,
 * ratings, and highlighting important content in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <StarIcon />
 * 
 * // With custom size and color
 * <StarIcon size="lg" color="warning" />
 * 
 * // In a favorites context
 * <Button icon={<StarIcon />}>Favorite</Button>
 * ```
 */
export const StarIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </Icon>
  );
};