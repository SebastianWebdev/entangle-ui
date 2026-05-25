import { createContext } from 'react';

/**
 * Default gap, in px, between a menu (or submenu) popup and its anchor.
 * Mirrors the spacing scale (`vars.spacing.md`); floating-ui needs a number,
 * so it can't read the CSS token directly.
 */
export const DEFAULT_MENU_GAP = 8;

/**
 * Menu-wide popup gap. Provided once by the `Menu` / `ContextMenu` root and
 * consumed by `Menu.Content` and `Menu.SubContent` as their default
 * `sideOffset`, so the spacing is defined for the whole menu rather than
 * per submenu.
 */
export const MenuGapContext =
  /*#__PURE__*/ createContext<number>(DEFAULT_MENU_GAP);
