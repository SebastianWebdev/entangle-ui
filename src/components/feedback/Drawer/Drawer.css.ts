import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const DRAWER_ANIMATION_MS = 220;

export const DRAWER_SIZE_MAP: Record<string, string> = {
  sm: '280px',
  md: '360px',
  lg: '480px',
  xl: '640px',
};

const overlayFadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const overlayFadeOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

const slideFromLeftIn = keyframes({
  from: { transform: 'translateX(-100%)' },
  to: { transform: 'translateX(0)' },
});
const slideFromLeftOut = keyframes({
  from: { transform: 'translateX(0)' },
  to: { transform: 'translateX(-100%)' },
});
const slideFromRightIn = keyframes({
  from: { transform: 'translateX(100%)' },
  to: { transform: 'translateX(0)' },
});
const slideFromRightOut = keyframes({
  from: { transform: 'translateX(0)' },
  to: { transform: 'translateX(100%)' },
});
const slideFromTopIn = keyframes({
  from: { transform: 'translateY(-100%)' },
  to: { transform: 'translateY(0)' },
});
const slideFromTopOut = keyframes({
  from: { transform: 'translateY(0)' },
  to: { transform: 'translateY(-100%)' },
});
const slideFromBottomIn = keyframes({
  from: { transform: 'translateY(100%)' },
  to: { transform: 'translateY(0)' },
});
const slideFromBottomOut = keyframes({
  from: { transform: 'translateY(0)' },
  to: { transform: 'translateY(100%)' },
});

export const overlayRecipe = recipe({
  base: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: vars.colors.backdrop,
    backdropFilter: 'blur(2px)',
    zIndex: vars.zIndex.modal,

    '@media': {
      '(prefers-reduced-motion: reduce)': {
        animation: 'none',
      },
    },
  },

  variants: {
    closing: {
      true: {
        animation: `${overlayFadeOut} ${String(DRAWER_ANIMATION_MS)}ms ease-out forwards`,
      },
      false: {
        animation: `${overlayFadeIn} ${String(DRAWER_ANIMATION_MS)}ms ease-out forwards`,
      },
    },
  },

  defaultVariants: {
    closing: false,
  },
});

const drawerPanelBase = style({
  position: 'fixed',
  zIndex: vars.zIndex.modal,
  display: 'flex',
  flexDirection: 'column',
  background: vars.colors.background.primary,
  color: vars.colors.text.primary,
  fontFamily: vars.typography.fontFamily.sans,
  boxShadow: vars.shadows.xl,
  outline: 'none',
  overflow: 'hidden',

  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const drawerPanelRecipe = recipe({
  base: [drawerPanelBase],

  variants: {
    anchor: {
      left: {
        top: 0,
        bottom: 0,
        left: 0,
        height: '100vh',
        borderRight: `1px solid ${vars.colors.border.default}`,
      },
      right: {
        top: 0,
        bottom: 0,
        right: 0,
        height: '100vh',
        borderLeft: `1px solid ${vars.colors.border.default}`,
      },
      top: {
        top: 0,
        left: 0,
        right: 0,
        width: '100vw',
        borderBottom: `1px solid ${vars.colors.border.default}`,
      },
      bottom: {
        bottom: 0,
        left: 0,
        right: 0,
        width: '100vw',
        borderTop: `1px solid ${vars.colors.border.default}`,
      },
    },
    state: {
      open: {},
      closing: {},
    },
  },

  compoundVariants: [
    {
      variants: { anchor: 'left', state: 'open' },
      style: {
        animation: `${slideFromLeftIn} ${String(DRAWER_ANIMATION_MS)}ms ease-out forwards`,
      },
    },
    {
      variants: { anchor: 'left', state: 'closing' },
      style: {
        animation: `${slideFromLeftOut} ${String(DRAWER_ANIMATION_MS)}ms ease-out forwards`,
      },
    },
    {
      variants: { anchor: 'right', state: 'open' },
      style: {
        animation: `${slideFromRightIn} ${String(DRAWER_ANIMATION_MS)}ms ease-out forwards`,
      },
    },
    {
      variants: { anchor: 'right', state: 'closing' },
      style: {
        animation: `${slideFromRightOut} ${String(DRAWER_ANIMATION_MS)}ms ease-out forwards`,
      },
    },
    {
      variants: { anchor: 'top', state: 'open' },
      style: {
        animation: `${slideFromTopIn} ${String(DRAWER_ANIMATION_MS)}ms ease-out forwards`,
      },
    },
    {
      variants: { anchor: 'top', state: 'closing' },
      style: {
        animation: `${slideFromTopOut} ${String(DRAWER_ANIMATION_MS)}ms ease-out forwards`,
      },
    },
    {
      variants: { anchor: 'bottom', state: 'open' },
      style: {
        animation: `${slideFromBottomIn} ${String(DRAWER_ANIMATION_MS)}ms ease-out forwards`,
      },
    },
    {
      variants: { anchor: 'bottom', state: 'closing' },
      style: {
        animation: `${slideFromBottomOut} ${String(DRAWER_ANIMATION_MS)}ms ease-out forwards`,
      },
    },
  ],

  defaultVariants: {
    anchor: 'right',
    state: 'open',
  },
});

export const drawerHeaderStyle = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.spacing.md,
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  borderBottom: `1px solid ${vars.colors.border.default}`,
  flexShrink: 0,
});

export const drawerHeaderContentStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  minWidth: 0,
  flex: 1,
});

export const drawerTitleStyle = style({
  fontSize: vars.typography.fontSize.lg,
  fontWeight: vars.typography.fontWeight.semibold,
  color: vars.colors.text.primary,
  lineHeight: vars.typography.lineHeight.tight,
});

export const drawerDescriptionStyle = style({
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.secondary,
  lineHeight: vars.typography.lineHeight.normal,
});

export const drawerBodyStyle = style({
  padding: vars.spacing.lg,
  overflowY: 'auto',
  flex: 1,
  fontSize: vars.typography.fontSize.md,
  color: vars.colors.text.primary,
  lineHeight: vars.typography.lineHeight.normal,
});

export const drawerFooterRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.md,
    padding: `${vars.spacing.md} ${vars.spacing.lg}`,
    borderTop: `1px solid ${vars.colors.border.default}`,
    flexShrink: 0,
  },

  variants: {
    align: {
      left: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      right: { justifyContent: 'flex-end' },
      'space-between': { justifyContent: 'space-between' },
    },
  },

  defaultVariants: {
    align: 'right',
  },
});

export const drawerCloseButtonStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  padding: 0,
  margin: 0,
  border: 'none',
  borderRadius: vars.borderRadius.sm,
  background: 'transparent',
  color: vars.colors.text.secondary,
  cursor: 'pointer',
  flexShrink: 0,
  transition: `background ${vars.transitions.fast}, color ${vars.transitions.fast}`,

  ':hover': {
    background: vars.colors.surface.hover,
    color: vars.colors.text.primary,
  },

  ':focus-visible': {
    outline: 'none',
    boxShadow: vars.shadows.focus,
  },
});
