import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const menuBarRoot = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    background: vars.shell.menuBar.bg,
    color: vars.shell.menuBar.text,
    fontSize: vars.typography.fontSize.md,
    fontFamily: vars.typography.fontFamily.sans,
    padding: `0 ${vars.spacing.sm}`,
    userSelect: 'none',
    flexShrink: 0,
  },
  variants: {
    size: {
      sm: {
        height: '24px',
      },
      md: {
        height: vars.shell.menuBar.height,
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const menuContainer = style({
  position: 'relative',
  height: '100%',
});

export const trigger = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    height: '100%',
    padding: `0 ${vars.spacing.md}`,
    border: 'none',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    position: 'relative',
    selectors: {
      '&:focus-visible': {
        outline: `1px solid ${vars.colors.border.focus}`,
        outlineOffset: '-1px',
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'default',
      },
    },
  },
  variants: {
    active: {
      true: {
        background: vars.shell.menuBar.activeBg,
        selectors: {
          '&:hover': {
            background: vars.shell.menuBar.activeBg,
          },
        },
      },
      false: {
        background: 'transparent',
        selectors: {
          '&:hover': {
            background: vars.shell.menuBar.hoverBg,
          },
        },
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const dropdown = style({
  position: 'absolute',
  top: '100%',
  left: 0,
  minWidth: '200px',
  background: vars.colors.background.elevated,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.md,
  boxShadow: vars.shadows.lg,
  padding: `${vars.spacing.xs} 0`,
  zIndex: vars.zIndex.dropdown,
});

export const menuItem = style({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
  border: 'none',
  background: 'transparent',
  color: vars.colors.text.primary,
  font: 'inherit',
  fontSize: vars.typography.fontSize.md,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  gap: vars.spacing.md,
  textAlign: 'left',
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.colors.surface.hover,
    },
    '&:focus-visible': {
      outline: `1px solid ${vars.colors.border.focus}`,
      outlineOffset: '-1px',
      background: vars.colors.surface.hover,
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'default',
    },
  },
});

export const shortcut = style({
  marginLeft: 'auto',
  color: vars.shell.menuBar.shortcutText,
  fontSize: vars.typography.fontSize.xs,
});

export const separator = style({
  height: '1px',
  margin: `${vars.spacing.xs} 0`,
  background: vars.colors.border.default,
});

export const subTrigger = style([
  menuItem,
  {
    justifyContent: 'space-between',
  },
]);

export const subDropdown = style({
  position: 'absolute',
  top: `calc(-1 * ${vars.spacing.xs})`,
  left: '100%',
  minWidth: '180px',
  background: vars.colors.background.elevated,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.md,
  boxShadow: vars.shadows.lg,
  padding: `${vars.spacing.xs} 0`,
  // z-index needs to be one higher than dropdown
  zIndex: `calc(${vars.zIndex.dropdown} + 1)`,
});

export const subContainer = style({
  position: 'relative',
});
