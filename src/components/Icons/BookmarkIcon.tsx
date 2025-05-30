import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Bookmark icon component for saving and marking content.
 *
 * A standard bookmark icon commonly used for saving items,
 * marking favorites, and bookmarking content in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BookmarkIcon />
 *
 * // With custom size and color
 * <BookmarkIcon size="lg" color="accent" />
 *
 * // In a bookmark button
 * <Button icon={<BookmarkIcon />}>Bookmark</Button>
 * ```
 */
export const BookmarkIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Icon>
  );
};
