import { style, createVar, globalStyle } from '@vanilla-extract/css';

export const gapVar = createVar();
export const columnsVar = createVar();

export const gridContainer = style({
  display: 'grid',
  gridTemplateColumns: `repeat(var(${columnsVar}), 1fr)`,
  width: '100%',
  boxSizing: 'border-box',
  gap: gapVar,
});

export const gridItem = style({
  boxSizing: 'border-box',
});

/* Responsive grid-column spans via data attributes */

const spanValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/* Base size (xs) — applies without media query */
for (const span of spanValues) {
  globalStyle(`${gridItem}[data-xs="${span}"]`, {
    gridColumn: `span ${span}`,
  });
}
globalStyle(`${gridItem}[data-xs="auto"]`, {
  gridColumn: 'span auto',
});

/* sm (576px) */
for (const span of spanValues) {
  globalStyle(`${gridItem}[data-sm="${span}"]`, {
    '@media': {
      '(min-width: 576px)': { gridColumn: `span ${span}` },
    },
  });
}
globalStyle(`${gridItem}[data-sm="auto"]`, {
  '@media': {
    '(min-width: 576px)': { gridColumn: 'span auto' },
  },
});

/* md (768px) */
for (const span of spanValues) {
  globalStyle(`${gridItem}[data-md="${span}"]`, {
    '@media': {
      '(min-width: 768px)': { gridColumn: `span ${span}` },
    },
  });
}
globalStyle(`${gridItem}[data-md="auto"]`, {
  '@media': {
    '(min-width: 768px)': { gridColumn: 'span auto' },
  },
});

/* lg (992px) */
for (const span of spanValues) {
  globalStyle(`${gridItem}[data-lg="${span}"]`, {
    '@media': {
      '(min-width: 992px)': { gridColumn: `span ${span}` },
    },
  });
}
globalStyle(`${gridItem}[data-lg="auto"]`, {
  '@media': {
    '(min-width: 992px)': { gridColumn: 'span auto' },
  },
});

/* xl (1200px) */
for (const span of spanValues) {
  globalStyle(`${gridItem}[data-xl="${span}"]`, {
    '@media': {
      '(min-width: 1200px)': { gridColumn: `span ${span}` },
    },
  });
}
globalStyle(`${gridItem}[data-xl="auto"]`, {
  '@media': {
    '(min-width: 1200px)': { gridColumn: 'span auto' },
  },
});
