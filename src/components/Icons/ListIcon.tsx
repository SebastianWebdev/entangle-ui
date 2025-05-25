import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * List icon component for list view and organization.
 * 
 * A standard list icon commonly used for switching to list view,
 * organizing content, and displaying items in editor interfaces.
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
export const ListIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>