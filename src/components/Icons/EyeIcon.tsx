import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Eye icon component for visibility and view actions.
 * 
 * A standard eye icon commonly used for showing content,
 * toggling visibility, and preview actions in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <EyeIcon />
 * 
 * // With custom size and color
 * <EyeIcon size="md" color="primary" />
 * 
 * // In a visibility toggle
 * <Button icon={<EyeIcon />}>Show</Button>
 * ```
 */
export const EyeIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
};
