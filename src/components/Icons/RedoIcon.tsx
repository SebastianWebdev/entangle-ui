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
export const RedoIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </Icon>
  );
};
