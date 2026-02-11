'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Close icon component for dismissing and closing actions.
 *
 * A standard X icon commonly used for closing modals,
 * dismissing notifications, and cancel actions in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CloseIcon />
 *
 * // With custom size and color
 * <CloseIcon size="sm" color="muted" />
 *
 * // In a close button
 * <IconButton icon={<CloseIcon />} aria-label="Close" />
 * ```
 */
export const CloseIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </Icon>
    );
  }
);

CloseIcon.displayName = 'CloseIcon';
