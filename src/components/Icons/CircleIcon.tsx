'use client';

// src/icons/CircleIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Circle icon component for radio buttons and dot indicators.
 *
 * A standard circle icon commonly used for radio button selections,
 * dot indicators, and circular markers in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CircleIcon />
 *
 * // With custom size and color
 * <CircleIcon size="lg" color="primary" />
 *
 * // In a radio selection
 * <Button icon={<CircleIcon />}>Option</Button>
 * ```
 */
export const CircleIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <circle cx="12" cy="12" r="10" />
      </Icon>
    );
  }
);

CircleIcon.displayName = 'CircleIcon';
