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
export const HelpIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM12 20c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm1-5v-1.5c0-1.103-.897-2-2-2s-2 .897-2 2h2c0-.552.448-1 1-1s1 .448 1 1-.448 1-1 1c-.552 0-1 .448-1 1v1h2zm-1 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"
      {...props}
    />
  );
};