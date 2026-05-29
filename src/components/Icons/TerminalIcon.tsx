'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * Terminal icon component for shells, command palettes, and CLI panels.
 *
 * A prompt caret with an underscore line, commonly used for terminal
 * panels, command palette triggers, and shell-related actions.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TerminalIcon />
 *
 * // With custom size and color
 * <TerminalIcon size="md" color="secondary" />
 *
 * // In a command palette trigger
 * <IconButton icon={<TerminalIcon />} label="Open terminal" />
 * ```
 */
export const TerminalIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </Icon>
  );
});

TerminalIcon.displayName = 'TerminalIcon';
