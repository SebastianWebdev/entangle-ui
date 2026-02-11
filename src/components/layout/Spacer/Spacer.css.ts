import { style } from '@vanilla-extract/css';

export const spacerBase = style({
  pointerEvents: 'none',
  userSelect: 'none',
});

export const spacerFlexible = style({
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 'auto',
  minWidth: 0,
  minHeight: 0,
});

export const spacerFixed = style({
  flex: 'none',
});
