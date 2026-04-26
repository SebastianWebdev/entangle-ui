import { style, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

/**
 * Runtime color override applied per-instance via `assignInlineVars`.
 * Set by the component when `color` is a non-token string.
 */
export const linkColorVar = createVar();
export const linkHoverColorVar = createVar();

export const linkRecipe = recipe({
  base: {
    cursor: 'pointer',
    fontFamily: vars.typography.fontFamily.sans,
    transition: `color ${vars.transitions.fast}, text-decoration-color ${vars.transitions.fast}`,
    textDecorationColor: 'currentColor',
    textUnderlineOffset: '2px',
    borderRadius: vars.borderRadius.sm,
    outline: 'none',

    selectors: {
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },

  variants: {
    variant: {
      default: {
        color: linkColorVar,
        selectors: {
          '&:hover:not([data-disabled])': {
            color: linkHoverColorVar,
          },
          '&:active:not([data-disabled])': {
            opacity: 0.85,
          },
        },
      },
      subtle: {
        color: linkColorVar,
        selectors: {
          '&:hover:not([data-disabled])': {
            color: linkHoverColorVar,
          },
        },
      },
      inline: {
        color: 'inherit',
        selectors: {
          '&:hover:not([data-disabled])': {
            color: vars.colors.accent.primary,
          },
        },
      },
    },

    underline: {
      always: { textDecoration: 'underline' },
      hover: {
        textDecoration: 'none',
        selectors: {
          '&:hover:not([data-disabled])': { textDecoration: 'underline' },
        },
      },
      never: {
        textDecoration: 'none',
        selectors: {
          '&:hover:not([data-disabled])': { textDecoration: 'none' },
        },
      },
    },

    size: {
      sm: { fontSize: vars.typography.fontSize.xs },
      md: { fontSize: vars.typography.fontSize.sm },
      lg: { fontSize: vars.typography.fontSize.md },
    },

    disabled: {
      true: {
        color: vars.colors.text.disabled,
        cursor: 'not-allowed',
        pointerEvents: 'none',
        textDecoration: 'none',
      },
    },
  },

  defaultVariants: {
    variant: 'default',
    underline: 'hover',
    size: 'md',
  },
});

export const externalIconStyle = style({
  display: 'inline-block',
  verticalAlign: '-0.0625em',
  width: '0.75em',
  height: '0.75em',
  marginLeft: '0.2em',
  flexShrink: 0,
});

export const srOnlyStyle = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});
