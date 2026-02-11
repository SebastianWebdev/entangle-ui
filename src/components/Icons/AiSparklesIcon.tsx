import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * AI sparkles icon component representing artificial intelligence.
 *
 * Three 4-pointed sparkle stars at different sizes,
 * commonly used for AI features, generative tools,
 * and smart suggestions in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AiSparklesIcon />
 *
 * // With custom size and color
 * <AiSparklesIcon size="lg" color="primary" />
 *
 * // In an AI action button
 * <Button icon={<AiSparklesIcon />}>Generate</Button>
 * ```
 */
export const AiSparklesIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <path d="M10 2l1.5 5.5L17 9l-5.5 1.5L10 16l-1.5-5.5L3 9l5.5-1.5Z" />
      <path d="M19 2l.75 2.25L22 5l-2.25.75L19 8l-.75-2.25L16 5l2.25-.75Z" />
      <path d="M18 16l.5 1.5L20 18l-1.5.5L18 20l-.5-1.5L16 18l1.5-.5Z" />
    </Icon>
  );
};
