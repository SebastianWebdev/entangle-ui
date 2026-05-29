'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Skip to last icon — rightward chevron plus a vertical bar.
 *
 * Used by Pagination's "last page" button and similar
 * jump-to-end controls.
 *
 * @example
 * ```tsx
 * <IconButton aria-label="Last page"><LastIcon /></IconButton>
 * ```
 */
export const LastIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M18 5v14M6 5l7 7-7 7" />
      </Icon>
    );
  }
);

LastIcon.displayName = 'LastIcon';
