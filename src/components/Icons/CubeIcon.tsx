'use client';

// src/icons/CubeIcon.tsx
import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Cube icon component for 3D objects, meshes, and axis/scene markers.
 *
 * An isometric box with visible top edges and a vertical center seam — the
 * conventional glyph for 3D primitives, mesh/scene-object entries, and
 * "3D view" or axis affordances in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CubeIcon />
 *
 * // With custom size and color
 * <CubeIcon size="md" color="accent" />
 *
 * // As a scene-object glyph
 * <TreeView resolveIcon={() => <CubeIcon />} nodes={nodes} />
 * ```
 */
export const CubeIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </Icon>
    );
  }
);

CubeIcon.displayName = 'CubeIcon';
