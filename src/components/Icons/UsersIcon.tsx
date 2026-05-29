'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Users icon component for groups, teams, and multi-user contexts.
 *
 * Two overlapping user silhouettes commonly used for team membership,
 * shared resources, and group-level actions. Pairs with `UserIcon` for
 * single-user contexts.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <UsersIcon />
 *
 * // With custom size and color
 * <UsersIcon size="md" color="secondary" />
 *
 * // In a team selector
 * <Button icon={<UsersIcon />}>Team</Button>
 * ```
 */
export const UsersIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Icon>
    );
  }
);

UsersIcon.displayName = 'UsersIcon';
