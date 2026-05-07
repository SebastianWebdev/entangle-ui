'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Folder Open icon component for opened directory states.
 *
 * An open folder with an angled front flap, commonly paired with the closed
 * `FolderIcon` for project switchers, file explorer reveals, and breadcrumbs.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FolderOpenIcon />
 *
 * // With custom size and color
 * <FolderOpenIcon size="lg" color="primary" />
 *
 * // In a switch project action
 * <Button icon={<FolderOpenIcon />}>Switch Project</Button>
 * ```
 */
export const FolderOpenIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v1" />
      <path d="M3 10h18l-2 9a2 2 0 0 1-2 1.6H5a2 2 0 0 1-2-1.6z" />
    </Icon>
  );
});

FolderOpenIcon.displayName = 'FolderOpenIcon';
