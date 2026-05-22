import { style, createVar, globalStyle } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/theme/contract.css';

export const nodeWidthVar = createVar();
export const nodeHeightVar = createVar();

/**
 * Root wrapper around the underlying `<Viewport>` — purely structural. The
 * cursor / focus / disabled visuals live on the Viewport itself.
 */
export const nodeGraphRootStyle = style({
  position: 'relative',
  width: '100%',
  height: '100%',
});

/**
 * Wrapper for a single node's HTML body. Positioned absolutely inside
 * `ViewportWorld`. When `autoSize` is `true` the wrapper has no width/height
 * — it sizes to its content and the library picks up the rendered size
 * via `ResizeObserver`. When the consumer sets `node.width`/`height`, the
 * inline CSS vars `nodeWidthVar` / `nodeHeightVar` take over.
 */
export const nodeWrapperRecipe = recipe({
  base: {
    position: 'absolute',
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    cursor: 'default',
    transition: `box-shadow ${vars.transitions.fast}`,
  },
  variants: {
    autoSize: {
      true: {
        // Node sizes to its body content. Consumer JSX decides dimensions.
        width: 'max-content',
        height: 'auto',
      },
      false: {
        // Library-controlled dimensions via inline CSS vars.
        width: nodeWidthVar,
        height: nodeHeightVar,
      },
    },
    draggable: {
      true: { cursor: 'grab' },
      false: {},
    },
    dragging: {
      true: { cursor: 'grabbing', userSelect: 'none' },
      false: {},
    },
    selectable: {
      true: {},
      false: { cursor: 'default' },
    },
  },
  defaultVariants: {
    autoSize: true,
    draggable: true,
    selectable: true,
    dragging: false,
  },
});

/**
 * Default node body when consumer doesn't pass `renderNode`. Acts as a
 * panel surface with a title row and content area.
 */
export const defaultNodeBodyRecipe = recipe({
  base: {
    width: '100%',
    height: '100%',
    background: vars.colors.background.secondary,
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.md,
    boxShadow: vars.shadows.sm,
    padding: vars.spacing.sm,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    color: vars.colors.text.primary,
    fontSize: vars.typography.fontSize.sm,
    fontFamily: vars.typography.fontFamily.sans,
    overflow: 'hidden',
    selectors: {
      '&[data-hovered="true"]': {
        borderColor: vars.colors.border.focus,
      },
    },
  },
  variants: {
    selected: {
      true: {
        borderColor: vars.colors.accent.primary,
        boxShadow: `0 0 0 1px ${vars.colors.accent.primary}, ${vars.shadows.md}`,
      },
      false: {},
    },
  },
  defaultVariants: {
    selected: false,
  },
});

/**
 * `<NodeGraph.Port>` slot — inline anchor rendered inside `renderNode`.
 *
 * The slot is the **single source of truth** for both the visual handle
 * and the geometry endpoint of the edge — hover scale uses
 * `transform-origin: center` so the center (= edge endpoint) doesn't
 * move when the user hovers. Sits inline‑flex by default; drop it next
 * to a label and it lines up automatically.
 */
export const portSlotRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: vars.colors.background.tertiary,
    border: `2px solid ${vars.colors.border.focus}`,
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    cursor: 'crosshair',
    verticalAlign: 'middle',
    transformOrigin: 'center',
    transition: `transform ${vars.transitions.fast}, background ${vars.transitions.fast}, border-color ${vars.transitions.fast}`,
    selectors: {
      '&:hover': {
        transform: 'scale(1.25)',
        background: vars.colors.accent.primary,
        borderColor: vars.colors.accent.primary,
      },
    },
  },
  variants: {
    // `side` is encoded as a data attribute / on the wrapper for consumer
    // CSS targeting; the visual itself is symmetric so no per-side style
    // override is needed at the default-chrome layer.
    side: {
      left: {},
      right: {},
      top: {},
      bottom: {},
    },
    source: {
      true: {
        background: vars.colors.accent.primary,
        borderColor: vars.colors.accent.primary,
        transform: 'scale(1.15)',
      },
      false: {},
    },
    candidate: {
      true: {
        transform: 'scale(1.4)',
        background: vars.colors.accent.primary,
        borderColor: vars.colors.accent.primary,
      },
      false: {},
    },
    invalid: {
      true: {
        background: vars.colors.accent.error,
        borderColor: vars.colors.accent.error,
      },
      false: {},
    },
    /**
     * When the consumer renders custom content via `children`, strip the
     * default circle chrome so the consumer fully owns the visual. The
     * slot wrapper still carries pointer events + measurement + ARIA.
     */
    custom: {
      true: {
        width: 'auto',
        height: 'auto',
        minWidth: 0,
        minHeight: 0,
        padding: 0,
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        cursor: 'crosshair',
        transition: 'none',
        selectors: {
          '&:hover': {
            transform: 'none',
            background: 'transparent',
            borderColor: 'transparent',
          },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    source: false,
    candidate: false,
    invalid: false,
    custom: false,
  },
});

/** Edge label wrapper — positioned at the midpoint of an edge. */
export const edgeLabelStyle = style({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  padding: `0 ${vars.spacing.xs}`,
  background: vars.colors.background.primary,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.sm,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.secondary,
  pointerEvents: 'auto',
  whiteSpace: 'nowrap',
});

/**
 * HTML overlay for an interactive group. Positioned absolutely in world
 * space; the visual fill / outline is drawn by the canvas layer beneath —
 * this overlay only carries pointer events and the resize handles.
 */
export const groupOverlayRecipe = recipe({
  base: {
    position: 'absolute',
    pointerEvents: 'auto',
    cursor: 'move',
    boxSizing: 'border-box',
    borderRadius: vars.borderRadius.sm,
    border: '2px solid transparent',
  },
  variants: {
    selected: {
      true: {
        border: `2px solid ${vars.colors.accent.primary}`,
        boxShadow: `0 0 0 1px ${vars.colors.accent.primary}66`,
      },
      false: {},
    },
    dragging: {
      true: { cursor: 'grabbing' },
      false: {},
    },
  },
  defaultVariants: { selected: false, dragging: false },
});

/** Tiny square handle drawn at each corner / edge midpoint when selected. */
export const groupResizeHandleStyle = style({
  position: 'absolute',
  width: 10,
  height: 10,
  background: vars.colors.accent.primary,
  border: `1px solid ${vars.colors.background.primary}`,
  borderRadius: 2,
  boxSizing: 'border-box',
  pointerEvents: 'auto',
  zIndex: 1,
});

/** Label centred above a group (top-edge tab). */
export const groupLabelStyle = style({
  position: 'absolute',
  top: -22,
  left: 8,
  background: vars.colors.background.elevated,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.sm,
  padding: `2px 8px`,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.primary,
  fontFamily: vars.typography.fontFamily.sans,
  fontWeight: vars.typography.fontWeight.medium,
  lineHeight: vars.typography.lineHeight.tight,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
});

/**
 * Slot wrapper used by `<NodeGraph.Minimap>` — pinned absolutely inside the
 * underlying `<Viewport>` overlay layer.
 */
export const minimapSlotStyle = style({
  position: 'absolute',
  pointerEvents: 'auto',
});

// Ensure the underlying ViewportWorld passes through pointer events so nodes
// receive them. The ViewportWorld wrapper has pointer-events: none by default
// to let the background marquee pass through.
globalStyle(`${nodeGraphRootStyle} [data-viewport-world]`, {
  pointerEvents: 'none',
});
