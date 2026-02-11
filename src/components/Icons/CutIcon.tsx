'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Cut icon component for cutting and removal actions.
 *
 * A standard scissors icon commonly used for cutting content,
 * removing items, and clipboard cut operations in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CutIcon />
 *
 * // With custom size and color
 * <CutIcon size="md" color="primary" />
 *
 * // In a cut button
 * <Button icon={<CutIcon />}>Cut</Button>
 * ```
 */
export const CutIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </Icon>
    );
  }
);

CutIcon.displayName = 'CutIcon';
