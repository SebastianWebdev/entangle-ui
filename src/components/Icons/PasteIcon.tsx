// src/icons/PasteIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Paste icon component for paste actions.
 * 
 * A standard clipboard icon commonly used for pasting content,
 * inserting items, and clipboard operations in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <PasteIcon />
 * 
 * // With custom size and color
 * <PasteIcon size="lg" color="primary" />
 * 
 * // In a paste button
 * <Button icon={<PasteIcon />}>Paste</Button>
 * ```
 */
export const PasteIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"
      {...props}
    />
  );
};