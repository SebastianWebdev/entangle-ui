// src/icons/ArrowRightIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Arrow Right icon component for rightward navigation.
 * 
 * A standard rightward arrow icon commonly used for forward navigation,
 * next actions, and directional controls in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ArrowRightIcon />
 * 
 * // With custom size and color
 * <ArrowRightIcon size="sm" color="accent" />
 * 
 * // In a navigation context
 * <Button icon={<ArrowRightIcon />}>Next</Button>
 * ```
 */
export const ArrowRightIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M5 12h14 M12 5l7 7-7 7"
      {...props}
    />
  );
};