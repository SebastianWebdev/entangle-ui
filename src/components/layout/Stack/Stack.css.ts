import { createVar, globalStyle } from '@vanilla-extract/css';
import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';

export const gapVar = createVar();

export const stackRecipe = recipe({
  base: {
    display: 'flex',
    boxSizing: 'border-box',
    gap: gapVar,
  },

  variants: {
    direction: {
      row: { flexDirection: 'row' },
      column: { flexDirection: 'column' },
    },
    wrap: {
      nowrap: { flexWrap: 'nowrap' },
      wrap: { flexWrap: 'wrap' },
      'wrap-reverse': { flexWrap: 'wrap-reverse' },
    },
    justify: {
      'flex-start': { justifyContent: 'flex-start' },
      'flex-end': { justifyContent: 'flex-end' },
      center: { justifyContent: 'center' },
      'space-between': { justifyContent: 'space-between' },
      'space-around': { justifyContent: 'space-around' },
      'space-evenly': { justifyContent: 'space-evenly' },
    },
    align: {
      'flex-start': { alignItems: 'flex-start' },
      'flex-end': { alignItems: 'flex-end' },
      center: { alignItems: 'center' },
      stretch: { alignItems: 'stretch' },
      baseline: { alignItems: 'baseline' },
    },
    expandRow: {
      true: { width: '100%' },
    },
    expandColumn: {
      true: { height: '100%' },
    },
  },

  defaultVariants: {
    direction: 'column',
    wrap: 'nowrap',
    justify: 'flex-start',
    align: 'flex-start',
  },
});

export type StackVariants = RecipeVariants<typeof stackRecipe>;

/* Responsive direction overrides using data attributes */

const stackSelector = `.${stackRecipe.classNames.base}`;

globalStyle(`${stackSelector}[data-sm-dir="row"]`, {
  '@media': {
    '(min-width: 576px)': { flexDirection: 'row' },
  },
});
globalStyle(`${stackSelector}[data-sm-dir="column"]`, {
  '@media': {
    '(min-width: 576px)': { flexDirection: 'column' },
  },
});

globalStyle(`${stackSelector}[data-md-dir="row"]`, {
  '@media': {
    '(min-width: 768px)': { flexDirection: 'row' },
  },
});
globalStyle(`${stackSelector}[data-md-dir="column"]`, {
  '@media': {
    '(min-width: 768px)': { flexDirection: 'column' },
  },
});

globalStyle(`${stackSelector}[data-lg-dir="row"]`, {
  '@media': {
    '(min-width: 992px)': { flexDirection: 'row' },
  },
});
globalStyle(`${stackSelector}[data-lg-dir="column"]`, {
  '@media': {
    '(min-width: 992px)': { flexDirection: 'column' },
  },
});

globalStyle(`${stackSelector}[data-xl-dir="row"]`, {
  '@media': {
    '(min-width: 1200px)': { flexDirection: 'row' },
  },
});
globalStyle(`${stackSelector}[data-xl-dir="column"]`, {
  '@media': {
    '(min-width: 1200px)': { flexDirection: 'column' },
  },
});

/* Responsive expand overrides - when direction changes, adjust expand axis */

globalStyle(`${stackSelector}[data-sm-dir="row"][data-expand="true"]`, {
  '@media': {
    '(min-width: 576px)': { width: '100%', height: 'auto' },
  },
});
globalStyle(`${stackSelector}[data-sm-dir="column"][data-expand="true"]`, {
  '@media': {
    '(min-width: 576px)': { height: '100%', width: 'auto' },
  },
});

globalStyle(`${stackSelector}[data-md-dir="row"][data-expand="true"]`, {
  '@media': {
    '(min-width: 768px)': { width: '100%', height: 'auto' },
  },
});
globalStyle(`${stackSelector}[data-md-dir="column"][data-expand="true"]`, {
  '@media': {
    '(min-width: 768px)': { height: '100%', width: 'auto' },
  },
});

globalStyle(`${stackSelector}[data-lg-dir="row"][data-expand="true"]`, {
  '@media': {
    '(min-width: 992px)': { width: '100%', height: 'auto' },
  },
});
globalStyle(`${stackSelector}[data-lg-dir="column"][data-expand="true"]`, {
  '@media': {
    '(min-width: 992px)': { height: '100%', width: 'auto' },
  },
});

globalStyle(`${stackSelector}[data-xl-dir="row"][data-expand="true"]`, {
  '@media': {
    '(min-width: 1200px)': { width: '100%', height: 'auto' },
  },
});
globalStyle(`${stackSelector}[data-xl-dir="column"][data-expand="true"]`, {
  '@media': {
    '(min-width: 1200px)': { height: '100%', width: 'auto' },
  },
});
