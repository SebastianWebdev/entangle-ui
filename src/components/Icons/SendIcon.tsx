'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Send icon component for submitting messages and forms.
 *
 * A paper plane silhouette commonly used as the trigger for
 * sending chat messages, dispatching commands, and form submissions.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SendIcon />
 *
 * // With custom size and color
 * <SendIcon size="md" color="accent" />
 *
 * // In a chat input
 * <IconButton icon={<SendIcon />} label="Send message" />
 * ```
 */
export const SendIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </Icon>
    );
  }
);

SendIcon.displayName = 'SendIcon';
