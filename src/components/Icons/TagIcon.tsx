// src/icons/TagIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Tag icon component for tagging and labeling.
 * 
 * A standard tag icon commonly used for labeling content,
 * categorization, and metadata organization in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <TagIcon />
 * 
 * // With custom size and color
 * <TagIcon size="lg" color="primary" />
 * 
 * // In a tagging context
 * <Button icon={<TagIcon />}>Add Tag</Button>
 * ```
 */
export const TagIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </Icon>
  );
};