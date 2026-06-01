'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Image icon component for picture and raster-asset files.
 *
 * A framed photo with a sun/horizon and a mountain ridge — the conventional
 * glyph for image files (`.png`, `.jpg`, `.svg`, …) in file browsers and
 * asset trees.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ImageIcon />
 *
 * // With custom size and color
 * <ImageIcon size="md" color="secondary" />
 *
 * // As a file-type glyph
 * <FileTree resolveIcon={() => <ImageIcon />} nodes={nodes} />
 * ```
 */
export const ImageIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </Icon>
    );
  }
);

ImageIcon.displayName = 'ImageIcon';
