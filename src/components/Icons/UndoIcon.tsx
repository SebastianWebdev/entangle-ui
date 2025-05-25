// src/icons/UndoIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Undo icon component for undo actions.
 * 
 * A standard curved arrow icon commonly used for undoing operations,
 * reverting changes, and history navigation in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <UndoIcon />
 * 
 * // With custom size and color
 * <UndoIcon size="md" color="secondary" />
 * 
 * // In an undo button
 * <Button icon={<UndoIcon />}>Undo</Button>
 * ```
 */
export const UndoIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </Icon>
  );
};