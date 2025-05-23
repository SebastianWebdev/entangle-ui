// src/icons/CloseIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Close icon component for close/cancel actions.
 * 
 * A standard X icon commonly used for closing dialogs,
 * canceling operations, and dismissing content in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <CloseIcon />
 * 
 * // With custom size and color
 * <CloseIcon size="sm" color="muted" />
 * 
 * // In a close button
 * <Button icon={<CloseIcon />}>Close</Button>
 * ```
 */
export const CloseIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"
      {...props}
    />
  );
};