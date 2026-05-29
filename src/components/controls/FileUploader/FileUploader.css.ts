import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@/theme/contract.css';

export const containerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const dropZoneRecipe = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    border: `1px dashed ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.md,
    background: vars.colors.surface.default,
    color: vars.colors.text.secondary,
    fontFamily: vars.typography.fontFamily.sans,
    cursor: 'pointer',
    transition: `border-color ${vars.transitions.fast}, background ${vars.transitions.fast}`,
    selectors: {
      '&:focus-visible': {
        outline: 'none',
        boxShadow: vars.shadows.focus,
      },
    },
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  },
  variants: {
    size: {
      sm: {
        padding: vars.spacing.md,
        fontSize: vars.typography.fontSize.xs,
        gap: vars.spacing.xs,
      },
      md: {
        padding: vars.spacing.lg,
        fontSize: vars.typography.fontSize.sm,
        gap: vars.spacing.sm,
      },
      lg: {
        padding: vars.spacing.xl,
        fontSize: vars.typography.fontSize.md,
        gap: vars.spacing.md,
      },
    },
    dragging: {
      true: {
        borderColor: vars.colors.accent.primary,
        background: vars.colors.surface.hover,
        color: vars.colors.text.primary,
      },
      false: {},
    },
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      false: {},
    },
    error: {
      true: { borderColor: vars.colors.accent.error },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    dragging: false,
    disabled: false,
    error: false,
  },
});

export const dropZonePrimaryStyle = style({
  fontWeight: vars.typography.fontWeight.medium,
  color: vars.colors.text.primary,
});

export const dropZoneHintStyle = style({
  color: vars.colors.text.muted,
  fontSize: vars.typography.fontSize.xs,
});

export const hiddenInputStyle = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  border: 0,
  padding: 0,
});

export const fileListStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  marginTop: vars.spacing.sm,
  width: '100%',
});

export const fileRowRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    padding: `${vars.spacing.sm} ${vars.spacing.md}`,
    borderRadius: vars.borderRadius.md,
    border: `1px solid ${vars.colors.border.default}`,
    background: vars.colors.surface.default,
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSize.xs,
  },
  variants: {
    status: {
      pending: {},
      uploading: {},
      done: {},
      error: {
        borderColor: vars.colors.accent.error,
      },
    },
  },
  defaultVariants: {
    status: 'pending',
  },
});

export const fileMetaStyle = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  gap: 2,
});

export const fileNameStyle = style({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const fileSubStyle = style({
  color: vars.colors.text.muted,
  fontSize: '11px',
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});

export const progressBarStyle = style({
  position: 'relative',
  width: '100%',
  height: '3px',
  borderRadius: vars.borderRadius.sm,
  background: vars.colors.surface.active,
  overflow: 'hidden',
});

export const progressFillRecipe = recipe({
  base: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    transition: `width ${vars.transitions.normal}`,
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  },
  variants: {
    status: {
      pending: { background: vars.colors.text.muted },
      uploading: { background: vars.colors.accent.primary },
      done: { background: vars.colors.accent.success },
      error: { background: vars.colors.accent.error },
    },
  },
  defaultVariants: { status: 'uploading' },
});

export const removeButtonStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  padding: 0,
  border: 'none',
  background: 'transparent',
  color: vars.colors.text.muted,
  cursor: 'pointer',
  borderRadius: vars.borderRadius.sm,
  selectors: {
    '&:hover': {
      color: vars.colors.text.primary,
      background: vars.colors.surface.hover,
    },
    '&:disabled': { cursor: 'not-allowed', opacity: 0.5 },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: vars.shadows.focus,
    },
  },
});

export const statusBadgeRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `0 ${vars.spacing.xs}`,
    height: '14px',
    borderRadius: vars.borderRadius.sm,
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  variants: {
    status: {
      pending: {
        background: vars.colors.surface.active,
        color: vars.colors.text.muted,
      },
      uploading: {
        background: vars.colors.accent.primary,
        color: vars.colors.text.primary,
      },
      done: {
        background: vars.colors.accent.success,
        color: vars.colors.text.primary,
      },
      error: {
        background: vars.colors.accent.error,
        color: vars.colors.text.primary,
      },
    },
  },
  defaultVariants: { status: 'pending' },
});
