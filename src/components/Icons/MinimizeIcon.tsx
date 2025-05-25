// src/icons/MinimizeIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Minimize icon component for minimize actions.
 * 
 * A standard compress square icon commonly used for minimizing windows,
 * collapsing panels, and reducing content areas in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <MinimizeIcon />
 * 
 * // With custom size and color
 * <MinimizeIcon size="md" color="muted" />
 * 
 * // In a window control context
 * <Button icon={<MinimizeIcon />}>Minimize</Button>
 * ```
 */
export const MinimizeIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </Icon>
  );
};