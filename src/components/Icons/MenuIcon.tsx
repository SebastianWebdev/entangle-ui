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
export const MenuIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </Icon>
  );
};