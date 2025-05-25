import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Arrow Left icon component for leftward navigation and back actions.
 * 
 * A standard leftward-pointing arrow commonly used for back buttons,
 * previous navigation, and leftward movement in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ArrowLeftIcon />
 * 
 * // With custom size and color
 * <ArrowLeftIcon size="lg" color="primary" />
 * 
 * // In a back button
 * <Button icon={<ArrowLeftIcon />}>Back</Button>
 * ```
 */
export const ArrowLeftIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path d="M14 7l-5 5 5 5V7z" />
    </Icon>
  );
};
