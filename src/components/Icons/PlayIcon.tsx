'use client';

// src/icons/PlayIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Play icon component for play/start actions.
 *
 * A standard play triangle icon commonly used for starting playback,
 * running processes, and begin operations in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PlayIcon />
 *
 * // With custom size and color
 * <PlayIcon size="lg" color="success" />
 *
 * // In a play button
 * <Button icon={<PlayIcon />}>Play</Button>
 * ```
 */
export const PlayIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <polygon points="5,3 19,12 5,21" />
      </Icon>
    );
  }
);

PlayIcon.displayName = 'PlayIcon';
