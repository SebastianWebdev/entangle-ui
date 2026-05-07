'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Bug icon component for debugging and issue reporting.
 *
 * A symmetrical insect silhouette commonly used for debugger panels,
 * "Report bug" actions, and error severity indicators.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BugIcon />
 *
 * // With custom size and color
 * <BugIcon size="md" color="error" />
 *
 * // In a debugger panel toggle
 * <IconButton icon={<BugIcon />} label="Toggle debugger" />
 * ```
 */
export const BugIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <path d="M9 9V8a3 3 0 0 1 6 0v1" />
        <path d="M8 9h8a6 6 0 0 1 1 3v3a5 5 0 0 1-10 0v-3a6 6 0 0 1 1-3z" />
        <line x1="3" y1="13" x2="7" y2="13" />
        <line x1="17" y1="13" x2="21" y2="13" />
        <line x1="12" y1="20" x2="12" y2="14" />
        <line x1="4" y1="19" x2="7.35" y2="17" />
        <line x1="20" y1="19" x2="16.65" y2="17" />
        <line x1="4" y1="7" x2="7.75" y2="9.4" />
        <line x1="20" y1="7" x2="16.25" y2="9.4" />
      </Icon>
    );
  }
);

BugIcon.displayName = 'BugIcon';
