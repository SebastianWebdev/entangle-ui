// src/icons/SuccessIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Success icon component for success states.
 * 
 * A standard checkmark circle icon commonly used for success messages,
 * completed operations, and positive confirmations in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <SuccessIcon />
 * 
 * // With custom size and color
 * <SuccessIcon size="lg" color="success" />
 * 
 * // In a success context
 * <Button icon={<SuccessIcon />}>Success</Button>
 * ```
 */
export const SuccessIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M9 12l2 2 4-4 M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
      {...props}
    />
  );
};