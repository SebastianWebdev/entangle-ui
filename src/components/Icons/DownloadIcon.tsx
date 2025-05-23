// src/icons/DownloadIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Download icon component for download actions.
 * 
 * A standard download arrow icon commonly used for downloading files,
 * exporting data, and save operations in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <DownloadIcon />
 * 
 * // With custom size and color
 * <DownloadIcon size="md" color="success" />
 * 
 * // In a download button
 * <Button icon={<DownloadIcon />}>Download</Button>
 * ```
 */
export const DownloadIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3M8 12l4 4 4-4M12 2v14"
      {...props}
    />
  );
};