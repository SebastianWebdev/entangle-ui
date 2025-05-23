import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Play icon component for play/start actions.
 * 
 * A standard play triangle icon commonly used for starting playback,
 * running processes, and initiating actions in editor interfaces.
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
export const PlayIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="m9 18 6-6-6-6v12z"
      {...props}
    />
  );
};
