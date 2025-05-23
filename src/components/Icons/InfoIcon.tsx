// src/icons/InfoIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Info icon component for information display.
 * 
 * A standard information circle icon commonly used for showing information,
 * details, and contextual help in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <InfoIcon />
 * 
 * // With custom size and color
 * <InfoIcon size="lg" color="accent" />
 * 
 * // In an info context
 * <Button icon={<InfoIcon />}>Info</Button>
 * ```
 */
export const InfoIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M12 16v-4 M12 8h.01 M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
      {...props}
    />
  );
};