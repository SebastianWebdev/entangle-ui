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
    blocked: {
      // Drag / resize collision with another group — show a rejection
      // outline so the user sees why the gesture won't commit.
      true: {
        border: `2px dashed ${vars.colors.accent.error}`,
        boxShadow: `0 0 0 1px ${vars.colors.accent.error}66`,
      },
      false: {},
    },
  },
  defaultVariants: { selected: false, dragging: false, blocked: false },
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

/**
 * Floating "tab" attached to the top edge of a group — carries the
 * editable label, the colour swatch, and (when picking) the hidden
 * native colour input. Pointer events flow normally so the consumer can
 * interact with the controls; the parent overlay stops body drag from
 * starting on pointerdown inside the bar.
 */
export const groupLabelBarStyle = style({
  position: 'absolute',
  top: -26,
  left: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 22,
  paddingLeft: 8,
  paddingRight: 4,
  background: vars.colors.background.elevated,
  border: `1px solid ${vars.colors.border.default}`,
  borderRadius: vars.borderRadius.sm,
  fontSize: vars.typography.fontSize.xs,
  color: vars.colors.text.primary,
  fontFamily: vars.typography.fontFamily.sans,
  fontWeight: vars.typography.fontWeight.medium,
  lineHeight: vars.typography.lineHeight.tight,
  pointerEvents: 'auto',
});

