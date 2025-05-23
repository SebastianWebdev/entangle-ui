import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Close icon component for close/cancel actions.
 * 
 * A standard X icon commonly used for closing dialogs, modals,
 * canceling operations, and dismissing content in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <CloseIcon />
 * 
 * // With custom size and color
 * <CloseIcon size="lg" color="muted" />
 * 
 * // In a close button
 * <Button icon={<CloseIcon />}>Close</Button>
 * ```
 */
export const CloseIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="m18 6-12 12m0-12 12 12"
      {...props}
    />
  );
};
