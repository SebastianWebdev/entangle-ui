// src/icons/HeartIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Heart icon component for likes and favorites.
 * 
 * A standard heart icon commonly used for likes, favorites,
 * love reactions, and positive feedback in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <HeartIcon />
 * 
 * // With custom size and color
 * <HeartIcon size="md" color="error" />
 * 
 * // In a like context
 * <Button icon={<HeartIcon />}>Like</Button>
 * ```
 */
export const HeartIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      {...props}
    />
  );
};