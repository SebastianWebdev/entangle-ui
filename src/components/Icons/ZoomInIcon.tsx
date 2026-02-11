'use client';

// src/icons/ZoomInIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Zoom In icon component for zoom in actions.
 *
 * A standard magnifying glass with plus icon commonly used for zooming in,
 * enlarging content, and scale increase operations in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ZoomInIcon />
 *
 * // With custom size and color
 * <ZoomInIcon size="md" color="accent" />
 *
 * // In a zoom context
 * <Button icon={<ZoomInIcon />}>Zoom In</Button>
 * ```
 */
export const ZoomInIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </Icon>
    );
  }
);

ZoomInIcon.displayName = 'ZoomInIcon';
