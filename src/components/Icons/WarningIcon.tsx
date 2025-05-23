// src/icons/WarningIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Warning icon component for warning states.
 * 
 * A standard triangle with exclamation icon commonly used for warnings,
 * caution messages, and alert notifications in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <WarningIcon />
 * 
 * // With custom size and color
 * <WarningIcon size="md" color="warning" />
 * 
 * // In a warning context
 * <Button icon={<WarningIcon />}>Warning</Button>
 * ```
 */
export const WarningIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01"
      {...props}
    />
  );
};