'use client';

// src/icons/CheckIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Check icon component for confirmation and selection states.
 *
 * A standard checkmark icon commonly used for checkboxes, confirmation dialogs,
 * completed tasks, and success states in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CheckIcon />
 *
 * // With custom size and color
 * <CheckIcon size="lg" color="success" />
 *
 * // In a confirmation button
 * <Button icon={<CheckIcon />}>Confirm</Button>
 * ```
 */
export const CheckIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <polyline points="20,6 9,17 4,12" />
      </Icon>
    );
  }
);

CheckIcon.displayName = 'CheckIcon';
