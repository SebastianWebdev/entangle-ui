import { style, keyframes, createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

// --- Dynamic vars ---
export const progressDurationVar = createVar();

// --- Animations ---

const slideIn = keyframes({
  from: {
    opacity: 0,
    transform: 'translateX(20px)',
  },
  to: {
    opacity: 1,
    transform: 'translateX(0)',
  },
});

const progressShrink = keyframes({
  from: {
    width: '100%',
  },
  to: {
    width: '0%',
  },
});

// --- Styled components ---

export const toast = recipe({
  base: {
    width: '360px',
    background: vars.colors.background.elevated,
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.lg,
    boxShadow: vars.shadows.md,
    padding: vars.spacing.md,
    pointerEvents: 'auto',
    position: 'relative',
    overflow: 'hidden',
    animation: `${slideIn} ${vars.transitions.normal} forwards`,
  },
  variants: {
    severity: {
      info: {
        borderLeft: `3px solid ${vars.colors.accent.primary}`,
      },
      success: {
        borderLeft: `3px solid ${vars.colors.accent.success}`,
      },
      warning: {
        borderLeft: `3px solid ${vars.colors.accent.warning}`,
      },
      error: {
        borderLeft: `3px solid ${vars.colors.accent.error}`,
      },
    },
  },
  defaultVariants: {
    severity: 'info',
  },
});

export const content = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.spacing.md,
});

export const iconWrapper = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  paddingTop: '1px',
});

export const textContent = style({
  flex: 1,
  minWidth: 0,
});

export const titleStyle = style({
  fontWeight: vars.typography.fontWeight.semibold,
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSize.sm,
  lineHeight: vars.typography.lineHeight.normal,
});

export const message = style({
  color: vars.colors.text.secondary,
  fontSize: vars.typography.fontSize.xs,
  lineHeight: vars.typography.lineHeight.normal,
  marginTop: vars.spacing.xs,
});

export const closeButton = style({
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  outline: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: '20px',
  height: '20px',
  borderRadius: vars.borderRadius.sm,
  color: vars.colors.text.muted,
  transition: `color ${vars.transitions.fast}, background ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      color: vars.colors.text.primary,
      background: vars.colors.surface.hover,
    },
    '&:focus-visible': {
      boxShadow: vars.shadows.focus,
    },
  },
});

export const actionButton = recipe({
  base: {
    padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
    margin: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    outline: 'none',
    fontSize: vars.typography.fontSize.xs,
    fontWeight: vars.typography.fontWeight.medium,
    borderRadius: vars.borderRadius.sm,
    transition: `background ${vars.transitions.fast}`,
    marginTop: vars.spacing.sm,
    selectors: {
      '&:hover': {
        background: vars.colors.surface.hover,
      },
      '&:focus-visible': {
        boxShadow: vars.shadows.focus,
      },
    },
  },
  variants: {
    severity: {
      info: {
        color: vars.colors.accent.primary,
      },
      success: {
        color: vars.colors.accent.success,
      },
      warning: {
        color: vars.colors.accent.warning,
      },
      error: {
        color: vars.colors.accent.error,
      },
    },
  },
  defaultVariants: {
    severity: 'info',
  },
});

export const progressBar = recipe({
  base: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '2px',
    animationName: progressShrink,
    animationTimingFunction: 'linear',
    animationFillMode: 'forwards',
    animationDuration: progressDurationVar,
  },
  variants: {
    severity: {
      info: {
        background: vars.colors.accent.primary,
      },
      success: {
        background: vars.colors.accent.success,
      },
      warning: {
        background: vars.colors.accent.warning,
      },
      error: {
        background: vars.colors.accent.error,
      },
    },
    paused: {
      true: {
        animationPlayState: 'paused',
      },
      false: {
        animationPlayState: 'running',
      },
    },
  },
  defaultVariants: {
    severity: 'info',
    paused: false,
  },
});
