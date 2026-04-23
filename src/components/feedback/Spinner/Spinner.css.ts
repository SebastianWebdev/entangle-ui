import { createVar, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';
import { pulseKeyframe, spinKeyframe } from '@/utils/animations.css';

export const spinnerColorVar = createVar();
export const spinnerSizeVar = createVar();

export const spinnerRootStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  color: spinnerColorVar,
});

export const spinnerRingStyle = style({
  width: spinnerSizeVar,
  height: spinnerSizeVar,
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: `${spinKeyframe} 1s linear infinite`,

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: 0.6,
    },
  },
});

export const spinnerDotsWrapperStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
});

export const spinnerDotRecipe = recipe({
  base: {
    width: '25%',
    height: '25%',
    minWidth: '3px',
    minHeight: '3px',
    borderRadius: '50%',
    background: 'currentColor',
    animation: `${pulseKeyframe} 1.2s ease-in-out infinite`,
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        animation: 'none',
        opacity: 0.6,
      },
    },
  },
  variants: {
    delay: {
      '0': { animationDelay: '0ms' },
      '1': { animationDelay: '160ms' },
      '2': { animationDelay: '320ms' },
    },
  },
});

export const spinnerDotsSizerStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '15%',
  width: spinnerSizeVar,
  height: spinnerSizeVar,
});

export const spinnerPulseStyle = style({
  width: spinnerSizeVar,
  height: spinnerSizeVar,
  borderRadius: '50%',
  background: 'currentColor',
  animation: `${pulseKeyframe} 1.2s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: 0.6,
    },
  },
});

export const spinnerLabelStyle = style({
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.secondary,
});

export const visuallyHiddenStyle = style({
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
