import { style, globalStyle } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Viewport lock global styles ---

export const viewportLockClass = style({});

globalStyle(`html:has(${viewportLockClass})`, {
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  width: '100vw',
  height: '100vh',
  background: vars.colors.background.primary,
});

globalStyle(`html:has(${viewportLockClass}) body`, {
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  width: '100vw',
  height: '100vh',
  background: vars.colors.background.primary,
});

// --- Shell root ---

export const shellRoot = style({
  display: 'grid',
  gridTemplateRows: 'auto auto 1fr auto',
  gridTemplateColumns: 'auto 1fr auto',
  gridTemplateAreas: `
    'menubar menubar menubar'
    'toolbar-top toolbar-top toolbar-top'
    'toolbar-left dock toolbar-right'
    'statusbar statusbar statusbar'`,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  background: vars.colors.background.primary,
  color: vars.colors.text.primary,
  fontFamily: vars.typography.fontFamily.sans,
});

// --- Slot styles ---

export const menuBarSlot = style({
  gridArea: 'menubar',
});

export const toolbarTopSlot = recipe({
  base: {
    gridArea: 'toolbar-top',
    zIndex: vars.zIndex.base,
  },
  variants: {
    separator: {
      none: {
        borderBottom: 'none',
        boxShadow: 'none',
      },
      border: {
        borderBottom: `1px solid ${vars.colors.border.default}`,
        boxShadow: 'none',
      },
      shadow: {
        borderBottom: 'none',
        boxShadow: vars.shadows.separatorBottom,
      },
      both: {
        borderBottom: `1px solid ${vars.colors.border.default}`,
        boxShadow: vars.shadows.separatorBottom,
      },
    },
  },
  defaultVariants: {
    separator: 'border',
  },
});

export const sideToolbarSlot = recipe({
  base: {
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    zIndex: vars.zIndex.base,
  },
  variants: {
    side: {
      left: {
        gridArea: 'toolbar-left',
      },
      right: {
        gridArea: 'toolbar-right',
      },
    },
    separator: {
      none: {},
      border: {},
      shadow: {},
      both: {},
    },
  },
  compoundVariants: [
    {
      variants: { side: 'left', separator: 'border' },
      style: {
        borderRight: `1px solid ${vars.colors.border.default}`,
      },
    },
    {
      variants: { side: 'left', separator: 'shadow' },
      style: {
        boxShadow: vars.shadows.separatorRight,
      },
    },
    {
      variants: { side: 'left', separator: 'both' },
      style: {
        borderRight: `1px solid ${vars.colors.border.default}`,
        boxShadow: vars.shadows.separatorRight,
      },
    },
    {
      variants: { side: 'right', separator: 'border' },
      style: {
        borderLeft: `1px solid ${vars.colors.border.default}`,
      },
    },
    {
      variants: { side: 'right', separator: 'shadow' },
      style: {
        boxShadow: vars.shadows.separatorLeft,
      },
    },
    {
      variants: { side: 'right', separator: 'both' },
      style: {
        borderLeft: `1px solid ${vars.colors.border.default}`,
        boxShadow: vars.shadows.separatorLeft,
      },
    },
  ],
  defaultVariants: {
    side: 'left',
    separator: 'border',
  },
});

export const dockSlot = style({
  gridArea: 'dock',
  position: 'relative',
  overflow: 'hidden',
  minWidth: 0,
  minHeight: 0,
});

export const statusBarSlot = style({
  gridArea: 'statusbar',
});
