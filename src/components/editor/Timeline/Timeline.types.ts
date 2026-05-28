import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import type { CurveData, CurveKeyframe } from '@/types/keyframe';
import type { ViewportSize } from '@/components/primitives/viewport';

// ─── Core model ───

/** Dope sheet (keyframe timing) or graph editor (value curves). */
export type TimelineMode = 'dope-sheet' | 'graph';

/** Pre/post-infinity behaviour, reused from the shared curve model. */
export type TimelineInfinity = {
  pre?: CurveData['preInfinity'];
  post?: CurveData['postInfinity'];
};

/**
 * One animated property. Keyframes use the shared `CurveKeyframe` model
 * (`x` = frame, `y` = value); graph mode assembles a `CurveData` per track
 * from `{ keyframes, domainX: [startFrame, endFrame], domainY: valueRange }`.
 */
export interface TimelineTrack {
  id: string;
  /** Display label in the header column. */
  label?: string;
  /** Keyframe / lane accent color (theme accent fallback). */
  color?: string;
  /** Keyframes — `x` is a frame, `y` is the value at that frame. */
  keyframes: CurveKeyframe[];
  /** Value range (graph-mode domainY). Auto-fit from keyframes when omitted. */
  valueRange?: [number, number];
  /** Pre/post-infinity behaviour for graph mode. */
  infinity?: TimelineInfinity;
  /** Visible but not editable. */
  locked?: boolean;
  /** Collapsed / not drawn. */
  hidden?: boolean;
  /** Expand this track into a graph (curve) lane regardless of the global mode. */
  expanded?: boolean;
  /** Group this track belongs to (matches a `TimelineGroup.id`). */
  groupId?: string;
  /** Row-height override (CSS px). */
  height?: number;
}

/** A collapsible group of tracks (matched by `TimelineTrack.groupId`). */
export interface TimelineGroup {
  id: string;
  label?: string;
  color?: string;
  collapsed?: boolean;
}

/** A reference to one keyframe on one track. */
export interface TimelineKeyframeRef {
  trackId: string;
  keyframeId: string;
}

/** Current keyframe selection, flat across tracks. */
export type TimelineSelection = ReadonlyArray<TimelineKeyframeRef>;

/** The visible frame window (zoom/pan over time). */
export interface TimelineView {
  startFrame: number;
  endFrame: number;
}

/** A loop sub-range, or `true` for the whole timeline range. */
export type TimelineLoop = boolean | { startFrame: number; endFrame: number };

// ─── Render info ───

/**
 * Helpers + current state passed to `renderOverlay`. Exposes the same
 * frame ↔ pixel math the built-in drawing uses, so consumer drawing stays
 * aligned with everything else.
 */
export interface TimelineDrawInfo {
  /** Track-area size in CSS pixels (canvas already DPR-scaled). */
  size: ViewportSize;
  /** Visible frame window. */
  view: TimelineView;
  /** Global frame range. */
  startFrame: number;
  endFrame: number;
  /** Frames per second. */
  fps: number;
  /** Current playhead frame. */
  frame: number;
  /** Map a frame to a track-area CSS-pixel X. */
  frameToX: (frame: number) => number;
  /** Inverse of `frameToX`. */
  xToFrame: (x: number) => number;
}

/** State passed to the `renderTrackHeader` render prop. */
export interface TimelineTrackHeaderInfo {
  /** Row index of the track. */
  index: number;
  /** Whether any of this track's keyframes are currently selected. */
  hasSelection: boolean;
}

// ─── Slot markers ───

/**
 * Symbol attached to `Timeline.Toolbar` / `.Footer` so the parent
 * `<Timeline>` can identify slot children without relying on `displayName`
 * (clobbered by `React.memo` / Vanilla Extract recipes).
 */
export const TIMELINE_SLOT: unique symbol = Symbol.for('etui.timeline.slot');

