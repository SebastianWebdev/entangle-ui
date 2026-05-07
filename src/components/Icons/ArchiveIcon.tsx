'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Archive icon component for archiving and storing items.
 *
 * A box with a lid commonly used for archiving content,
 * moving items out of active views, and long-term storage actions.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ArchiveIcon />
 *
 * // With custom size and color
 * <ArchiveIcon size="md" color="muted" />
 *
 * // In an archive action
 * <Button icon={<ArchiveIcon />}>Archive</Button>
 * ```
 */
export const ArchiveIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <line x1="10" y1="13" x2="14" y2="13" />
    </Icon>
  );
});

ArchiveIcon.displayName = 'ArchiveIcon';
