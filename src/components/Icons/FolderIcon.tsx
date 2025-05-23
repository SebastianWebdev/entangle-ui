import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Folder icon component for directory/folder actions.
 * 
 * A standard folder icon commonly used for file system navigation,
 * organizing content, and representing directories in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <FolderIcon />
 * 
 * // With custom size and color
 * <FolderIcon size="lg" color="primary" />
 * 
 * // In a folder button
 * <Button icon={<FolderIcon />}>Open Folder</Button>
 * ```
 */
export const FolderIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M4 4h6l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"
      {...props}
    />
  );
};
