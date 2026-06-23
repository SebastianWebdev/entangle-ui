'use client';

// src/icons/RotateIcon.tsx
import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Rotate icon component for rotate transforms and rotate-tool actions.
 *
 * A clockwise circular arrow — the conventional glyph for the rotate gizmo,
 * "rotate 90°" actions, and orientation controls in editor viewports.
 * Distinct from `RefreshIcon` (a two-headed reload arrow) so rotate and
 * reload never read the same.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <RotateIcon />
 *
 * // With custom size and color
 * <RotateIcon size="md" color="accent" />
 *
 * // In a transform toolbar
 * <Toolbar.Button icon={<RotateIcon />} tooltip="Rotate" />
 * ```
 */
export const RotateIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      </Icon>
    );
  }
);

RotateIcon.displayName = 'RotateIcon';
