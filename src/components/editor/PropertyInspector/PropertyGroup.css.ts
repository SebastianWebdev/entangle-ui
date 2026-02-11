import { style, createVar } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

export const indentVar = createVar();

export const groupRoot = style({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: indentVar,
});

export const groupDivider = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
});

export const groupTitle = style({
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: vars.typography.fontWeight.medium,
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

export const groupLine = style({
  flex: 1,
  height: '1px',
  background: vars.colors.border.default,
});
