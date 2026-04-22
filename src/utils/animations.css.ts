import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

/**
 * Shared keyframe and animation utility classes.
 *
 * Prefer these over redefining the same keyframes in every component —
 * it keeps the built CSS small and ensures consistent motion across
 * the library. Each utility class respects
 * `@media (prefers-reduced-motion: reduce)` by disabling the animation.
 */

// ─── Keyframes ────────────────────────────────────────────────────

export const spinKeyframe = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const pulseKeyframe = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.4 },
});

export const blinkKeyframe = keyframes({
  '0%, 50%': { opacity: 1 },
  '51%, 100%': { opacity: 0 },
});

export const fadeInKeyframe = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

// ─── Utility classes ──────────────────────────────────────────────

export const animSpin = style({
  animation: `${spinKeyframe} 1s linear infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const animPulse = style({
  animation: `${pulseKeyframe} 1.5s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const animBlink = style({
  animation: `${blinkKeyframe} 1s steps(1) infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const animFadeIn = style({
  animation: `${fadeInKeyframe} ${vars.transitions.normal} ease-out`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});
