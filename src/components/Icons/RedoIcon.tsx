// src/icons/RedoIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Redo icon component for redo actions.
 * 
 * A standard curved arrow icon commonly used for redoing operations,
 * reapplying changes, and history navigation in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <RedoIcon />
 * 
 * // With custom size and color
 * <RedoIcon size="md" color="secondary" />
 * 
 * // In a redo button
 * <Button icon={<RedoIcon />}>Redo</Button>
 * ```
 */
export const RedoIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M11.5 8c2.65 0 5.05.99 6.9 2.6L22 7v9h-9l3.62-3.62c-1.39-1.16-3.16-1.88-5.12-1.88-3.54 0-6.55 2.31-7.6 5.5l-2.37-.78C2.92 11.03 6.85 8 11.5 8z"
      {...props}
    />
  );
};