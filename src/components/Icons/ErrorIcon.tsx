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
export const ErrorIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </Icon>
  );
};