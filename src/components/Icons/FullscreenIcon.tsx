import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Fullscreen icon component for expanding to fullscreen mode.
 * 
 * A standard fullscreen icon commonly used for maximizing content,
 * entering fullscreen mode, and expanding views in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <FullscreenIcon />
 * 
 * // With custom size and color
 * <FullscreenIcon size="md" color="primary" />
 * 
 * // In a fullscreen button
 * <Button icon={<FullscreenIcon />}>Fullscreen</Button>
 * ```
 */
export const FullscreenIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </Icon>
  );
};
