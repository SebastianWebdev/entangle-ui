import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Clock icon component for time and scheduling functionality.
 *
 * A standard clock icon commonly used for time displays,
 * scheduling features, and temporal indicators in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ClockIcon />
 *
 * // With custom size and color
 * <ClockIcon size="lg" color="primary" />
 *
 * // In a time picker
 * <Button icon={<ClockIcon />}>Set Time</Button>
 * ```
 */
export const ClockIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </Icon>
  );
};
