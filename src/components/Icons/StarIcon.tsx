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
export const StarIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      {...props}
    />
  );
};