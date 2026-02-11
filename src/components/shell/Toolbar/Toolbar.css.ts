import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const toolbarRoot = recipe({
  base: {
    display: 'flex',
    boxSizing: 'border-box',
    alignItems: 'center',
    minWidth: 0,
    minHeight: 0,
    background: vars.shell.toolbar.bg,
    padding: vars.spacing.xs,
    gap: vars.spacing.xs,
    flexShrink: 0,
    userSelect: 'none',
  },
  variants: {
    orientation: {
      horizontal: {
        flexDirection: 'row',
      },
      vertical: {
        flexDirection: 'column',
        height: '100%',
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export const toolbarButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: vars.borderRadius.sm,
    cursor: 'pointer',
    padding: 0,
    transition: `background ${vars.transitions.fast}`,
    selectors: {
      '&:focus-visible': {
        outline: `1px solid ${vars.colors.border.focus}`,
        outlineOffset: '-1px',
      },
      '&:disabled': {
        opacity: 0.4,
        cursor: 'default',
      },
    },
  },
  variants: {
    size: {
      sm: {
        width: '24px',
        height: '24px',
        fontSize: '14px',
      },
      md: {
        width: '32px',
        height: '32px',
        fontSize: '16px',
      },
    },
    variant: {
      default: {
        background: 'transparent',
      },
      ghost: {
        background: 'transparent',
      },
      filled: {
        background: vars.colors.surface.active,
      },
    },
    active: {
      true: {
        background: vars.colors.accent.primary,
        color: vars.colors.text.primary,
      },
      false: {
        color: vars.colors.text.secondary,
      },
    },
  },
  compoundVariants: [
    {
      variants: { active: true },
      style: {
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.accent.secondary,
          },
        },
      },
    },
    {
      variants: { active: false },
      style: {
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.surface.hover,
          },
        },
      },
    },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'default',
    active: false,
  },
});

export const toolbarGroup = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
  },
  variants: {
    orientation: {
      horizontal: {
        flexDirection: 'row',
      },
      vertical: {
        flexDirection: 'column',
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export const toolbarSeparator = recipe({
  base: {
    background: vars.shell.toolbar.separator,
    flexShrink: 0,
  },
  variants: {
    orientation: {
      horizontal: {
        width: '1px',
        height: '16px',
        margin: `0 ${vars.spacing.xs}`,
      },
      vertical: {
        width: '80%',
        height: '1px',
        margin: `${vars.spacing.xs} auto`,
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export const toolbarSpacer = style({
  flex: '1 1 auto',
});
