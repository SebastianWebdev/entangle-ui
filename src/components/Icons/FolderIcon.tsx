'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Folder icon component for directory and organization actions.
 *
 * A standard folder icon commonly used for file organization,
 * directory navigation, and grouping content in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FolderIcon />
 *
 * // With custom size and color
 * <FolderIcon size="lg" color="primary" />
 *
 * // In a folder browser
 * <Button icon={<FolderIcon />}>Open Folder</Button>
 * ```
 */
export const FolderIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </Icon>
    );
  }
);

FolderIcon.displayName = 'FolderIcon';
