// src/icons/LinkIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Link icon component for linking and connections.
 * 
 * A standard chain link icon commonly used for creating links,
 * connecting items, and URL references in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <LinkIcon />
 * 
 * // With custom size and color
 * <LinkIcon size="md" color="accent" />
 * 
 * // In a link context
 * <Button icon={<LinkIcon />}>Add Link</Button>
 * ```
 */
export const LinkIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
      {...props}
    />
  );
};