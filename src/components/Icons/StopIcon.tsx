'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Stop icon component for halting playback and streams.
 *
 * A solid square commonly used to stop transport playback, abort
 * generations, and cancel long-running streaming operations.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StopIcon />
 *
 * // With custom size and color
 * <StopIcon size="md" color="error" />
 *
 * // In a stop streaming button
 * <IconButton icon={<StopIcon />} label="Stop" />
 * ```
 */
export const StopIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <rect x="5" y="5" width="14" height="14" rx="1" />
      </Icon>
    );
  }
);

StopIcon.displayName = 'StopIcon';
