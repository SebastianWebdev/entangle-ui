'use client';

// src/icons/PasteIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Paste icon component for paste actions.
 *
 * A standard clipboard icon commonly used for pasting content,
 * inserting items, and clipboard operations in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PasteIcon />
 *
 * // With custom size and color
 * <PasteIcon size="lg" color="primary" />
 *
 * // In a paste button
 * <Button icon={<PasteIcon />}>Paste</Button>
 * ```
 */
export const PasteIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </Icon>
    );
  }
);

PasteIcon.displayName = 'PasteIcon';
