'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Dots Vertical icon component for contextual action menus.
 *
 * Three dots stacked vertically, typically used as the trigger
 * for item-level action menus on cards, list rows, and table cells.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DotsVerticalIcon />
 *
 * // With custom size and color
 * <DotsVerticalIcon size="sm" color="muted" />
 *
 * // As a menu trigger
 * <IconButton icon={<DotsVerticalIcon />} label="Actions" />
 * ```
 */
export const DotsVerticalIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </Icon>
  );
});

DotsVerticalIcon.displayName = 'DotsVerticalIcon';
