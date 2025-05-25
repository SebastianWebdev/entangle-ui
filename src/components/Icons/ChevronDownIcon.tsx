import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Chevron Down icon component for dropdown and expansion indicators.
 * 
 * A subtle downward chevron commonly used for dropdown menus,
 * accordion expansion, and subtle directional cues in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ChevronDownIcon />
 * 
 * // With custom size and color
 * <ChevronDownIcon size="sm" color="muted" />
 * 
 * // In a dropdown
 * <Select icon={<ChevronDownIcon />}>Options</Select>
 * ```
 */
export const ChevronDownIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <polyline points="6,9 12,15 18,9" />
    </Icon>
  );
};
