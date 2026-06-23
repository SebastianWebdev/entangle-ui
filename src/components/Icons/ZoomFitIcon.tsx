'use client';

// src/icons/ZoomFitIcon.tsx
import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Zoom-to-fit icon component for framing content to the viewport.
 *
 * A corner frame around a focal point — the conventional glyph for
 * "zoom to fit", "frame selected", and "fit to view" actions that reset the
 * camera so the content fills the viewport. Distinct from `FullscreenIcon`
 * (outward expand arrows) and `MaximizeIcon` (a plain window outline).
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ZoomFitIcon />
 *
 * // With custom size and color
 * <ZoomFitIcon size="md" color="accent" />
 *
 * // In a viewport control bar
 * <IconButton icon={<ZoomFitIcon />} label="Zoom to fit" />
 * ```
 */
export const ZoomFitIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
});

ZoomFitIcon.displayName = 'ZoomFitIcon';
