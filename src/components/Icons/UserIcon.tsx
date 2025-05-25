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
export const UserIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  );
};