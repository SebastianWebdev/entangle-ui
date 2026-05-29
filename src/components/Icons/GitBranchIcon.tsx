'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Git Branch icon component for version-control branch contexts.
 *
 * A trunk line with a fork to a side node, commonly used for branch
 * indicators in status bars, branch pickers, and VCS-related actions.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <GitBranchIcon />
 *
 * // With custom size and color
 * <GitBranchIcon size="sm" color="muted" />
 *
 * // In a status bar
 * <Button icon={<GitBranchIcon />}>main</Button>
 * ```
 */
export const GitBranchIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </Icon>
  );
});

GitBranchIcon.displayName = 'GitBranchIcon';