/** Label text inside the bar — double-click to edit. */
export const groupLabelStyle = style({
  whiteSpace: 'nowrap',
  cursor: 'text',
  userSelect: 'none',
  maxWidth: 240,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

/**
 * Inline editor — replaces the label span while editing. Visually flush
 * with the surrounding bar so the swap doesn't shift other controls.
 */
export const groupLabelInputStyle = style({
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSize.xs,
  fontFamily: vars.typography.fontFamily.sans,
  fontWeight: vars.typography.fontWeight.medium,
  padding: 0,
  margin: 0,
  width: 160,
  selectors: {
    '&::-webkit-search-cancel-button': { display: 'none' },
  },
});

/** Visible colour swatch — clicking it opens the hidden native picker. */
export const groupColorSwatchStyle = style({
  display: 'inline-block',
  width: 14,
  height: 14,
  borderRadius: 3,
  border: `1px solid ${vars.colors.border.default}`,
  background: 'currentColor',
  padding: 0,
  cursor: 'pointer',
  flexShrink: 0,
  transition: `transform ${vars.transitions.fast}, border-color ${vars.transitions.fast}`,
  selectors: {
    '&:hover': {
      transform: 'scale(1.1)',
      borderColor: vars.colors.accent.primary,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.accent.primary}`,
      outlineOffset: 1,
    },
  },
});

/**
 * Class applied to the `<Minimap>` rendered by `<NodeGraph.Minimap>`.
 * `ViewportMinimap` already pins the minimap to a corner via its own
 * absolutely-positioned wrapper, so this must NOT set `position` — an extra
 * `position: absolute` here would pull the minimap out of that wrapper's flow,
 * collapsing the wrapper to a zero-size box and pushing the minimap off-screen.
 * It only re-enables pointer events (the overlay layer disables them).
 */
export const minimapSlotStyle = style({
  pointerEvents: 'auto',
});

/**
 * Floating toolbar — `<NodeGraph.Toolbar>`. Anchored to a viewport
 * corner, ignores pan / zoom (`pointer-events: auto` so clicks don't
 * fall through to the graph below). Margin and gap are controlled
 * inline by the component.
 */
export const nodeGraphToolbarRecipe = recipe({
  base: {
    position: 'absolute',
    display: 'inline-flex',
    alignItems: 'center',
    padding: `2px ${vars.spacing.xs}`,
    background: vars.colors.background.elevated,
    border: `1px solid ${vars.colors.border.default}`,
    borderRadius: vars.borderRadius.md,
    boxShadow: vars.shadows.md,
    pointerEvents: 'auto',
    zIndex: 5,
  },
  variants: {
    placement: {
      'top-left': { top: 0, left: 0 },
      'top-right': { top: 0, right: 0 },
      'bottom-left': { bottom: 0, left: 0 },
      'bottom-right': { bottom: 0, right: 0 },
    },
  },
  defaultVariants: { placement: 'top-left' },
});

/** Vertical / horizontal separator dropped between toolbar groups. */
export const nodeGraphToolbarSeparatorStyle = style({
  background: vars.colors.border.default,
  flexShrink: 0,
  marginInline: 2,
});

/**
 * Themed default body for nodes — `<NodeGraph.NodeBody>`. Picks up an
 * optional CSS-variable accent so the consumer can theme per category
 * without re-styling the whole recipe. Selected / hovered variants
 * sandwich a soft glow + accent border on top of the resting panel.
 */
export const nodeBodyRecipe = recipe({
  base: {
    width: 'max-content',
    minWidth: 160,
    background: vars.colors.background.elevated,
    borderRadius: vars.borderRadius.md,
    border: `1px solid ${vars.colors.border.default}`,
    boxShadow: vars.shadows.md,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    color: vars.colors.text.primary,
    fontFamily: vars.typography.fontFamily.sans,
    fontSize: vars.typography.fontSize.sm,
    transition: `border-color ${vars.transitions.fast}, box-shadow ${vars.transitions.fast}`,
  },
  variants: {
    variant: {
      // Standard panel — soft surface with elevation shadow.
      panel: {},
      // Flat — no shadow, single border, denser.
      flat: { boxShadow: 'none' },
      // Minimal — transparent body, just the chrome around content.
      minimal: { background: 'transparent', boxShadow: 'none' },
    },
    selected: {
      true: {
        borderColor: `var(--etui-ng-accent, ${vars.colors.accent.primary})`,
        boxShadow: `0 0 0 1px var(--etui-ng-accent, ${vars.colors.accent.primary}), ${vars.shadows.lg}`,
      },
      false: {},
    },
    hovered: {
      true: { borderColor: vars.colors.border.focus },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'panel',
    selected: false,
    hovered: false,
  },
});

/**
 * Header strip — `<NodeGraph.NodeHeader>`. Defaults to a tinted bar
 * using the accent variable; consumer can pass `background` to inject
 * a gradient. Padding mirrors the body's internal grid so left / right
 * pins line up with whatever's in the header.
 */
export const nodeHeaderStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px',
  background: `linear-gradient(90deg, color-mix(in srgb, var(--etui-ng-accent, ${vars.colors.accent.primary}) 65%, ${vars.colors.background.elevated}) 0%, color-mix(in srgb, var(--etui-ng-accent, ${vars.colors.accent.primary}) 40%, ${vars.colors.background.elevated}) 100%)`,
  borderBottom: `1px solid ${vars.colors.border.default}`,
  flexShrink: 0,
  minHeight: 28,
});

export const nodeHeaderIconStyle = style({
  width: 18,
  height: 18,
  borderRadius: 3,
  background: 'rgba(0, 0, 0, 0.3)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: vars.typography.fontSize.xs,
  fontWeight: vars.typography.fontWeight.semibold,
  color: 'rgba(255, 255, 255, 0.95)',
  flexShrink: 0,
});

export const nodeHeaderTextStyle = style({
  minWidth: 0,
  flex: 1,
});

export const nodeHeaderTitleStyle = style({
  fontSize: vars.typography.fontSize.sm,
  fontWeight: vars.typography.fontWeight.semibold,
  lineHeight: 1.15,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: 'rgba(255, 255, 255, 0.95)',
  textShadow: '0 1px 0 rgba(0, 0, 0, 0.5)',
});

export const nodeHeaderSubtitleStyle = style({
  fontSize: vars.typography.fontSize.xs,
  opacity: 0.75,
  lineHeight: 1.15,
  marginTop: 1,
  color: 'rgba(255, 255, 255, 0.85)',
});

/**
 * Pin list — `<NodeGraph.PinList>`. Two-column grid hosting the left /
 * right `<NodeGraph.PinRow>` children. `columnGap` is set inline by the
 * component so the consumer can override per-instance.
 */
export const pinListStyle = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
});

export const pinListColumnStyle = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

/**
 * Pin row — `<NodeGraph.PinRow>`. Side-aware justification so the port
 * lands at the proper edge of the node when the consumer drops it next
 * to a label.
 */
export const pinRowRecipe = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  variants: {
    side: {
      left: { justifyContent: 'flex-start' },
      right: { justifyContent: 'flex-end' },
      // Top/bottom rows are rare but supported — fall back to start.
      top: { justifyContent: 'flex-start' },
      bottom: { justifyContent: 'flex-start' },
    },
  },
});

// Ensure the underlying ViewportWorld passes through pointer events so nodes
// receive them. The ViewportWorld wrapper has pointer-events: none by default
// to let the background marquee pass through.
globalStyle(`${nodeGraphRootStyle} [data-viewport-world]`, {
  pointerEvents: 'none',
});
