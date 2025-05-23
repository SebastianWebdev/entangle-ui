import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Add icon component for create/add actions.
 * 
 * A standard plus icon commonly used for adding new items,
 * creating content, and expand functionality in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <AddIcon />
 * 
 * // With custom size and color
 * <AddIcon size="lg" color="primary" />
 * 
 * // In an add button
 * <Button icon={<AddIcon />}>Add Item</Button>
 * ```
 */
export const AddIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M12 5v14m-7-7h14"
      {...props}
    />
  );
};
