'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Copy icon component for duplication and clipboard actions.
 *
 * A standard copy icon commonly used for copying content,
 * duplicating items, and clipboard operations in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CopyIcon />
 *
 * // With custom size and color
 * <CopyIcon size="md" color="primary" />
 *
 * // In a copy button
 * <Button icon={<CopyIcon />}>Copy</Button>
 * ```
 */
export const CopyIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </Icon>
    );
  }
);

CopyIcon.displayName = 'CopyIcon';
