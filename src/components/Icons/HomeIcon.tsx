'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Home icon component for home and main navigation.
 *
 * A standard house icon commonly used for home navigation,
 * main page links, and dashboard access in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <HomeIcon />
 *
 * // With custom size and color
 * <HomeIcon size="md" color="primary" />
 *
 * // In a home button
 * <Button icon={<HomeIcon />}>Home</Button>
 * ```
 */
export const HomeIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </Icon>
    );
  }
);

HomeIcon.displayName = 'HomeIcon';
