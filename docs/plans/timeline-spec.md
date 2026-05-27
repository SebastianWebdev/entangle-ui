# Timeline — Component Spec (flagship, pre-1.0 Stage 1)

> Sign-off artifact for the Timeline flagship component. Implementation
> lands as one PR on `etui-timeline` (PR #84). This is the source of truth
> for the API surface, architecture, and v1 scope agreed in the planning
> session. Where reality diverges from this doc during the build, update
> this doc in the same commit.

## Decisions log (planning session)

| # | Decision | Choice |
| - | -------- | ------ |
| 1 | Track content model | **Keyframes (dope sheet)** — no clips/ranges in v1 |
| 2 | Relationship to CurveEditor | **Share keyframe model + graph mode** |
| 3 | Rendering | **Hybrid: canvas keyframes + DOM chrome** |
| 4 | Time domain | **Frames + fps** |
| 5 | Internal architecture | **Canvas hooks + 1D time store** (not the Viewport component) |
| 6 | Graph mode in v1 | **Yes — dope sheet AND graph both ship in v1** |
| 7 | Playback | **Optional built-in rAF loop**, `frame` stays controllable |
| 8 | Track headers | **Data-driven default + `renderTrackHeader` override** |

## What Timeline is

A horizontal, multi-track animation timeline / dope sheet for editor UIs
(3D tools, parameter systems). Each track is an animated property whose
keyframes lie along a shared time axis (frames). A playhead scrubs across
all tracks. The view zooms/pans over time. A global mode toggle switches
between the dope sheet (keyframe timing) and a graph editor (value curves
with bezier tangents), reusing the existing CurveEditor.

## Scope

**In v1:**

- Flat tracks (no groups/folders).
- Canvas-rendered keyframes; DOM chrome (ruler, headers, playhead label, toolbar/footer).
- Playhead + scrub (drag, click-to-jump, keyboard step).
- Time ruler: frame ticks + `HH:MM:SS:FF` timecode from `fps`.
- Zoom/pan over time (1D).
- Snap-to-frame (integer frames; Ctrl toggles off mid-drag).
- Keyframe selection: single, multi (Shift/Ctrl), box-select (across tracks).
- Drag-move keyframes (with snap); add (double-click empty) / delete (Delete/Backspace).
- Global `mode: 'dope-sheet' | 'graph'`. Graph mode renders each visible
  track's `CurveData` lane reusing CurveEditor curve + tangent rendering/interaction.
- Optional built-in playback loop (rAF advancing `frame` at `fps`), play/pause/loop.
- Imperative handle. A11y baseline (roles, keyboard, labels).

**Deferred (post-v1):**

- Track groups / folders / nesting.
- Track reorder (drag).
- Clips / ranges / segments (explicitly excluded per decision 1).
- Per-track expand-to-graph (v1 uses a global mode toggle).
- Loop-region drag UI, ripple edit, copy/paste keyframes.
- Row virtualization (add only if real track counts demand it — same
  `@tanstack/react-virtual` pattern as DataTable).
- Audio waveforms, onion-skin.

## Data model

Time is owned globally by the Timeline (`startFrame`..`endFrame`). Each
track owns its keyframes (the shared `CurveKeyframe`). Graph mode assembles
a `CurveData` per track from `{ keyframes, domainX: [startFrame, endFrame],
domainY: valueRange }` so `evaluateCurve()` is reused verbatim.

```ts
import type { CurveKeyframe, CurveData } from '@/types/keyframe'; // promoted shared module

interface TimelineTrack {
  id: string;
  label?: string;
  color?: string;                 // keyframe/lane accent (theme fallback)
  keyframes: CurveKeyframe[];     // x = frame, y = value
  valueRange?: [number, number];  // domainY for graph mode (auto-fit if omitted)
  infinity?: { pre?: CurveData['preInfinity']; post?: CurveData['postInfinity'] };
  locked?: boolean;               // visible but not editable
  hidden?: boolean;               // collapsed / not drawn
  height?: number;                // row-height override
}

type TimelineKeyframeRef = { trackId: string; keyframeId: string };
type TimelineSelection = ReadonlyArray<TimelineKeyframeRef>;

interface TimelineView { startFrame: number; endFrame: number } // visible window
```

## Public API — `<Timeline>`

`Omit<BaseComponent<HTMLDivElement>, 'onChange' | 'ref'>`, exported as
`Prettify<TimelineBaseProps>`, `ref?: React.Ref<TimelineHandle>`.

```ts
// data — controlled; continuous + commit (CurveEditor's onChange/onChangeComplete shape)
tracks: ReadonlyArray<TimelineTrack>;
onTracksChange?: (tracks: TimelineTrack[]) => void;          // during drag
onTracksChangeComplete?: (tracks: TimelineTrack[]) => void;  // commit → undo hook

// time domain (frames + fps)
startFrame?: number;   // default 0
endFrame: number;      // required (duration)
fps?: number;          // default 30 — timecode + snap grid

// playhead — controlled/uncontrolled (useControlledState)
frame?: number; defaultFrame?: number;
onFrameChange?: (f: number) => void;          // scrub continuous
onFrameChangeComplete?: (f: number) => void;

// view (1D time zoom/pan) — controlled/uncontrolled
view?: TimelineView; defaultView?: TimelineView; onViewChange?: (v: TimelineView) => void;
minFramesVisible?: number; maxFramesVisible?: number;        // zoom limits

// selection — controlled/uncontrolled
selection?: TimelineSelection; defaultSelection?: TimelineSelection;
onSelectionChange?: (s: TimelineSelection) => void;

// editing toggles (lifted from CurveEditor)
editable?: boolean;            // master switch, default true
allowAddKeyframe?: boolean; allowDeleteKeyframe?: boolean;
snap?: boolean | number;       // snap-to-frame, default true (1 frame)
minKeyframeDistance?: number; lockEndpoints?: boolean;

// mode
mode?: 'dope-sheet' | 'graph'; defaultMode?: 'dope-sheet' | 'graph';
onModeChange?: (m: 'dope-sheet' | 'graph') => void;

// playback (optional built-in loop)
playing?: boolean; defaultPlaying?: boolean; onPlayingChange?: (p: boolean) => void;
loop?: boolean | { startFrame: number; endFrame: number };

// visuals
trackHeight?: number;          // default row height
showRuler?: boolean; showPlayhead?: boolean;
trackHeaderWidth?: number; responsive?: boolean; height?: number;
playheadColor?: string; backgroundColor?: string; /* + theme overrides */

// custom render
renderOverlay?: (ctx: CanvasRenderingContext2D, info: TimelineDrawInfo) => void; // canvas pass
renderTrackHeader?: (track: TimelineTrack, info: TimelineTrackHeaderInfo) => React.ReactNode;
formatTime?: (frame: number, fps: number) => string;  // ruler label override (later)

// a11y + slots
ariaLabel?: string;
children?: React.ReactNode;    // Timeline.Toolbar / Timeline.Footer
```

## Slots (Symbol-based)

`TIMELINE_SLOT = Symbol.for('etui.timeline.slot')` (same pattern as
`MINIMAP_SLOT`). v1 slots:

- `<Timeline.Toolbar>` — transport (play/pause), mode toggle, zoom controls.
- `<Timeline.Footer>` — status bar (selected keyframe coords, current frame/timecode).

Track headers are a render prop (`renderTrackHeader`), not a slot, because
they are per-track and data-driven. Unrecognised children render as a
free-form overlay layer (Minimap behaviour).

## Imperative handle

```ts
interface TimelineHandle {
  focus(): void;
  getElement(): HTMLDivElement | null;
  seek(frame: number): void;
  play(): void; pause(): void; toggle(): void;
  getFrame(): number;
  zoomToFit(paddingFrames?: number): void;
  zoomToSelection(): void;
  getView(): TimelineView;
  frameToX(frame: number): number;   // time → CSS px (like worldToMinimap)
  xToFrame(x: number): number;       // inverse
}
```

## Interaction model

- **Scrub:** drag in ruler / on playhead; click ruler jumps playhead.
  Keyboard: ←/→ step ±1 frame, Shift = coarse (`largeStep`), Home/End to
  range ends (Slider keyboard model).
- **Zoom time:** wheel zooms around cursor X; clamped by
  `minFramesVisible`/`maxFramesVisible`.
- **Pan:** horizontal scroll / middle-drag (X-only).
- **Keyframes:** click select; Shift/Ctrl multi-select; box-select marquee
  (accumulates across tracks); drag-move with snap; double-click empty to
  add (if `allowAddKeyframe`); Delete/Backspace to remove (if `allowDeleteKeyframe`).
- **Graph mode:** each visible track renders its `CurveData` as a curve +
  tangent-handle lane; CurveEditor's curve/tangent interaction is reused.
- **Snap:** integer-frame by default; Ctrl toggles snap off mid-drag.

## Internal architecture

Mirrors `editor/Minimap`. No Viewport component — a 1D time transform plus
vertical track scroll.

```
src/components/editor/Timeline/
├── Timeline.tsx              // main component, slot categorisation, render tree
├── Timeline.types.ts         // public types, handle, slot markers (Symbol)
├── Timeline.css.ts           // Vanilla Extract recipe + vars
├── TimelineStore.ts          // class store: per-slice subscribe/get + handle impl
│                             //   slices: view/geometry, playhead, selection, drag, hover
├── TimelineContext.ts        // context + per-slice hooks (useTimelineView, ...Selection, ...)
├── useTimelineGestures.ts    // pointer/keyboard handlers → store methods
├── useTimelinePlayback.ts    // optional rAF clock advancing frame at fps
├── timelineCoords.ts         // pure math: frame ↔ x, y ↔ track row
├── timelineDrawing.ts        // pure draw: ruler, rows, keyframes, playhead, graph lanes
├── timelineHitTest.ts        // pure: point → { kind, trackId, keyframeId }
├── TimelineToolbar.tsx       // Timeline.Toolbar slot
├── TimelineFooter.tsx        // Timeline.Footer slot
└── index.ts                  // compound assembly + exports
```

- **Time transform** in the store: `{ offsetFrame, framesPerPixel }`
  (mirrored from `view` prop via `useLayoutEffect`).
- **Canvas template:** single `scheduleDraw` in rAF, theme colors resolved
  per-frame (`resolveVarValue`), `useCanvasSetup` for DPR + responsive
  sizing, `useLayoutEffect` for the draw to avoid blank-canvas flash.
- **State via store + `useSyncExternalStore`** for pointer-move / drag /
  playback updates; React state only for the controlled prop mirror.
- **`useLatest`** for `render*` and `on*` callbacks so inline closures
  don't invalidate the draw loop.
- **Handle** via React 19 ref-as-prop + `useImperativeHandle`.

## Graph mode specifics (v1)

- Global toggle (`mode`). In `'graph'`, the keyframe rows are replaced by
  value-curve lanes; each visible track maps to a `CurveData`
  (`domainX = [startFrame, endFrame]`, `domainY = valueRange ?? auto-fit`).
- Reuse CurveEditor's curve sampling + tangent-handle drawing/interaction.
  Extract the shared drawing/interaction into reusable units if they are
  currently private to CurveEditor; otherwise call through.
- Tangent editing obeys `editable` / track `locked`.

## Playback specifics (v1)

- `useTimelinePlayback` runs a rAF loop when `playing` is true, advancing
  `frame` by `fps`-scaled delta time (wall-clock based, not per-frame
  count, so it stays real-time under dropped frames).
- Honors `loop` (boolean → whole range; object → sub-range).
- `frame` remains controllable: when controlled, the loop calls
  `onFrameChange`; the consumer can override for external sync.
- Respects `prefers-reduced-motion`? No — playback is user-intent, not
  decorative motion. (Decorative transitions elsewhere still honor it.)

## Locked details

1. **Shared types** — promote `CurveKeyframe` / `CurveData` / `TangentMode`
   from `CurveEditor.types.ts` into `src/types/keyframe.ts`; CurveEditor
   re-exports them so its public API is unchanged.
2. **Stable ids** — Timeline normalizes incoming keyframes to guaranteed
   ids (cross-track selection + drag need them), as CurveEditor does internally.
3. **Selection** — flat `{ trackId, keyframeId }[]`; box-select accumulates.
4. **Ruler** — frame ticks + `HH:MM:SS:FF` timecode from `fps`;
   `formatTime?` override.
5. **Snap** — integer-frame default; Ctrl toggles off mid-drag.

## Edge cases

- Empty `tracks` → ruler + playhead still render; empty-state message in body.
- `endFrame <= startFrame` → clamp to a 1-frame minimum range; warn in dev.
- Keyframe outside `[startFrame, endFrame]` → drawn clipped; not auto-removed.
- Duplicate keyframe ids within a track → normalize (regenerate) on input.
- `frame` outside range → clamp for the playhead; report clamped value.
- `view` wider than `[startFrame, endFrame]` → allowed (over-scroll padding), clamped by zoom limits.
- Locked/hidden tracks → excluded from hit-testing and edits; hidden also from draw.
- Controlled vs uncontrolled mismatch (e.g. `frame` + `defaultFrame`) → controlled wins, dev warning (useControlledState behaviour).

## Implementation phases (within the one PR)

Reviewable commits, in order:

1. **Shared keyframe module** — promote types, re-export from CurveEditor, no behaviour change.
2. **Types + store skeleton** — `Timeline.types.ts`, `TimelineStore.ts`, `timelineCoords.ts` (+ unit tests for coords/store).
3. **Static render** — `Timeline.tsx`, `timelineDrawing.ts`, ruler + rows + keyframes + playhead (dope sheet), `useCanvasSetup`/renderer wiring, css.
4. **Gestures** — `useTimelineGestures` + `timelineHitTest.ts`: scrub, zoom/pan, select, drag-move, add/delete, snap.
5. **Track headers + slots** — DOM header column, `renderTrackHeader`, `Timeline.Toolbar`, `Timeline.Footer`.
6. **Playback** — `useTimelinePlayback`, transport, loop.
7. **Graph mode** — curve lanes reusing CurveEditor; mode toggle.
8. **Handle + a11y** — imperative handle, roles/labels/keyboard matrix.
9. **Docs + changeset** — MDX docs page in `docs-site/`, `minor` changeset, exports from `editor/index.ts` + `src/index.ts`.

## Testing / docs / release

- Tests: `renderWithTheme`; blocks Rendering / Scrubbing / Zoom+Pan /
  Selection / Keyframe editing / Playback / Graph mode / Accessibility.
  Pure modules (`timelineCoords`, `timelineHitTest`, `TimelineStore`,
  `useTimelinePlayback`) get focused unit tests.
- Docs: MDX page under `docs-site/src/content/docs/components/` with live
  examples (dope sheet, graph mode, playback, custom header).
- Changeset: `minor` (`entangle-ui`) — new flagship. Never `major` on the
  pre-1.0 line.
