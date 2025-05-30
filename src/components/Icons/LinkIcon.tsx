import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Link icon component for linking and connection actions.
 *
 * A standard link icon commonly used for creating links,
 * connecting content, and URL-related features in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LinkIcon />
 *
 * // With custom size and color
 * <LinkIcon size="md" color="primary" />
 *
 * // In a link button
 * <Button icon={<LinkIcon />}>Add Link</Button>
 * ```
 */
export const LinkIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Icon>
  );
};
