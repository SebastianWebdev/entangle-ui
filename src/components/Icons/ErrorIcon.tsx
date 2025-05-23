// src/icons/ErrorIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Error icon component for error states.
 * 
 * A standard X circle icon commonly used for error messages,
 * failed operations, and critical alerts in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorIcon />
 * 
 * // With custom size and color
 * <ErrorIcon size="sm" color="error" />
 * 
 * // In an error context
 * <Button icon={<ErrorIcon />}>Error</Button>
 * ```
 */
export const ErrorIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M18 6L6 18 M6 6l12 12 M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
      {...props}
    />
  );
};