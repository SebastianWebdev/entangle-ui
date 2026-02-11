import { style, createVar } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

export const maxHeightVar = createVar();

export const treeContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  maxHeight: maxHeightVar,
  overflowY: 'auto',
});

export const emptyStateStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.spacing.md,
  color: vars.colors.text.muted,
  fontSize: vars.typography.fontSize.md,
});
