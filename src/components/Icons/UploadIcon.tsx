// src/icons/UploadIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Upload icon component for upload actions.
 * 
 * A standard upload arrow icon commonly used for uploading files,
 * importing data, and file transfer operations in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <UploadIcon />
 * 
 * // With custom size and color
 * <UploadIcon size="lg" color="primary" />
 * 
 * // In an upload button
 * <Button icon={<UploadIcon />}>Upload</Button>
 * ```
 */
export const UploadIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15l3-3 3 3"
      {...props}
    />
  );
};