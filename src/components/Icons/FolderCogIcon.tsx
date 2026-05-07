'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Folder Cog icon component for project-scoped settings.
 *
 * A folder with a small gear overlay, commonly used to distinguish
 * project-level settings from general application settings.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FolderCogIcon />
 *
 * // With custom size and color
 * <FolderCogIcon size="md" color="secondary" />
 *
 * // In a settings sidebar entry
 * <Button icon={<FolderCogIcon />}>Project Settings</Button>
 * ```
 */
export const FolderCogIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <path d="M12 21H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v3" />
      <circle cx="18" cy="18" r="2.5" />
      <line x1="18" y1="14.5" x2="18" y2="15.5" />
      <line x1="18" y1="20.5" x2="18" y2="21.5" />
      <line x1="14.5" y1="18" x2="15.5" y2="18" />
      <line x1="20.5" y1="18" x2="21.5" y2="18" />
      <line x1="15.5" y1="15.5" x2="16.2" y2="16.2" />
      <line x1="19.8" y1="19.8" x2="20.5" y2="20.5" />
      <line x1="20.5" y1="15.5" x2="19.8" y2="16.2" />
      <line x1="16.2" y1="19.8" x2="15.5" y2="20.5" />
    </Icon>
  );
});

FolderCogIcon.displayName = 'FolderCogIcon';
