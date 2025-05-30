// src/icons/MaximizeIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Maximize icon component for maximize actions.
 *
 * A standard expand square icon commonly used for maximizing windows,
 * expanding panels, and enlarging content areas in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <MaximizeIcon />
 *
 * // With custom size and color
 * <MaximizeIcon size="sm" color="secondary" />
 *
 * // In a window control context
 * <Button icon={<MaximizeIcon />}>Maximize</Button>
 * ```
 */
export const MaximizeIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </Icon>
  );
};
