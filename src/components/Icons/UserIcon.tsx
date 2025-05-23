// src/icons/UserIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * User icon component for user profiles and accounts.
 * 
 * A standard user silhouette icon commonly used for user profiles,
 * account management, and person-related features in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <UserIcon />
 * 
 * // With custom size and color
 * <UserIcon size="sm" color="secondary" />
 * 
 * // In a profile context
 * <Button icon={<UserIcon />}>Profile</Button>
 * ```
 */
export const UserIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      {...props}
    />
  );
};