import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const statusBarRoot = recipe({
  base: {
    display: 'flex',
    boxSizing: 'border-box',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    color: vars.shell.statusBar.text,
    fontSize: vars.typography.fontSize.md,
    fontFamily: vars.typography.fontFamily.sans,
    padding: `0 ${vars.spacing.md}`,
    overflow: 'hidden',
    flexShrink: 0,
    userSelect: 'none',
  },
  variants: {
    variant: {
      default: {
        background: vars.shell.statusBar.bg,
      },
      error: {
        background: vars.colors.accent.error,
      },
      accent: {
        background: vars.shell.statusBar.bg,
      },
    },
    size: {
      sm: {
        height: vars.shell.statusBar.height,
      },
      md: {
        height: vars.shell.statusBar.heightMd,
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm',
  },
});

export const statusBarSection = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    overflow: 'hidden',
  },
  variants: {
    side: {
      left: {
        flex: '1 1 auto',
        justifyContent: 'flex-start',
      },
      right: {
        flex: '0 0 auto',
        justifyContent: 'flex-end',
      },
    },
  },
  defaultVariants: {
    side: 'left',
  },
});

const itemBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  padding: `0 ${vars.spacing.sm}`,
  height: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: '1',
  position: 'relative',
} as const;

export const itemButton = style({
  ...itemBase,
  cursor: 'pointer',
  borderRadius: vars.borderRadius.sm,
  selectors: {
    '&:hover': {
      background: vars.colors.surface.whiteOverlay,
    },
    '&:focus-visible': {
      outline: `1px solid ${vars.colors.border.focus}`,
      outlineOffset: '-1px',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'default',
    },
    '&:disabled:hover': {
      background: 'transparent',
    },
  },
});

export const itemSpan = style({
  ...itemBase,
});

export const badge = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: vars.colors.accent.warning,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSize.xxs,
    fontWeight: vars.typography.fontWeight.semibold,
    lineHeight: '1',
  },
  variants: {
    dot: {
      true: {
        minWidth: '6px',
        height: '6px',
        borderRadius: '50%',
        padding: 0,
      },
      false: {
        minWidth: '14px',
        height: '14px',
        borderRadius: '7px',
        padding: '0 3px',
      },
    },
  },
  defaultVariants: {
    dot: false,
  },
});
