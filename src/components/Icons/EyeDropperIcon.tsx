import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * EyeDropper icon component for color sampling actions.
 *
 * A pipette/eyedropper icon commonly used for color picking,
 * sampling colors from the canvas, and color-related tools
 * in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <EyeDropperIcon />
 *
 * // With custom size and color
 * <EyeDropperIcon size="md" color="primary" />
 *
 * // In a color picker button
 * <Button icon={<EyeDropperIcon />}>Pick Color</Button>
 * ```
 */
export const EyeDropperIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <path d="M21.17 2.06A3.12 3.12 0 0 0 19 1.05a2.99 2.99 0 0 0-2.15.88l-2.7 2.7-1.28-1.27a1 1 0 0 0-1.41 0 1 1 0 0 0 0 1.41l.27.27-7.07 7.08a2 2 0 0 0-.54 1l-.72 3.61a1 1 0 0 0 .28.87 1 1 0 0 0 .71.3h.16l3.61-.72a2 2 0 0 0 1-.54l7.08-7.07.27.27a1 1 0 0 0 1.41 0 1 1 0 0 0 0-1.41l-1.27-1.28 2.7-2.7a3.05 3.05 0 0 0 .02-4.29z" />
    </Icon>
  );
};
