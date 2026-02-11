import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from '@/theme/contract.css';

export const tooltipContentStyle = style({
  background: vars.colors.background.elevated,
  color: vars.colors.text.primary,
  borderRadius: vars.borderRadius.md,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  fontSize: vars.typography.fontSize.xs,
  lineHeight: vars.typography.lineHeight.tight,
  fontFamily: vars.typography.fontFamily.sans,
  boxShadow: vars.shadows.lg,
  maxWidth: '320px',
  wordWrap: 'break-word',
  zIndex: vars.zIndex.tooltip,
  minHeight: '25px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transformOrigin: 'var(--transform-origin)',

  selectors: {
    '&[data-open]': {
      opacity: 1,
      transform: 'scale(1)',
    },
    '&[data-closed]': {
      opacity: 0,
      transform: 'scale(0.96)',
    },
  },
});

export const tooltipTriggerStyle = style({
  display: 'inline-block',
  cursor: 'pointer',
  width: 'fit-content',
  height: 'fit-content',
  position: 'relative',
  zIndex: 1,
  pointerEvents: 'none',

  ':focus': {
    outline: 'none',
    boxShadow: vars.shadows.focus,
  },
});

globalStyle(`${tooltipTriggerStyle} > *`, {
  pointerEvents: 'auto',
});

export const arrowFillStyle = style({
  fill: vars.colors.background.elevated,
});

export const tooltipArrowStyle = style({
  display: 'flex',
  transformStyle: 'preserve-3d',
  backfaceVisibility: 'hidden',
  perspective: '1000px',
  imageRendering: 'crisp-edges',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  willChange: 'transform',

  selectors: {
    '&[data-side="top"]': {
      bottom: '-8px',
      rotate: '180deg',
    },
    '&[data-side="bottom"]': {
      top: '-8px',
      rotate: '0deg',
    },
    '&[data-side="left"]': {
      right: '-13px',
      rotate: '90deg',
    },
    '&[data-side="right"]': {
      left: '-13px',
      rotate: '-90deg',
    },
  },
});
