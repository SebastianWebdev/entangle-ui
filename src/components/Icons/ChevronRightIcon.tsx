'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Chevron Right icon component for forward navigation and expand.
 *
 * A subtle rightward chevron commonly used for next-page navigation,
 * expanding side panels, and disclosure indicators.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ChevronRightIcon />
 *
 * // With custom size and color
 * <ChevronRightIcon size="sm" color="muted" />
 *
 * // In a sidebar expand button
 * <IconButton icon={<ChevronRightIcon />} label="Expand sidebar" />
 * ```
 */
export const ChevronRightIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <polyline points="9,18 15,12 9,6" />
    </Icon>
  );
});

ChevronRightIcon.displayName = 'ChevronRightIcon';
