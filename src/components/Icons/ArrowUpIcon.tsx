// src/icons/ArrowUpIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Arrow Up icon component for upward navigation.
 * 
 * A standard upward arrow icon commonly used for navigation up,
 * sorting ascending, and directional controls in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ArrowUpIcon />
 * 
 * // With custom size and color
 * <ArrowUpIcon size="md" color="primary" />
 * 
 * // In a navigation context
 * <Button icon={<ArrowUpIcon />}>Move Up</Button>
 * ```
 */
export const ArrowUpIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M12 19V5 M5 12l7-7 7 7"
      {...props}
    />
  );
};