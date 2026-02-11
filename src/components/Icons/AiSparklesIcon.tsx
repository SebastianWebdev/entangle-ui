'use client';

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
export const AiSparklesIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <path d="M9 1l2 6L17 9l-6 2L9 17l-2-6L1 9l6-2Z" />
      <path d="M19 1l1 3L23 5l-3 1L19 9l-1-3L15 5l3-1Z" />
      <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75Z" />
    </Icon>
  );
});

AiSparklesIcon.displayName = 'AiSparklesIcon';
