// src/icons/RefreshIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Refresh icon component for refresh/reload actions.
 *
 * A standard circular arrow icon commonly used for refreshing content,
 * reloading data, and update operations in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <RefreshIcon />
 *
 * // With custom size and color
 * <RefreshIcon size="lg" color="accent" />
 *
 * // In a refresh button
 * <Button icon={<RefreshIcon />}>Refresh</Button>
 * ```
 */
export const RefreshIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </Icon>
  );
};
