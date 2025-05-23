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
export const RefreshIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      {...props}
    />
  );
};