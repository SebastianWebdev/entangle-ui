// src/icons/ListIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * List icon component for list view layouts.
 *
 * A standard list lines icon commonly used for switching to list view,
 * linear data display, and structured content in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ListIcon />
 *
 * // With custom size and color
 * <ListIcon size="md" color="primary" />
 *
 * // In a view toggle
 * <Button icon={<ListIcon />}>List View</Button>
 * ```
 */
export const ListIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </Icon>
  );
};
