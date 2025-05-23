import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Eye icon component for visibility/show actions.
 * 
 * A standard eye icon commonly used for showing/hiding content,
 * toggling visibility, and preview functionality in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <EyeIcon />
 * 
 * // With custom size and color
 * <EyeIcon size="lg" color="primary" />
 * 
 * // In a visibility toggle button
 * <Button icon={<EyeIcon />}>Show</Button>
 * ```
 */
export const EyeIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z"
      {...props}
    />
  );
};
