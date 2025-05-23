// src/icons/CutIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Cut icon component for cut actions.
 * 
 * A standard scissors icon commonly used for cutting content,
 * removing items, and clipboard operations in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <CutIcon />
 * 
 * // With custom size and color
 * <CutIcon size="md" color="warning" />
 * 
 * // In a cut button
 * <Button icon={<CutIcon />}>Cut</Button>
 * ```
 */
export const CutIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M9.64 7.64a.75.75 0 0 1 1.06-1.06L12 7.88l1.3-1.3a.75.75 0 1 1 1.06 1.06L13.06 9l1.3 1.3a.75.75 0 0 1-1.06 1.06L12 10.06l-1.3 1.3a.75.75 0 0 1-1.06-1.06L10.94 9 9.64 7.64z M6.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M17.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M6.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
      {...props}
    />
  );
};