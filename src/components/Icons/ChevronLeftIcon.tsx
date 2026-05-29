'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Chevron Left icon component for backward navigation and collapse.
 *
 * A subtle leftward chevron commonly used for previous-page navigation,
 * collapsing side panels, and breadcrumb separators.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ChevronLeftIcon />
 *
 * // With custom size and color
 * <ChevronLeftIcon size="sm" color="muted" />
 *
 * // In a sidebar collapse button
 * <IconButton icon={<ChevronLeftIcon />} label="Collapse sidebar" />
 * ```
 */
export const ChevronLeftIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <polyline points="15,18 9,12 15,6" />
    </Icon>
  );
});

ChevronLeftIcon.displayName = 'ChevronLeftIcon';
