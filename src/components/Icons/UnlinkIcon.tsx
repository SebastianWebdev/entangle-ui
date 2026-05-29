'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Unlink icon — a broken chain.
 *
 * Indicates that two values are decoupled (no longer linked). Pair with
 * `LinkIcon` to render a toggle: link → unlink. Common in coordinate
 * inputs, transform locks, color-channel groups.
 *
 * @example
 * ```tsx
 * <IconButton aria-label="Unlink axes">
 *   <UnlinkIcon />
 * </IconButton>
 * ```
 */
export const UnlinkIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M9 17H7A5 5 0 0 1 7 7h2" />
        <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
        <line x1="3" y1="3" x2="21" y2="21" />
      </Icon>
    );
  }
);

UnlinkIcon.displayName = 'UnlinkIcon';
