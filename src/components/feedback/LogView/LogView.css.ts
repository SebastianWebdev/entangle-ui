import { createVar, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@/theme/contract.css';

/** Total height of the virtualized rows wrapper. */
export const totalHeightVar = createVar();
/** Fixed row height per density. */
export const rowHeightVar = createVar();
/** Per-row / per-chip level color. Built-in levels set it via recipe; custom levels inject it inline. */
export const levelColorVar = createVar();

/**
 * Fixed row heights per density (px). Keep in sync with the `density` variant
 * of {@link rowRecipe}; the body reads these for the virtualizer's
 * `estimateSize`.
 */
export const DENSITY_ROW_HEIGHT = {
  comfortable: 30,
  compact: 26,
  dense: 22,
} as const;

export const rootRecipe = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    width: '100%',
    minHeight: 0,
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.md,
    background: vars.colors.background.primary,
    color: vars.colors.text.primary,
    overflow: 'hidden',
    fontFamily: vars.typography.fontFamily.sans,
  },
  variants: {
    density: {
      comfortable: {
        vars: { [rowHeightVar]: `${DENSITY_ROW_HEIGHT.comfortable}px` },
      },
      compact: {
        vars: { [rowHeightVar]: `${DENSITY_ROW_HEIGHT.compact}px` },
      },
      dense: { vars: { [rowHeightVar]: `${DENSITY_ROW_HEIGHT.dense}px` } },
    },
  },
  defaultVariants: { density: 'compact' },
});

// ── Toolbar ──

export const toolbarStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  borderBottom: `1px solid ${vars.colors.border.default}`,
  background: vars.colors.surface.default,
  flexShrink: 0,
});

export const toolbarSpacerStyle = style({ flex: 1, minWidth: vars.spacing.sm });

export const searchWrapperStyle = style({
  flex: '0 1 240px',
  minWidth: '120px',
});

// ── Level filter chips ──

export const levelFilterStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  flexWrap: 'wrap',
});

export const levelChipRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.sm,
    height: '26px',
    padding: `0 ${vars.spacing.md}`,
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.md,
    background: 'transparent',
    color: levelColorVar,
    fontFamily: vars.typography.fontFamily.sans,
    fontSize: vars.typography.fontSize.sm,
    lineHeight: vars.typography.lineHeight.tight,
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    transition: `background ${vars.transitions.fast}, border-color ${vars.transitions.fast}, opacity ${vars.transitions.fast}, color ${vars.transitions.fast}`,
    vars: { [levelColorVar]: vars.colors.text.secondary },
    selectors: {
      '&:hover': { background: vars.colors.surface.hover },
      '&:focus-visible': {
        outline: `2px solid ${vars.colors.border.focus}`,
        outlineOffset: '1px',
      },
    },
  },
  variants: {
    level: {
      debug: { vars: { [levelColorVar]: vars.colors.text.muted } },
      info: { vars: { [levelColorVar]: vars.colors.text.secondary } },
      warn: { vars: { [levelColorVar]: vars.colors.accent.warning } },
      error: { vars: { [levelColorVar]: vars.colors.accent.error } },
      // `custom` levels receive their color via an inline `levelColorVar`.
      custom: {},
    },
    active: {
      true: {
        borderColor: levelColorVar,
        background: `color-mix(in srgb, ${levelColorVar} 14%, transparent)`,
      },
      false: {
        opacity: 0.55,
      },
    },
  },
  defaultVariants: { active: true },
});

/** Colored dot / icon wrapper inside a chip or row. */
export const levelGlyphStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: levelColorVar,
  flexShrink: 0,
});

/** Fallback dot when a level has no icon. */
export const levelDotStyle = style({
  width: '8px',
  height: '8px',
  borderRadius: vars.borderRadius.lg,
  background: levelColorVar,
  flexShrink: 0,
});

export const chipCountStyle = style({
  fontVariantNumeric: 'tabular-nums',
  color: 'inherit',
  opacity: 0.75,
  fontSize: vars.typography.fontSize.xs,
  paddingLeft: vars.spacing.xs,
});

// ── Body / scroll viewport ──

/**
 * Outer body wrapper. Fills the remaining root height (`flex: 1`), is positioned
 * (so the absolute jump-to-bottom button anchors to the corner), and clips — the
 * actual scrolling happens in {@link scrollViewportStyle}.
 */
export const bodyStyle = style({
  position: 'relative',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
  background: vars.colors.background.primary,
  fontFamily: vars.typography.fontFamily.mono,
});

/**
 * The actual scroll element (the virtualizer's `getScrollElement`). Absolutely
 * fills the wrapper via `inset: 0` so its height is definite regardless of how
 * the wrapper was flex-sized.
 */
export const scrollViewportStyle = style({
  position: 'absolute',
  inset: 0,
  overflow: 'auto',
  scrollbarColor: `${vars.colors.border.default} transparent`,
  scrollbarWidth: 'thin',
});

export const bodyDensityRecipe = recipe({
  variants: {
    density: {
      comfortable: { fontSize: vars.typography.fontSize.md },
      compact: { fontSize: vars.typography.fontSize.sm },
      dense: { fontSize: vars.typography.fontSize.xs },
    },
  },
  defaultVariants: { density: 'compact' },
});

