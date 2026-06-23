'use client';

// src/icons/CameraIcon.tsx
import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Camera icon component for viewport cameras and capture actions.
 *
 * A camera body with a centered lens — the conventional glyph for scene
 * cameras, "look through camera", framing controls, and screenshot/capture
 * actions in editor viewports.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CameraIcon />
 *
 * // With custom size and color
 * <CameraIcon size="lg" color="secondary" />
 *
 * // As a viewport camera control
 * <IconButton icon={<CameraIcon />} label="Frame camera" />
 * ```
 */
export const CameraIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </Icon>
    );
  }
);

CameraIcon.displayName = 'CameraIcon';
