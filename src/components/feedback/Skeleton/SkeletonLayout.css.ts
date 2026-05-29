import { style, createVar } from '@vanilla-extract/css';

import { vars } from '@/theme/contract.css';

export const layoutColumnsVar = createVar();

export const cardLayoutStyle = style({
  display: 'flex',
  flexDirection: 'row',
  gap: vars.spacing.md,
  alignItems: 'flex-start',
  padding: vars.spacing.md,
  borderRadius: vars.borderRadius.md,
  background: vars.colors.background.elevated,
  boxSizing: 'border-box',
});

export const cardBodyStyle = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  gap: vars.spacing.sm,
  minWidth: 0,
});

export const listLayoutStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
  boxSizing: 'border-box',
});

export const listRowStyle = style({
  display: 'flex',
  flexDirection: 'row',
  gap: vars.spacing.md,
  alignItems: 'center',
});

export const listRowBodyStyle = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  gap: vars.spacing.xs,
  minWidth: 0,
});

export const tableLayoutStyle = style({
  display: 'grid',
  gridTemplateColumns: `repeat(${layoutColumnsVar}, minmax(0, 1fr))`,
  gap: vars.spacing.sm,
  boxSizing: 'border-box',
});

export const tableHeaderCellStyle = style({
  paddingBottom: vars.spacing.xs,
  borderBottom: `1px solid ${vars.colors.border.default}`,
});

export const gridLayoutStyle = style({
  display: 'grid',
  gridTemplateColumns: `repeat(${layoutColumnsVar}, minmax(0, 1fr))`,
  gap: vars.spacing.md,
  boxSizing: 'border-box',
});

export const chatLayoutStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
  boxSizing: 'border-box',
});

export const chatRowStyle = style({
  display: 'flex',
  flexDirection: 'row',
  gap: vars.spacing.sm,
  alignItems: 'flex-end',
  maxWidth: '100%',
});

export const chatRowEndStyle = style({
  flexDirection: 'row-reverse',
});

export const chatBubbleStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  flex: '0 1 70%',
  minWidth: 0,
});
