import { style, createVar } from '@vanilla-extract/css';

export const gapVar = createVar();
export const zIndexVar = createVar();

export const container = style({
  position: 'fixed',
  display: 'flex',
  gap: gapVar,
  zIndex: zIndexVar,
  pointerEvents: 'none',
});

export const containerReverse = style({
  flexDirection: 'column-reverse',
});

export const containerNormal = style({
  flexDirection: 'column',
});
