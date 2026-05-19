import { createVar, keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

/** Total height of the virtualized rows wrapper. */
export const totalHeightVar = createVar();
/** Per-density row height. */
export const rowHeightVar = createVar();
/** Grid template columns string. Same across header and rows so columns line up. */
export const gridTemplateColumnsVar = createVar();
/** Minimum total width (sum of column widths) for horizontal scroll. */
export const tableMinWidthVar = createVar();

const ROW_HEIGHT_COMFORTABLE = '40px';
const ROW_HEIGHT_COMPACT = '32px';
const ROW_HEIGHT_DENSE = '24px';

const skeletonPulseKeyframe = keyframes({
  '0%, 100%': { opacity: 0.6 },
  '50%': { opacity: 1 },
});

export const rootRecipe = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    width: '100%',
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.md,
    background: vars.colors.background.primary,
    color: vars.colors.text.primary,
    overflow: 'hidden',
    fontSize: vars.typography.fontSize.sm,
    fontFamily: vars.typography.fontFamily.sans,
    selectors: {
      '&:focus': { outline: 'none' },
      '&:focus-visible': {
        outline: `2px solid ${vars.colors.border.focus}`,
        outlineOffset: '-1px',
      },
    },
  },
  variants: {
    density: {
      comfortable: { vars: { [rowHeightVar]: ROW_HEIGHT_COMFORTABLE } },
      compact: { vars: { [rowHeightVar]: ROW_HEIGHT_COMPACT } },
      dense: { vars: { [rowHeightVar]: ROW_HEIGHT_DENSE } },
    },
  },
  defaultVariants: { density: 'comfortable' },
});

export const scrollContainerStyle = style({
  flex: 1,
  overflow: 'auto',
  position: 'relative',
  scrollbarColor: `${vars.colors.border.default} transparent`,
  scrollbarWidth: 'thin',
});

/**
 * Inner wrapper that grows to the full table width when columns are wider
 * than the scroll container.
 */
export const innerWrapperStyle = style({
  minWidth: tableMinWidthVar,
});

/** Header is a sticky horizontal grid. */
export const headerStyle = recipe({
  base: {
    display: 'grid',
    gridTemplateColumns: gridTemplateColumnsVar,
    background: vars.colors.surface.default,
    borderBottom: `1px solid ${vars.colors.border.default}`,
  },
  variants: {
    sticky: {
      true: {
        position: 'sticky',
        top: 0,
        zIndex: 2,
      },
    },
  },
});

export const headerCellRecipe = recipe({
  base: {
    boxSizing: 'border-box',
    padding: `0 ${vars.spacing.md}`,
    height: rowHeightVar,
    fontWeight: vars.typography.fontWeight.semibold,
    color: vars.colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    userSelect: 'none',
    position: 'relative',
    background: vars.colors.surface.default,
  },
  variants: {
    align: {
      left: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      right: { justifyContent: 'flex-end' },
    },
    sortable: {
      true: {
        cursor: 'pointer',
        selectors: {
          '&:hover': { background: vars.colors.surface.hover },
          '&:focus-visible': {
            outline: `2px solid ${vars.colors.border.focus}`,
            outlineOffset: '-2px',
          },
        },
      },
    },
    sticky: {
      true: {
        position: 'sticky',
        left: 0,
        zIndex: 3,
        boxShadow: `1px 0 0 0 ${vars.colors.border.default}`,
      },
    },
    selectColumn: {
      true: {
        padding: `0 ${vars.spacing.sm}`,
        justifyContent: 'center',
      },
    },
  },
});

export const headerCellInnerStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  flex: 1,
  minWidth: 0,
});

export const sortIndicatorRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px',
    flexShrink: 0,
    color: vars.colors.text.muted,
    transition: `color ${vars.transitions.fast}, opacity ${vars.transitions.fast}`,
    opacity: 0.5,
  },
  variants: {
    active: {
      true: {
        color: vars.colors.accent.primary,
        opacity: 1,
      },
    },
  },
});

export const resizeHandleStyle = style({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '6px',
  height: '100%',
  cursor: 'col-resize',
  userSelect: 'none',
  touchAction: 'none',
  background: 'transparent',
  zIndex: 5,
  selectors: {
    '&:hover, &[data-resizing="true"]': {
      background: vars.colors.accent.primary,
    },
  },
});

/** Body wrapper. */
export const bodyStyle = style({});

/** In virtual mode the body is sized to the total virtualized height. */
export const virtualBodyStyle = style({
  position: 'relative',
  height: totalHeightVar,
});

/** Each row is its own horizontal grid so columns line up with the header. */
export const rowRecipe = recipe({
  base: {
    display: 'grid',
    gridTemplateColumns: gridTemplateColumnsVar,
    transition: `background-color ${vars.transitions.fast}`,
    background: vars.colors.background.primary,
  },
  variants: {
    virtualized: {
      true: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
      },
    },
    interactive: {
      true: {
        cursor: 'pointer',
        selectors: {
          '&:hover': { background: vars.colors.surface.hover },
        },
      },
    },
    selected: {
      true: {
        background: `color-mix(in srgb, ${vars.colors.accent.primary} 10%, ${vars.colors.background.primary})`,
        selectors: {
          '&:hover': {
            background: `color-mix(in srgb, ${vars.colors.accent.primary} 18%, ${vars.colors.background.primary})`,
          },
        },
      },
    },
    active: {
      true: {
        outline: `2px solid ${vars.colors.border.focus}`,
        outlineOffset: '-2px',
      },
    },
  },
});

export const cellRecipe = recipe({
  base: {
    boxSizing: 'border-box',
    padding: `0 ${vars.spacing.md}`,
    height: rowHeightVar,
    borderBottom: `1px solid ${vars.colors.border.default}`,
    color: vars.colors.text.secondary,
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    background: 'inherit',
  },
  variants: {
    align: {
      left: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      right: { justifyContent: 'flex-end' },
    },
    sticky: {
      true: {
        position: 'sticky',
        left: 0,
        zIndex: 1,
        boxShadow: `1px 0 0 0 ${vars.colors.border.default}`,
        background: 'inherit',
      },
    },
    selectColumn: {
      true: {
        padding: `0 ${vars.spacing.sm}`,
        justifyContent: 'center',
      },
    },
  },
});

export const emptyStateStyle = style({
  padding: vars.spacing.xl,
  textAlign: 'center',
  color: vars.colors.text.muted,
  fontSize: vars.typography.fontSize.sm,
});

export const skeletonRowStyle = style({
  display: 'grid',
  gridTemplateColumns: gridTemplateColumnsVar,
});

export const skeletonCellStyle = style({
  boxSizing: 'border-box',
  padding: `0 ${vars.spacing.md}`,
  height: rowHeightVar,
  borderBottom: `1px solid ${vars.colors.border.default}`,
  display: 'flex',
  alignItems: 'center',
});

export const skeletonBarStyle = style({
  display: 'block',
  height: '12px',
  width: '70%',
  borderRadius: vars.borderRadius.sm,
  background: vars.colors.surface.hover,
  animation: `${skeletonPulseKeyframe} 1.4s ease-in-out infinite`,
});
