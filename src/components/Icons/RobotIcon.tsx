'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Robot icon component representing AI or automation.
 *
 * A robot head icon commonly used for AI assistant features,
 * chatbots, and automation actions in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <RobotIcon />
 *
 * // With custom size and color
 * <RobotIcon size="lg" color="primary" />
 *
 * // In an AI chat button
 * <Button icon={<RobotIcon />}>AI Assistant</Button>
 * ```
 */
export const RobotIcon = /*#__PURE__*/ React.memo<Omit<IconProps, 'children'>>(
  props => {
    return (
      <Icon {...props}>
        <rect x="5" y="9" width="14" height="10" rx="2" />
        <circle cx="9.5" cy="14" r="1" />
        <circle cx="14.5" cy="14" r="1" />
        <line x1="12" y1="9" x2="12" y2="5" />
        <circle cx="12" cy="4" r="1" />
        <line x1="5" y1="13" x2="3" y2="13" />
        <line x1="19" y1="13" x2="21" y2="13" />
      </Icon>
    );
  }
);

RobotIcon.displayName = 'RobotIcon';
