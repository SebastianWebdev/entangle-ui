// src/icons/MenuIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
 * Menu icon component for menu/hamburger navigation.
 * 
 * A standard three-line hamburger icon commonly used for opening menus,
 * navigation drawers, and mobile menu toggles in editor interfaces.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <MenuIcon />
 * 
 * // With custom size and color
 * <MenuIcon size="md" color="secondary" />
 * 
 * // In a navigation context
 * <Button icon={<MenuIcon />}>Menu</Button>
 * ```
 */
export const MenuIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
  return (
    <Icon
      svg="M3 12h18 M3 6h18 M3 18h18"
      {...props}
    />
  );
};