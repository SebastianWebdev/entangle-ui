'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Minus icon component for remove/decrement actions.
 *
 * A single horizontal stroke commonly used to remove items, decrement
 * counters, and zoom out. Pairs with `AddIcon` for [+/-] controls.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <MinusIcon />
 *
 * // With custom size and color
 * <MinusIcon size="sm" color="muted" />
 *
 * // In a counter control
 * <IconButton icon={<MinusIcon />} label="Decrease" />
 * ```
 */
export const MinusIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <line x1="5" y1="12" x2="19" y2="12" />
      </Icon>
    );
  }
);

MinusIcon.displayName = 'MinusIcon';
