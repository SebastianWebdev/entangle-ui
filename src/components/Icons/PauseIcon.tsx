'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Pause icon component for pausing playback and processes.
 *
 * Two parallel vertical bars commonly used to pause animations, video,
 * preview playback, and long-running operations. Pairs with `PlayIcon`.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PauseIcon />
 *
 * // With custom size and color
 * <PauseIcon size="lg" color="primary" />
 *
 * // In a transport bar
 * <IconButton icon={<PauseIcon />} label="Pause" />
 * ```
 */
export const PauseIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M9 4v16M15 4v16" />
      </Icon>
    );
  }
);

PauseIcon.displayName = 'PauseIcon';
