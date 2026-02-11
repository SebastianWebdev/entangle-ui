import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

/* --- Accordion Root --- */

export const accordionGapVar = createVar();

export const accordionRoot = style({
  display: 'flex',
  flexDirection: 'column',
  gap: accordionGapVar,
});

/* --- AccordionItem --- */

export const accordionItem = style({
  display: 'flex',
  flexDirection: 'column',
});

/* --- AccordionTrigger --- */

export const triggerButton = recipe({
  base: {
    margin: 0,
    border: 'none',
    fontFamily: 'inherit',
    outline: 'none',
    userSelect: 'none',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    fontWeight: vars.typography.fontWeight.medium,
    color: vars.colors.text.primary,
    transition: `background ${vars.transitions.fast}`,

    ':focus-visible': {
      boxShadow: vars.shadows.focus,
      zIndex: 1,
    },
  },

  variants: {
    variant: {
      default: {
        background: vars.colors.surface.default,
        borderBottom: `1px solid ${vars.colors.border.default}`,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.surface.hover,
          },
        },
      },
      ghost: {
        background: 'transparent',
        borderBottom: `1px solid ${vars.colors.border.default}`,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.surface.hover,
          },
        },
      },
      filled: {
        background: vars.colors.background.tertiary,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.colors.surface.hover,
          },
        },
      },
    },

    size: {
      sm: {
        height: '28px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        height: '32px',
        padding: `0 ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.sm,
      },
      lg: {
        height: '38px',
        padding: `0 ${vars.spacing.xl}`,
        fontSize: vars.typography.fontSize.md,
      },
    },

    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      false: {
        cursor: 'pointer',
      },
    },
  },

  defaultVariants: {
    variant: 'default',
    size: 'md',
    disabled: false,
  },
});

export const chevronStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: `transform ${vars.transitions.fast}`,
  color: vars.colors.text.muted,
});

export const chevronExpanded = style({
  transform: 'rotate(90deg)',
});

export const chevronCollapsed = style({
  transform: 'rotate(0deg)',
});

export const actionsArea = style({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 'auto',
  gap: vars.spacing.xs,
});

export const iconArea = style({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
});

/* --- AccordionContent --- */

export const contentWrapper = style({
  display: 'grid',
  transition: `grid-template-rows ${vars.transitions.normal}`,
});

export const contentWrapperExpanded = style({
  gridTemplateRows: '1fr',
});

export const contentWrapperCollapsed = style({
  gridTemplateRows: '0fr',
});

export const contentInner = style({
  overflow: 'hidden',
  minHeight: 0,
});

export const contentBody = recipe({
  base: {},
  variants: {
    size: {
      sm: {
        padding: `${vars.spacing.sm} ${vars.spacing.md}`,
      },
      md: {
        padding: `${vars.spacing.md} ${vars.spacing.lg}`,
      },
      lg: {
        padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
      },
    },
  },
});
