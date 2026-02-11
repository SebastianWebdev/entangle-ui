import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

/* --- SplitPane Container --- */

export const containerRecipe = recipe({
  base: {
    display: 'flex',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  variants: {
    direction: {
      horizontal: { flexDirection: 'row' },
      vertical: { flexDirection: 'column' },
    },
  },
});

/* --- SplitPane Divider --- */

export const dividerSizeVar = createVar();

export const dividerRecipe = recipe({
  base: {
    flex: `0 0 ${dividerSizeVar}`,
    background: vars.colors.border.default,
    transition: `background-color ${vars.transitions.fast}`,
    userSelect: 'none',
    touchAction: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    outline: 'none',

    ':hover': {
      background: vars.colors.accent.primary,
    },
    ':focus-visible': {
      background: vars.colors.accent.primary,
      outline: 'none',
    },
  },
  variants: {
    direction: {
      horizontal: { cursor: 'col-resize' },
      vertical: { cursor: 'row-resize' },
    },
    isDragging: {
      true: {
        background: vars.colors.accent.primary,
      },
    },
  },
});

/* --- SplitPanePanel --- */

export const panelStyle = style({
  overflow: 'auto',
});
