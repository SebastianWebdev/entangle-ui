'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Download icon component for file download actions.
 *
 * A standard download icon commonly used for downloading files,
 * exporting content, and save-to-device actions in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DownloadIcon />
 *
 * // With custom size and color
 * <DownloadIcon size="lg" color="success" />
 *
 * // In a download button
 * <Button icon={<DownloadIcon />}>Download</Button>
 * ```
 */
export const DownloadIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </Icon>
  );
});

DownloadIcon.displayName = 'DownloadIcon';
