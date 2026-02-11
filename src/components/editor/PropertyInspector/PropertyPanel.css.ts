import { style, createVar } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

// --- Dynamic vars for content spacing ---
export const contentTopSpacingVar = createVar();
export const contentBottomSpacingVar = createVar();

export const panelRoot = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: vars.colors.background.primary,
  color: vars.colors.text.primary,
  fontFamily: vars.typography.fontFamily.sans,
});

export const panelHeader = style({
  flexShrink: 0,
  borderBottom: `1px solid ${vars.colors.border.default}`,
});

export const searchWrapper = style({
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
});

export const searchInputBase = style({
  width: '100%',
  boxSizing: 'border-box',
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.md,
  background: vars.colors.surface.default,
  color: vars.colors.text.primary,
  fontFamily: 'inherit',
  outline: 'none',
  transition: `border-color ${vars.transitions.fast}, box-shadow ${vars.transitions.fast}`,
  ':focus': {
    borderColor: vars.colors.border.focus,
    boxShadow: vars.shadows.focus,
  },
  '::placeholder': {
    color: vars.colors.text.muted,
  },
});

export const panelContent = style({
  flex: 1,
  minHeight: 0,
  paddingTop: contentTopSpacingVar,
  paddingRight: vars.spacing.md,
  paddingBottom: contentBottomSpacingVar,
  paddingLeft: vars.spacing.md,
  boxSizing: 'border-box',
});

export const panelFooter = style({
  flexShrink: 0,
  borderTop: `1px solid ${vars.colors.border.default}`,
});
