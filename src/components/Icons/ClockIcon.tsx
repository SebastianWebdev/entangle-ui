// src/icons/ClockIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Clock icon component for time and timing.
 * 
 * A standard clock icon commonly used for time displays,
 * timing controls, and temporal features in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ClockIcon />
 * 
 * // With custom size and color
 * <ClockIcon size="md" color="primary" />
 * 
 * // In a time context
 * <Button icon={<ClockIcon />}>Timer</Button>
 * ```
 */
export const ClockIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M12 6v6l4 2 M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
      {...props}
    />
  );
};