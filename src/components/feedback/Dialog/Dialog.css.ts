import { style, keyframes } from '@vanilla-extract/css';
import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Constants ---

export const DIALOG_ANIMATION_MS = 200;

export const DIALOG_SIZE_MAP: Record<string, string> = {
  sm: '360px',
  md: '480px',
  lg: '640px',
  xl: '800px',
  fullscreen: 'calc(100vw - 48px)',
};

// --- Animations ---

const overlayFadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const overlayFadeOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

const panelFadeIn = keyframes({
  from: {
    opacity: 0,
    transform: 'translate(-50%, -50%) scale(0.95)',
  },
  to: {
    opacity: 1,
    transform: 'translate(-50%, -50%) scale(1)',
  },
});

const panelFadeOut = keyframes({
  from: {
    opacity: 1,
    transform: 'translate(-50%, -50%) scale(1)',
  },
  to: {
    opacity: 0,
    transform: 'translate(-50%, -50%) scale(0.95)',
  },
});

// --- Overlay ---

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
  },

  variants: {
    closing: {
      true: {
        animation: `${overlayFadeOut} 150ms ease-out forwards`,
      },
      false: {
        animation: `${overlayFadeIn} 150ms ease-out forwards`,
      },
    },
  },

  defaultVariants: {
    closing: false,
  },
});

export type OverlayVariants = RecipeVariants<typeof overlayRecipe>;

// --- Dialog Panel ---

const dialogPanelBase = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: vars.zIndex.modal,
  maxWidth: 'calc(100vw - 48px)',
  maxHeight: 'calc(100vh - 48px)',
  display: 'flex',
  flexDirection: 'column',
  background: vars.colors.background.primary,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.lg,
  boxShadow: vars.shadows.lg,
  fontFamily: vars.typography.fontFamily.sans,
  outline: 'none',
});

export const dialogPanelRecipe = recipe({
  base: [dialogPanelBase],

  variants: {
    size: {
      sm: { width: DIALOG_SIZE_MAP['sm'] },
      md: { width: DIALOG_SIZE_MAP['md'] },
      lg: { width: DIALOG_SIZE_MAP['lg'] },
      xl: { width: DIALOG_SIZE_MAP['xl'] },
      fullscreen: { width: DIALOG_SIZE_MAP['fullscreen'] },
    },

    closing: {
      true: {
        animation: `${panelFadeOut} ${DIALOG_ANIMATION_MS}ms ease-out forwards`,
      },
      false: {
        animation: `${panelFadeIn} ${DIALOG_ANIMATION_MS}ms ease-out forwards`,
      },
    },
  },

  defaultVariants: {
    size: 'md',
    closing: false,
  },
});

export type DialogPanelVariants = RecipeVariants<typeof dialogPanelRecipe>;

// --- Header ---

export const dialogHeaderStyle = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  borderBottom: `1px solid ${vars.colors.border.default}`,
  flexShrink: 0,
});

export const dialogHeaderContentStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  minWidth: 0,
  flex: 1,
});

export const dialogTitleStyle = style({
  fontSize: vars.typography.fontSize.lg,
  fontWeight: vars.typography.fontWeight.semibold,
  color: vars.colors.text.primary,
  lineHeight: vars.typography.lineHeight.tight,
});

export const dialogDescriptionStyle = style({
  fontSize: vars.typography.fontSize.sm,
  color: vars.colors.text.secondary,
  lineHeight: vars.typography.lineHeight.normal,
});

export const dialogCloseButtonStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  padding: 0,
  margin: 0,
  marginLeft: vars.spacing.md,
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

// --- Body ---

export const dialogBodyStyle = style({
  padding: vars.spacing.lg,
  overflowY: 'auto',
  flex: 1,
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSize.md,
  lineHeight: vars.typography.lineHeight.normal,
});

// --- Footer ---

export const dialogFooterRecipe = recipe({
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

export type DialogFooterVariants = RecipeVariants<typeof dialogFooterRecipe>;
