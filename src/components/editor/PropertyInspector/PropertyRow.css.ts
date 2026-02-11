import { style, globalStyle, createVar } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

export const RESET_BUTTON_CLASS = 'property-row-reset';

export const splitRatioVar = createVar();
export const controlRatioVar = createVar();

export const rowRoot = style({
  position: 'relative',
  padding: '2px 8px',
  transition: `background ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      background: vars.colors.surface.hover,
    },
  },
});

globalStyle(`${rowRoot}:hover .${RESET_BUTTON_CLASS}`, {
  opacity: 1,
});

export const rowLabel = style({
  flex: `0 0 ${splitRatioVar}`,
  boxSizing: 'border-box',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  color: vars.colors.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  paddingRight: vars.spacing.md,
});

export const fullWidthLabel = style({
  display: 'flex',
  alignItems: 'center',
  color: vars.colors.text.secondary,
  marginBottom: vars.spacing.xs,
  userSelect: 'none',
});

export const modifiedDot = style({
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  background: vars.colors.accent.primary,
  marginRight: vars.spacing.xs,
  flexShrink: 0,
});

export const rowControl = style({
  flex: `0 0 ${controlRatioVar}`,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
  paddingRight: vars.spacing.xs,
});

export const fullWidthControl = style({
  display: 'flex',
  alignItems: 'stretch',
  width: '100%',
  flex: '1 1 auto',
  minWidth: 0,
  paddingRight: vars.spacing.xs,
});

export const resetButton = style({
  position: 'absolute',
  right: vars.spacing.xs,
  top: '50%',
  transform: 'translateY(-50%)',
  opacity: 0,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  borderRadius: vars.borderRadius.sm,
  color: vars.colors.text.muted,
  transition: `opacity ${vars.transitions.fast}, color ${vars.transitions.fast}, background ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      color: vars.colors.text.primary,
      background: vars.colors.surface.active,
    },
  },
});
