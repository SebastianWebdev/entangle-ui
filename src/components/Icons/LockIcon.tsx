// src/icons/LockIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Lock icon component for security and locked states.
 *
 * A standard padlock icon commonly used for indicating locked content,
 * security features, and protected operations in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LockIcon />
 *
 * // With custom size and color
 * <LockIcon size="sm" color="warning" />
 *
 * // In a security context
 * <Button icon={<LockIcon />}>Lock</Button>
 * ```
 */
export const LockIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  );
};
