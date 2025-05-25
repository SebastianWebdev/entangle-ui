import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Edit icon component for editing and modification actions.
 * 
 * A standard pencil icon commonly used for editing content,
 * modifying items, and entering edit mode in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <EditIcon />
 * 
 * // With custom size and color
 * <EditIcon size="md" color="primary" />
 * 
 * // In an edit button
 *  <Button icon={<EditIcon />}>Edit</Button>
 * ```
 */
export const EditIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Icon>
  );
};
