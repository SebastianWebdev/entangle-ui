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
export const InfoIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </Icon>
  );
};