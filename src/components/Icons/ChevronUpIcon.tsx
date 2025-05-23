// src/icons/ChevronUpIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Chevron Up icon component for upward expansion.
 * 
 * A standard upward chevron icon commonly used for collapsing content,
 * dropdown controls, and subtle directional navigation in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ChevronUpIcon />
 * 
 * // With custom size and color
 * <ChevronUpIcon size="md" color="muted" />
 * 
 * // In a dropdown context
 * <Button icon={<ChevronUpIcon />}>Collapse</Button>
 * ```
 */
export const ChevronUpIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M18 15l-6-6-6 6"
      {...props}
    />
  );
};