export type TimelineSlotKind = 'toolbar' | 'footer' | 'minimap';

export interface TimelineSlotMarker {
  [TIMELINE_SLOT]: TimelineSlotKind;
}

// ─── Imperative handle ───

/**
 * Imperative handle exposed via `ref` on `<Timeline>`. Stable for the
 * lifetime of the component.
 */
export interface TimelineHandle {
  /** Focus the timeline body so keyboard navigation starts working. */
  focus(): void;
  /** Access the underlying body DOM element. */
  getElement(): HTMLDivElement | null;
  /** Move the playhead to a frame (snapped + clamped). */
  seek(frame: number): void;
  /** Start playback. */
  play(): void;
  /** Pause playback. */
  pause(): void;
  /** Toggle playback. */
  toggle(): void;
  /** Current playhead frame. */
  getFrame(): number;
  /** Fit the view to the whole frame range, with optional padding (frames). */
  zoomToFit(paddingFrames?: number): void;
  /** Fit the view to the current selection. No-op when nothing is selected. */
  zoomToSelection(): void;
  /** Current visible frame window. */
  getView(): TimelineView;
  /** Set the visible frame window (clamped to bounds + minFramesVisible). */
  setView(view: TimelineView): void;
  /** Map a frame to a track-area CSS-pixel X. */
  frameToX(frame: number): number;
  /** Inverse of `frameToX`. */
  xToFrame(x: number): number;
}

// ─── Props ───

