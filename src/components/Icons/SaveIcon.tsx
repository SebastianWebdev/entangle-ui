// src/icons/SaveIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Save icon component for save actions.
 * 
 * A standard floppy disk icon commonly used for saving files,
 * persisting data, and storage operations in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <SaveIcon />
 * 
 * // With custom size and color
 * <SaveIcon size="lg" color="success" />
 * 
 * // In a save button
 * <Button icon={<SaveIcon />}>Save</Button>
 * ```
 */
export const SaveIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </Icon>
  );
};