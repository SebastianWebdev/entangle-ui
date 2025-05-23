// src/icons/BookmarkIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Bookmark icon component for saved items.
 * 
 * A standard bookmark icon commonly used for saving content,
 * marking important items, and organizing references in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <BookmarkIcon />
 * 
 * // With custom size and color
 * <BookmarkIcon size="sm" color="accent" />
 * 
 * // In a bookmark context
 * <Button icon={<BookmarkIcon />}>Bookmark</Button>
 * ```
 */
export const BookmarkIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
      {...props}
    />
  );
};