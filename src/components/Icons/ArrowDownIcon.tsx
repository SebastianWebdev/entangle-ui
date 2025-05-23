// src/icons/ArrowDownIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Arrow Down icon component for downward navigation.
 * 
 * A standard downward arrow icon commonly used for navigation down,
 * sorting descending, and directional controls in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ArrowDownIcon />
 * 
 * // With custom size and color
 * <ArrowDownIcon size="md" color="primary" />
 * 
 * // In a navigation context
 * <Button icon={<ArrowDownIcon />}>Move Down</Button>
 * ```
 */
export const ArrowDownIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M12 5v14 M19 12l-7 7-7-7"
      {...props}
    />
  );
};