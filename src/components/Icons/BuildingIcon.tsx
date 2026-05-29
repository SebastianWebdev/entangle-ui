'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Building icon component for organizations and architectural contexts.
 *
 * A multi-story building with windows, commonly used for company entries,
 * workspaces, and architecture-related personas or sections.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BuildingIcon />
 *
 * // With custom size and color
 * <BuildingIcon size="md" color="secondary" />
 *
 * // In a company picker
 * <Button icon={<BuildingIcon />}>Organization</Button>
 * ```
 */
export const BuildingIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <line x1="9" y1="22" x2="9" y2="18" />
      <line x1="15" y1="22" x2="15" y2="18" />
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="8" y1="6" x2="8" y2="6" />
      <line x1="12" y1="6" x2="12" y2="6" />
      <line x1="16" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="8" y2="10" />
      <line x1="12" y1="10" x2="12" y2="10" />
      <line x1="16" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" />
      <line x1="12" y1="14" x2="12" y2="14" />
      <line x1="16" y1="14" x2="16" y2="14" />
    </Icon>
  );
});

BuildingIcon.displayName = 'BuildingIcon';
