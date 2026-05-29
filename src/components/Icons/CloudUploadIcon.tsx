'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Cloud upload icon — a cloud silhouette with an upward arrow inside.
 *
 * Use for file-upload drop zones, "send to cloud" actions, and any other
 * upload-to-remote affordance. For a generic up-arrow without the cloud,
 * use `UploadIcon` instead.
 *
 * @example
 * ```tsx
 * <CloudUploadIcon size="lg" color="muted" />
 * ```
 */
export const CloudUploadIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <path d="M7 18a4 4 0 1 1 .5-7.97A6 6 0 0 1 18 11h.5a3.5 3.5 0 0 1 0 7H7z" />
      <path d="M12 13v5m0-5l-2 2m2-2l2 2" />
    </Icon>
  );
});

CloudUploadIcon.displayName = 'CloudUploadIcon';
