'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

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
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
    </Icon>
  );
});

FolderOpenIcon.displayName = 'FolderOpenIcon';
