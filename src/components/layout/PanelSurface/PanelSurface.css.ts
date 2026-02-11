import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

/* --- PanelSurface Root --- */

export const backgroundVar = createVar();

export const rootStyle = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  boxSizing: 'border-box',
  overflow: 'hidden',
  background: backgroundVar,
  color: vars.colors.text.primary,
  borderRadius: vars.borderRadius.md,
});

export const rootBordered = style({
  border: `1px solid ${vars.colors.border.default}`,
});

export const rootNoBorder = style({
  border: 'none',
});

/* --- PanelSurface Header --- */

export const headerRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: vars.colors.background.secondary,
    color: vars.colors.text.secondary,
    fontWeight: vars.typography.fontWeight.medium,
    borderBottom: `1px solid ${vars.colors.border.default}`,
    flexShrink: 0,
    userSelect: 'none',
  },
  variants: {
    size: {
      sm: {
        minHeight: '24px',
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        minHeight: '28px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.sm,
      },
      lg: {
        minHeight: '32px',
        padding: `0 ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.md,
      },
    },
  },
});

export const headerActions = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  marginLeft: vars.spacing.md,
});

/* --- PanelSurface Body --- */

export const bodyStyle = style({
  flex: '1 1 auto',
  minWidth: 0,
  minHeight: 0,
  boxSizing: 'border-box',
});

export const bodyScrollable = style({
  overflow: 'auto',
});

export const bodyHidden = style({
  overflow: 'hidden',
});

/* --- PanelSurface Footer --- */

export const footerRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    borderTop: `1px solid ${vars.colors.border.default}`,
    background: vars.colors.background.secondary,
    color: vars.colors.text.secondary,
    flexShrink: 0,
  },
  variants: {
    size: {
      sm: {
        minHeight: '24px',
        padding: `0 ${vars.spacing.sm}`,
        fontSize: vars.typography.fontSize.xs,
      },
      md: {
        minHeight: '28px',
        padding: `0 ${vars.spacing.md}`,
        fontSize: vars.typography.fontSize.sm,
      },
      lg: {
        minHeight: '32px',
        padding: `0 ${vars.spacing.lg}`,
        fontSize: vars.typography.fontSize.md,
      },
    },
  },
});
