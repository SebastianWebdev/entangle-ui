'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Skip to first icon — vertical bar plus a leftward chevron.
 *
 * Used by Pagination's "first page" button and similar
 * jump-to-start controls.
 *
 * @example
 * ```tsx
 * <IconButton aria-label="First page"><FirstIcon /></IconButton>
 * ```
 */
export const FirstIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M6 5v14M18 5l-7 7 7 7" />
      </Icon>
    );
  }
);

FirstIcon.displayName = 'FirstIcon';
