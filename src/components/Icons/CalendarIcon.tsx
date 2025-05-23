// src/icons/CalendarIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Calendar icon component for date and scheduling.
 * 
 * A standard calendar icon commonly used for date pickers,
 * scheduling features, and time-based operations in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <CalendarIcon />
 * 
 * // With custom size and color
 * <CalendarIcon size="lg" color="accent" />
 * 
 * // In a date context
 * <Button icon={<CalendarIcon />}>Schedule</Button>
 * ```
 */
export const CalendarIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18"
      {...props}
    />
  );
};