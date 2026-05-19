'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * External link icon — a box with an arrow exiting the top-right corner.
 *
 * Use for links that open in a new tab/window or otherwise navigate
 * outside the current surface. For an in-app link (chain shape) use
 * `LinkIcon` instead.
 *
 * @example
 * ```tsx
 * <Link href="https://example.com" target="_blank">
 *   Docs <ExternalLinkIcon size="sm" decorative />
 * </Link>
 * ```
 */
export const ExternalLinkIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </Icon>
  );
});

ExternalLinkIcon.displayName = 'ExternalLinkIcon';
