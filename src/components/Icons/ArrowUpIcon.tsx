import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Arrow Up icon component for upward navigation and collapse actions.
 * 
 * A standard upward-pointing arrow commonly used for collapse buttons,
 * upward navigation, and minimizing content in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ArrowUpIcon />
 * 
 * // With custom size and color
 * <ArrowUpIcon size="lg" color="primary" />
 * 
 * // In a collapse button
 * <Button icon={<ArrowUpIcon />}>Collapse</Button>
 * ```
 */
export const ArrowUpIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path d="M17 14l-5-5-5 5h10z" />
    </Icon>
  );
};
