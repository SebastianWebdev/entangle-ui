// src/icons/ArrowLeftIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Arrow Left icon component for leftward navigation.
 * 
 * A standard leftward arrow icon commonly used for back navigation,
 * previous actions, and directional controls in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ArrowLeftIcon />
 * 
 * // With custom size and color
 * <ArrowLeftIcon size="lg" color="secondary" />
 * 
 * // In a navigation context
 * <Button icon={<ArrowLeftIcon />}>Back</Button>
 * ```
 */
export const ArrowLeftIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M19 12H5 M12 19l-7-7 7-7"
      {...props}
    />
  );
};