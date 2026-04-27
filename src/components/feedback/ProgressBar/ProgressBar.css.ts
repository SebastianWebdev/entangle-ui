import { createVar, keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// ─── Dynamic CSS variables ────────────────────────────────────────

export const progressColorVar = createVar();
export const progressFillWidthVar = createVar();

// ─── Keyframes (component-local) ──────────────────────────────────

export const indeterminateSlideKeyframe = keyframes({
  '0%': { left: '-40%' },
  '100%': { left: '100%' },
});

export const stripeShiftKeyframe = keyframes({
  from: { backgroundPosition: '0 0' },
  to: { backgroundPosition: '20px 0' },
});

export const circularRotateKeyframe = keyframes({
  from: { transform: 'rotate(-90deg)' },
  to: { transform: 'rotate(270deg)' },
});

// ─── Linear: root ─────────────────────────────────────────────────

export const progressRootStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  width: '100%',
});

export const progressTrackRecipe = recipe({
  base: {
    position: 'relative',
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: vars.colors.surface.default,
  },
  variants: {
    size: {
      sm: { height: '2px', borderRadius: '1px' },
      md: { height: '4px', borderRadius: '2px' },
      lg: { height: '8px', borderRadius: '4px' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// ─── Linear: fill ─────────────────────────────────────────────────

export const progressFillBaseStyle = style({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  backgroundColor: progressColorVar,
  borderRadius: 'inherit',
  transition: `width ${vars.transitions.normal}`,
  width: progressFillWidthVar,
  willChange: 'width',
});

export const progressFillStripedStyle = style({
  backgroundImage: `linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  )`,
  backgroundSize: '20px 20px',
  backgroundColor: progressColorVar,
});

export const progressFillStripedAnimatedStyle = style({
  animation: `${stripeShiftKeyframe} 1s linear infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

// ─── Linear: indeterminate ────────────────────────────────────────

export const progressIndeterminateStyle = style({
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '40%',
  borderRadius: 'inherit',
  backgroundColor: progressColorVar,
  animation: `${indeterminateSlideKeyframe} 1.5s linear infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      left: 0,
      width: '100%',
      opacity: 0.6,
    },
  },
});

// ─── Linear: labels ───────────────────────────────────────────────

export const progressInlineLabelStyle = style({
  flexShrink: 0,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
  fontVariantNumeric: 'tabular-nums',
  minWidth: '3ch',
  textAlign: 'right',
});

export const progressOverlayLabelStyle = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.primary,
  fontVariantNumeric: 'tabular-nums',
  pointerEvents: 'none',
  lineHeight: 1,
});

// ─── Circular ─────────────────────────────────────────────────────

export const circularRootStyle = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 0,
});

export const circularSvgStyle = style({
  display: 'block',
  color: progressColorVar,
});

export const circularTrackCircleStyle = style({
  stroke: vars.colors.surface.default,
});

export const circularFillCircleStyle = style({
  stroke: progressColorVar,
  transition: `stroke-dashoffset ${vars.transitions.normal}`,
});

export const circularIndeterminateStyle = style({
  transformOrigin: 'center',
  animation: `${circularRotateKeyframe} 1s linear infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: 0.6,
    },
  },
});

export const circularLabelStyle = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: vars.colors.text.primary,
  fontVariantNumeric: 'tabular-nums',
  pointerEvents: 'none',
  lineHeight: 1,
});
