// src/icons/CopyIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Copy icon component for copy actions.
 * 
 * A standard copy/duplicate icon commonly used for copying content,
 * duplicating items, and clipboard operations in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <CopyIcon />
 * 
 * // With custom size and color
 * <CopyIcon size="sm" color="secondary" />
 * 
 * // In a copy button
 * <Button icon={<CopyIcon />}>Copy</Button>
 * ```
 */
export const CopyIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M20 9h-3.5l-1-1h-11l-1 1H1v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9z M9 9H4V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v5"
      {...props}
    />
  );
};