'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Pin icon component for pinning items to keep them visible.
 *
 * A push-pin silhouette commonly used to pin tabs, conversations,
 * or list items so they stay in view. A filled visual variant could
 * indicate the pinned state.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PinIcon />
 *
 * // With custom size and color
 * <PinIcon size="sm" color="accent" />
 *
 * // In a pin/unpin toggle
 * <IconButton icon={<PinIcon />} label="Pin item" />
 * ```
 */
export const PinIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z" />
      </Icon>
    );
  }
);

PinIcon.displayName = 'PinIcon';
