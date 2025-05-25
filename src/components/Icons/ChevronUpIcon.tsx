import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Chevron Up icon component for collapse and upward indicators.
 * 
 * A subtle upward chevron commonly used for collapsing content,
 * accordion collapse, and subtle directional cues in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ChevronUpIcon />
 * 
 * // With custom size and color
 * <ChevronUpIcon size="sm" color="muted" />
 * 
 * // In a collapsible section
 * <Button icon={<ChevronUpIcon />}>Collapse</Button>
 * ```
 */
export const ChevronUpIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <polyline points="18,15 12,9 6,15" />
    </Icon>
  );
};
