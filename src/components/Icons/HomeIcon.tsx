// src/icons/HomeIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Home icon component for home/dashboard navigation.
 * 
 * A standard house icon commonly used for home navigation,
 * dashboard links, and main page access in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <HomeIcon />
 * 
 * // With custom size and color
 * <HomeIcon size="lg" color="primary" />
 * 
 * // In a navigation context
 * <Button icon={<HomeIcon />}>Home</Button>
 * ```
 */
export const HomeIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"
      {...props}
    />
  );
};