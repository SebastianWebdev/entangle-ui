import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * AI Chat icon component for AI assistant chat interfaces.
 *
 * A chat bubble with a sparkle accent, commonly used for
 * AI chat panels, assistant toggles, and conversational
 * AI features in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AiChatIcon />
 *
 * // With custom size and color
 * <AiChatIcon size="lg" color="accent" />
 *
 * // In a toolbar toggle
 * <Toolbar.Toggle icon={<AiChatIcon size="sm" />} tooltip="AI Chat" />
 * ```
 */
export const AiChatIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M14.5 7l.5 1.5L16.5 9l-1.5.5L14.5 11l-.5-1.5L12.5 9l1.5-.5Z" />
    </Icon>
  );
};