export interface TimelineBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onChange' | 'ref'
> {
  /** Tracks rendered top-to-bottom. */
  tracks: ReadonlyArray<TimelineTrack>;
  /** Fires continuously during keyframe drag. */
  onTracksChange?: (tracks: TimelineTrack[]) => void;
  /** Fires once on commit (drag end, add, delete) — use for undo integration. */
  onTracksChangeComplete?: (tracks: TimelineTrack[]) => void;

  /** First frame of the global range. @default 0 */
  startFrame?: number;
  /** Last frame of the global range (the duration). */
  endFrame: number;
  /** Frames per second — drives timecode display + the snap grid. @default 30 */
  fps?: number;

  /** Playhead frame (controlled). */
  frame?: number;
  /** Initial playhead frame (uncontrolled). @default startFrame */
  defaultFrame?: number;
  /** Fires continuously while scrubbing. */
  onFrameChange?: (frame: number) => void;
  /** Fires once on scrub end. */
  onFrameChangeComplete?: (frame: number) => void;

  /** Visible frame window (controlled). */
  view?: TimelineView;
  /** Initial visible frame window (uncontrolled). @default whole range */
  defaultView?: TimelineView;
  /** Fires when the view zooms/pans. */
  onViewChange?: (view: TimelineView) => void;
  /** Minimum frames visible (max zoom-in). @default 1 */
  minFramesVisible?: number;
  /** Maximum frames visible (max zoom-out). @default range span */
  maxFramesVisible?: number;

  /** Keyframe selection (controlled). */
  selection?: TimelineSelection;
  /** Initial selection (uncontrolled). @default [] */
  defaultSelection?: TimelineSelection;
  /** Fires when the selection changes. */
  onSelectionChange?: (selection: TimelineSelection) => void;

  /** Master editing switch. @default true */
  editable?: boolean;
  /** Allow double-click to add keyframes. @default true */
  allowAddKeyframe?: boolean;
  /** Allow Delete/Backspace to remove keyframes. @default true */
  allowDeleteKeyframe?: boolean;
  /** Snap-to-frame: `true` = 1 frame, number = N-frame grid, `false` = off. @default true */
  snap?: boolean | number;
  /** Minimum frame distance between keyframes on a track. @default 0 */
  minKeyframeDistance?: number;

  /** Editor mode (controlled). */
  mode?: TimelineMode;
  /** Initial mode (uncontrolled). @default 'dope-sheet' */
  defaultMode?: TimelineMode;
  /** Fires when the mode toggles. */
  onModeChange?: (mode: TimelineMode) => void;

  /** Playback running (controlled). */
  playing?: boolean;
  /** Initial playback state (uncontrolled). @default false */
  defaultPlaying?: boolean;
  /** Fires when playback starts/stops. */
  onPlayingChange?: (playing: boolean) => void;
  /** Loop the whole range (`true`) or a sub-range (controlled). @default false */
  loop?: TimelineLoop;
  /** Initial loop (uncontrolled). */
  defaultLoop?: TimelineLoop;
  /** Fires when the loop region is dragged on the ruler. */
  onLoopChange?: (loop: TimelineLoop) => void;

  /** Track groups (collapsible). Tracks join a group via `groupId`. */
  groups?: ReadonlyArray<TimelineGroup>;
  /** Fires when a group is collapsed / expanded via its header. */
  onGroupsChange?: (groups: TimelineGroup[]) => void;

  /** Default row height in CSS px. @default 28 */
  trackHeight?: number;
  /** Row height for a graph-expanded track in CSS px. @default 96 */
  expandedTrackHeight?: number;
  /** Group header row height in CSS px. @default 22 */
  groupHeaderHeight?: number;
  /** Show the time ruler. @default true */
  showRuler?: boolean;
  /** Show the playhead. @default true */
  showPlayhead?: boolean;
  /** Width of the left track-header column in CSS px. @default 160 */
  trackHeaderWidth?: number;
  /** Fill the parent container (ResizeObserver). @default true */
  responsive?: boolean;
  /** Fixed height in CSS px (ignored when `responsive`). */
  height?: number;

  /** Playhead line color. Defaults to theme accent. */
  playheadColor?: string;
  /** Background color. Defaults to theme `--etui-color-bg-secondary`. */
  backgroundColor?: string;

  /** Custom canvas pass, drawn after built-in content, before the playhead. */
  renderOverlay?: (
    ctx: CanvasRenderingContext2D,
    info: TimelineDrawInfo
  ) => void;
  /** Custom track-header renderer. Falls back to a built-in header. */
  renderTrackHeader?: (
    track: TimelineTrack,
    info: TimelineTrackHeaderInfo
  ) => React.ReactNode;
  /** Ruler label formatter. Defaults to `HH:MM:SS:FF` timecode. */
  formatTime?: (frame: number, fps: number) => string;

  /** @default 'Timeline' */
  ariaLabel?: string;

  /**
   * Slot children: `<Timeline.Toolbar>`, `<Timeline.Footer>`. Unrecognised
   * children render as a free-form overlay layer.
   */
  children?: React.ReactNode;

  /** Imperative handle. */
  ref?: React.Ref<TimelineHandle>;
}

export type TimelineProps = Prettify<TimelineBaseProps>;

// ─── Subcomponent props ───

export interface TimelineToolbarProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface TimelineFooterProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface TimelineMinimapProps {
  /**
   * Tracks to summarize as keyframe markers in the minimap.
   * Pass the same array you pass to `<Timeline tracks={...} />`.
   */
  tracks: ReadonlyArray<TimelineTrack>;
  /** Strip height in CSS px. @default 40 */
  height?: number;
  /** Override the keyframe marker color. */
  markerColor?: string;
  /** Override the viewport rectangle color. */
  viewportColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Context value ───

/**
 * Live state available to children of a `<Timeline>` via
 * `useTimelineContext()`. Prefer the per-slice hooks for perf-conscious
 * consumers — each subscribes to a single slice.
 */
export interface TimelineContextValue {
  view: TimelineView;
  size: ViewportSize;
  startFrame: number;
  endFrame: number;
  fps: number;
  frame: number;
  playing: boolean;
  mode: TimelineMode;
  selection: TimelineSelection;
  frameToX: (frame: number) => number;
  xToFrame: (x: number) => number;
}
