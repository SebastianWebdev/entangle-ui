'use client';

import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Arrow Right icon component for rightward navigation and forward actions.
 *
 * A standard rightward-pointing arrow commonly used for next buttons,
 * forward navigation, and rightward movement in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ArrowRightIcon />
 *
 * // With custom size and color
 * <ArrowRightIcon size="lg" color="primary" />
 *
 * // In a next button
 * <Button icon={<ArrowRightIcon />}>Next</Button>
 * ```
 */
export const ArrowRightIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <path d="M10 17l5-5-5-5v10z" />
    </Icon>
  );
});

ArrowRightIcon.displayName = 'ArrowRightIcon';
