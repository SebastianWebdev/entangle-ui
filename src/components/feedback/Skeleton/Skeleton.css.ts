import { createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';
import { pulseKeyframe, waveKeyframe } from '@/utils/animations.css';

export const skeletonWidthVar = createVar();
export const skeletonHeightVar = createVar();
export const skeletonRadiusVar = createVar();

/**
 * Skeleton root recipe.
 *
 * `shape` determines the default radius and the height fallback for `line`.
 * `animation` swaps in a pulse animation, a wave gradient overlay, or
 * leaves the surface static. Dynamic dimensions are driven by inline
 * CSS variables so the recipe output stays cacheable across renders.
 */
export const skeletonRecipe = recipe({
  base: {
    display: 'block',
    width: skeletonWidthVar,
    height: skeletonHeightVar,
    borderRadius: skeletonRadiusVar,
    background: vars.colors.surface.default,
    flexShrink: 0,
  },
  variants: {
    shape: {
      rect: {},
      circle: {},
      line: {},
    },
    animation: {
      pulse: {
        animation: `${pulseKeyframe} 1.5s ease-in-out infinite`,
        '@media': {
          '(prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        },
      },
      wave: {
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(90deg, transparent 0%, ${vars.colors.surface.whiteOverlay} 50%, transparent 100%)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '200% 100%',
        backgroundColor: vars.colors.surface.default,
        animation: `${waveKeyframe} 1.6s linear infinite`,
        '@media': {
          '(prefers-reduced-motion: reduce)': {
            animation: 'none',
            backgroundImage: 'none',
          },
        },
      },
      none: {},
    },
  },
  defaultVariants: {
    shape: 'rect',
    animation: 'pulse',
  },
});

/**
 * SkeletonGroup root — flex container with configurable direction and gap.
 *
 * Spacing is applied via the `--etui-skeleton-group-gap` inline custom
 * property (set on the element by the component) so we can accept either
 * a `vars.spacing.*` token or a raw CSS string with one rule.
 */
export const skeletonGroupGapVar = createVar();

export const skeletonGroupRecipe = recipe({
  base: {
    display: 'flex',
    gap: skeletonGroupGapVar,
  },
  variants: {
    direction: {
      row: { flexDirection: 'row' },
      column: { flexDirection: 'column' },
    },
  },
  defaultVariants: {
    direction: 'column',
  },
});
