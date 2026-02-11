import { createVar, globalStyle } from '@vanilla-extract/css';
import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';

export const gapVar = createVar();
export const growVar = createVar();
export const shrinkVar = createVar();
export const basisVar = createVar();

export const flexRecipe = recipe({
  base: {
    display: 'flex',
    boxSizing: 'border-box',
    gap: gapVar,
    flexGrow: growVar,
    flexShrink: shrinkVar,
    flexBasis: basisVar,
  },

  variants: {
    direction: {
      row: { flexDirection: 'row' },
      'row-reverse': { flexDirection: 'row-reverse' },
      column: { flexDirection: 'column' },
      'column-reverse': { flexDirection: 'column-reverse' },
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
    alignContent: {
      'flex-start': { alignContent: 'flex-start' },
      'flex-end': { alignContent: 'flex-end' },
      center: { alignContent: 'center' },
      stretch: { alignContent: 'stretch' },
      'space-between': { alignContent: 'space-between' },
      'space-around': { alignContent: 'space-around' },
    },
    fullWidth: {
      true: { width: '100%' },
    },
    fullHeight: {
      true: { height: '100%' },
    },
  },

  defaultVariants: {
    direction: 'row',
    wrap: 'nowrap',
    justify: 'flex-start',
    align: 'stretch',
    alignContent: 'stretch',
  },
});

export type FlexVariants = RecipeVariants<typeof flexRecipe>;

/* Responsive direction overrides using data attributes */

const flexSelector = `.${flexRecipe.classNames.base}`;

globalStyle(`${flexSelector}[data-sm-dir="row"]`, {
  '@media': { '(min-width: 576px)': { flexDirection: 'row' } },
});
globalStyle(`${flexSelector}[data-sm-dir="row-reverse"]`, {
  '@media': { '(min-width: 576px)': { flexDirection: 'row-reverse' } },
});
globalStyle(`${flexSelector}[data-sm-dir="column"]`, {
  '@media': { '(min-width: 576px)': { flexDirection: 'column' } },
});
globalStyle(`${flexSelector}[data-sm-dir="column-reverse"]`, {
  '@media': { '(min-width: 576px)': { flexDirection: 'column-reverse' } },
});

globalStyle(`${flexSelector}[data-md-dir="row"]`, {
  '@media': { '(min-width: 768px)': { flexDirection: 'row' } },
});
globalStyle(`${flexSelector}[data-md-dir="row-reverse"]`, {
  '@media': { '(min-width: 768px)': { flexDirection: 'row-reverse' } },
});
globalStyle(`${flexSelector}[data-md-dir="column"]`, {
  '@media': { '(min-width: 768px)': { flexDirection: 'column' } },
});
globalStyle(`${flexSelector}[data-md-dir="column-reverse"]`, {
  '@media': { '(min-width: 768px)': { flexDirection: 'column-reverse' } },
});

globalStyle(`${flexSelector}[data-lg-dir="row"]`, {
  '@media': { '(min-width: 992px)': { flexDirection: 'row' } },
});
globalStyle(`${flexSelector}[data-lg-dir="row-reverse"]`, {
  '@media': { '(min-width: 992px)': { flexDirection: 'row-reverse' } },
});
globalStyle(`${flexSelector}[data-lg-dir="column"]`, {
  '@media': { '(min-width: 992px)': { flexDirection: 'column' } },
});
globalStyle(`${flexSelector}[data-lg-dir="column-reverse"]`, {
  '@media': { '(min-width: 992px)': { flexDirection: 'column-reverse' } },
});

globalStyle(`${flexSelector}[data-xl-dir="row"]`, {
  '@media': { '(min-width: 1200px)': { flexDirection: 'row' } },
});
globalStyle(`${flexSelector}[data-xl-dir="row-reverse"]`, {
  '@media': { '(min-width: 1200px)': { flexDirection: 'row-reverse' } },
});
globalStyle(`${flexSelector}[data-xl-dir="column"]`, {
  '@media': { '(min-width: 1200px)': { flexDirection: 'column' } },
});
globalStyle(`${flexSelector}[data-xl-dir="column-reverse"]`, {
  '@media': { '(min-width: 1200px)': { flexDirection: 'column-reverse' } },
});
