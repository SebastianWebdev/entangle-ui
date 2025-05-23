import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Edit icon component for edit/modify actions.
 * 
 * A standard pencil icon commonly used for editing content,
 * modifying data, and text editing functionality in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <EditIcon />
 * 
 * // With custom size and color
 * <EditIcon size="lg" color="primary" />
 * 
 * // In an edit button
 * <Button icon={<EditIcon />}>Edit</Button>
 * ```
 */
export const EditIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="m11 4 6 6-6 6H5v-6l6-6zm0 0 3-3a2 2 0 012.828 0L19.657 3.828A2 2 0 0119.657 6.657L17 9.414"
      {...props}
    />
  );
};
