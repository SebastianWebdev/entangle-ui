import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Trash icon component for delete/remove actions.
 * 
 * A standard trash can icon commonly used for delete operations
 * in editor interfaces and applications.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <TrashIcon />
 * 
 * // With custom size and color
 * <TrashIcon size="lg" color="error" />
 * 
 * // In a delete button
 * <Button icon={<TrashIcon />}>Delete</Button>
 * ```
 */
export const TrashIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2m-6 5v6m4-6v6"
      {...props}
    />
  );
};
