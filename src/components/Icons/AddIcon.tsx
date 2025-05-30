// src/icons/AddIcon.tsx
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
export const AddIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Icon>
  );
};
