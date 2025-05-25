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
export const UploadIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </Icon>
  );
};