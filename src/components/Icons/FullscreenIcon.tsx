// src/icons/FullscreenIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Fullscreen icon component for fullscreen actions.
 * 
 * A standard expand arrows icon commonly used for entering fullscreen mode,
 * maximizing views, and expanding content in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <FullscreenIcon />
 * 
 * // With custom size and color
 * <FullscreenIcon size="md" color="primary" />
 * 
 * // In a fullscreen context
 * <Button icon={<FullscreenIcon />}>Fullscreen</Button>
 * ```
 */
export const FullscreenIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3M8 21H5a2 2 0 01-2-2v-3m18 0v3a2 2 0 01-2 2h-3"
      {...props}
    />
  );
};