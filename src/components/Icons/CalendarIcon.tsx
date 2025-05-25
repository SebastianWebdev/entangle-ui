import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Calendar icon component for date and scheduling functionality.
 * 
 * A standard calendar icon commonly used for date pickers,
 * scheduling, and time-related features in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <CalendarIcon />
 * 
 * // With custom size and color
 * <CalendarIcon size="lg" color="primary" />
 * 
 * // In a date picker
 * <Button icon={<CalendarIcon />}>Select Date</Button>
 * ```
 */
export const CalendarIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Icon>
  );
};
