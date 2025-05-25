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
export const SuccessIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="9,12 12,15 16,10" />
    </Icon>
  );
};