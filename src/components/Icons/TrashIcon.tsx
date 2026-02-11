'use client';

// src/icons/TrashIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Trash icon component for delete actions.
 *
 * A standard trash can icon commonly used for deleting items,
 * removing content, and destructive operations in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TrashIcon />
 *
 * // With custom size and color
 * <TrashIcon size="md" color="error" />
 *
 * // In a delete button
 * <Button icon={<TrashIcon />}>Delete</Button>
 * ```
 */
export const TrashIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <polyline points="3,6 5,6 21,6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </Icon>
    );
  }
);

TrashIcon.displayName = 'TrashIcon';
