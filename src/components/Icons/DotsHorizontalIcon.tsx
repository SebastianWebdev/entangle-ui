'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Dots Horizontal icon component for inline overflow menus.
 *
 * Three dots arranged horizontally, commonly used as a more-actions
 * affordance in toolbars, card headers, and badge ends.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DotsHorizontalIcon />
 *
 * // With custom size and color
 * <DotsHorizontalIcon size="sm" color="muted" />
 *
 * // As an overflow menu trigger
 * <IconButton icon={<DotsHorizontalIcon />} label="More" />
 * ```
 */
export const DotsHorizontalIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </Icon>
  );
});

DotsHorizontalIcon.displayName = 'DotsHorizontalIcon';
