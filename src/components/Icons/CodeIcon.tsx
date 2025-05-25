// src/icons/CodeIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Code icon component for code and development actions.
 * 
 * A standard code brackets icon commonly used for code editing,
 * development tools, and programming features in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <CodeIcon />
 * 
 * // With custom size and color
 * <CodeIcon size="md" color="accent" />
 * 
 * // In a code context
 * <Button icon={<CodeIcon />}>View Code</Button>
 * ```
 */
export const CodeIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <polyline points="16,18 22,12 16,6" />
      <polyline points="8,6 2,12 8,18" />
    </Icon>
  );
};