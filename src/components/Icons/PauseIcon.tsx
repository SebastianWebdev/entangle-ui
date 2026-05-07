'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

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
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </Icon>
    );
  }
);

PauseIcon.displayName = 'PauseIcon';
