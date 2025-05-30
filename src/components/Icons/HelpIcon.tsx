// src/icons/HelpIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Help icon component for help and support actions.
 *
 * A standard question mark icon commonly used for help documentation,
 * support links, and information assistance in editor interfaces.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <HelpIcon />
 *
 * // With custom size and color
 * <HelpIcon size="sm" color="muted" />
 *
 * // In a help context
 * <Button icon={<HelpIcon />}>Help</Button>
 * ```
 */
export const HelpIcon: React.FC<Omit<IconProps, 'children'>> = props => {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
  );
};
