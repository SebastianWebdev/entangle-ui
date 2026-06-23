'use client';

// src/icons/SpinIcon.tsx
import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Spin icon component for continuous-rotation and turntable actions.
 *
 * An open three-quarter ring — the conventional "spinning" glyph used for
 * auto-rotate / turntable toggles and busy states. Unlike `RotateIcon` it
 * has no arrowhead, reading as ongoing motion rather than a single rotate
 * step; pair it with a CSS spin animation for a loading affordance.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SpinIcon />
 *
 * // With custom size and color
 * <SpinIcon size="md" color="accent" />
 *
 * // As an auto-rotate toggle
 * <IconButton icon={<SpinIcon />} label="Auto-rotate" />
 * ```
 */
export const SpinIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </Icon>
    );
  }
);

SpinIcon.displayName = 'SpinIcon';
