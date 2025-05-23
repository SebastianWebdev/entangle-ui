// src/icons/ChevronDownIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Chevron Down icon component for downward expansion.
 * 
 * A standard downward chevron icon commonly used for expanding content,
 * dropdown controls, and subtle directional navigation in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ChevronDownIcon />
 * 
 * // With custom size and color
 * <ChevronDownIcon size="lg" color="primary" />
 * 
 * // In a dropdown context
 * <Button icon={<ChevronDownIcon />}>Expand</Button>
 * ```
 */
export const ChevronDownIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M6 9l6 6 6-6"
      {...props}
    />
  );
};