export const virtualBodyStyle = style({
  position: 'relative',
  width: '100%',
  height: totalHeightVar,
});

export const plainBodyStyle = style({
  display: 'flex',
  flexDirection: 'column',
});

// ── Row ──

export const rowRecipe = recipe({
  base: {
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: vars.spacing.md,
    width: '100%',
    minHeight: rowHeightVar,
    padding: `0 ${vars.spacing.md}`,
    borderLeft: `2px solid transparent`,
    color: vars.colors.text.primary,
    transition: `background ${vars.transitions.fast}`,
    vars: { [levelColorVar]: vars.colors.text.secondary },
    selectors: {
      // Always highlight the hovered row so it's clear which line the per-line
      // copy affordance belongs to.
      '&:hover': { background: vars.colors.surface.hover },
    },
  },
  variants: {
    level: {
      debug: { vars: { [levelColorVar]: vars.colors.text.muted } },
      info: { vars: { [levelColorVar]: vars.colors.text.secondary } },
      warn: {
        vars: { [levelColorVar]: vars.colors.accent.warning },
        borderLeftColor: vars.colors.accent.warning,
      },
      error: {
        vars: { [levelColorVar]: vars.colors.accent.error },
        borderLeftColor: vars.colors.accent.error,
        background: `color-mix(in srgb, ${vars.colors.accent.error} 7%, transparent)`,
      },
      custom: { borderLeftColor: levelColorVar },
    },
    virtualized: {
      true: { position: 'absolute', top: 0, left: 0, right: 0 },
    },
    interactive: {
      true: { cursor: 'pointer' },
    },
    selected: {
      true: {
        background: `color-mix(in srgb, ${vars.colors.accent.primary} 22%, transparent)`,
        selectors: {
          '&:hover': {
            background: `color-mix(in srgb, ${vars.colors.accent.primary} 30%, transparent)`,
          },
        },
      },
    },
    align: {
      // `center` for single-line rows, `flex-start` for wrapped rows.
      center: { alignItems: 'center' },
      start: { alignItems: 'flex-start' },
    },
  },
  defaultVariants: { align: 'center' },
});

export const timestampStyle = style({
  color: vars.colors.text.muted,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'pre',
  flexShrink: 0,
  userSelect: 'none',
});

export const rowGlyphStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: levelColorVar,
  flexShrink: 0,
  width: '18px',
});

/** Layout-only tweaks layered on the shared `<Badge>` used for the source tag. */
export const sourceTagStyle = style({
  flexShrink: 0,
  maxWidth: '160px',
});

export const messageRecipe = recipe({
  base: {
    flex: 1,
    minWidth: 0,
    color: 'inherit',
  },
  variants: {
    wrap: {
      true: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' },
      false: { whiteSpace: 'pre' },
    },
  },
  defaultVariants: { wrap: false },
});

export const highlightStyle = style({
  background: `color-mix(in srgb, ${vars.colors.accent.warning} 40%, transparent)`,
  color: 'inherit',
  borderRadius: vars.borderRadius.sm,
});

// ── Per-line copy affordance ──

export const copyLineButtonStyle = style({
  position: 'absolute',
  top: '50%',
  right: vars.spacing.xs,
  transform: 'translateY(-50%)',
  opacity: 0,
  transition: `opacity ${vars.transitions.fast}`,
  selectors: {
    // Reveal when the host row is hovered, or when the button gains focus.
    '[data-log-copy-host]:hover &': { opacity: 1 },
    '&:focus-within': { opacity: 1 },
  },
});

// ── Empty state ──

export const emptyStateStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '80px',
  padding: vars.spacing.xl,
  textAlign: 'center',
  color: vars.colors.text.muted,
  fontFamily: vars.typography.fontFamily.sans,
  fontSize: vars.typography.fontSize.sm,
});

// ── Jump-to-bottom ──

/**
 * Positioning + show/hide wrapper around the shared `<Button>`. Layout and
 * visibility only — the button itself provides the chrome (border, hover,
 * focus ring). Carries the elevation so the control reads as floating.
 */
export const jumpButtonRecipe = recipe({
  base: {
    position: 'absolute',
    bottom: vars.spacing.md,
    right: vars.spacing.md,
    display: 'inline-flex',
    borderRadius: vars.borderRadius.md,
    boxShadow: vars.shadows.md,
    transition: `opacity ${vars.transitions.fast}, transform ${vars.transitions.fast}`,
    zIndex: vars.zIndex.base,
  },
  variants: {
    visible: {
      true: { opacity: 1, transform: 'translateY(0)', pointerEvents: 'auto' },
      false: {
        opacity: 0,
        transform: 'translateY(8px)',
        pointerEvents: 'none',
      },
    },
  },
  defaultVariants: { visible: false },
});

export const jumpBadgeStyle = style({
  fontVariantNumeric: 'tabular-nums',
  fontWeight: vars.typography.fontWeight.semibold,
  color: vars.colors.accent.primary,
});
