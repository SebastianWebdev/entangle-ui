// src/icons/UnlockIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Unlock icon component for security and unlocked states.
 *
 * A standard open padlock icon commonly used for indicating unlocked content,
 * accessible features, and unprotected operations in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <UnlockIcon />
 *
 * // With custom size and color
 * <UnlockIcon size="md" color="success" />
 *
 * // In a security context
 * <Button icon={<UnlockIcon />}>Unlock</Button>
 * ```
 */
export const UnlockIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </Icon>
  );
};
