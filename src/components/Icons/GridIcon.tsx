'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Grid icon component for grid view and layout actions.
 *
 * A standard grid icon commonly used for switching to grid view,
 * layout options, and organizing content in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <GridIcon />
 *
 * // With custom size and color
 * <GridIcon size="md" color="primary" />
 *
 * // In a view toggle
 * <Button icon={<GridIcon />}>Grid View</Button>
 * ```
 */
export const GridIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </Icon>
    );
  }
);

GridIcon.displayName = 'GridIcon';
