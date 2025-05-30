import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Arrow Down icon component for downward navigation and expansion.
 *
 * A standard downward-pointing arrow commonly used for dropdown menus,
 * expanding content, and downward navigation in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ArrowDownIcon />
 *
 * // With custom size and color
 * <ArrowDownIcon size="lg" color="primary" />
 *
 * // In a dropdown button
 * <Button icon={<ArrowDownIcon />}>Expand</Button>
 * ```
 */
export const ArrowDownIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <path d="M7 10l5 5 5-5z" />
    </Icon>
  );
};
