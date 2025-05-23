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
export const UnlockIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M8 11V7a4 4 0 017.748-.905M12 15v2m-6-6h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z"
      {...props}
    />
  );
};