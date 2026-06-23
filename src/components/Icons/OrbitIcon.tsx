'use client';

// src/icons/OrbitIcon.tsx
import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Orbit icon component for camera-orbit and rotate-around actions.
 *
 * A central body with two satellites tracing an orbital ring — the
 * conventional glyph for orbiting a camera around a pivot, turntable views,
 * and "rotate around target" tools in 2D/3D editor viewports.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <OrbitIcon />
 *
 * // With custom size and color
 * <OrbitIcon size="lg" color="accent" />
 *
 * // In a viewport tool button
 * <IconButton icon={<OrbitIcon />} label="Orbit camera" />
 * ```
 */
export const OrbitIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M20.341 6.484A10 10 0 0 1 10.266 21.85" />
        <path d="M3.659 17.516A10 10 0 0 1 13.74 2.152" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="19" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
      </Icon>
    );
  }
);

OrbitIcon.displayName = 'OrbitIcon';
