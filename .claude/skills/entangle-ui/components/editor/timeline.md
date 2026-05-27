# Timeline

> Horizontal multi-track animation timeline / dope sheet. Frame-based time axis, keyframes (shared CurveEditor model), a scrubbing playhead, zoom/pan, snap-to-frame, and full keyframe editing on a perf-isolated canvas.

A horizontal, multi-track **animation timeline / dope sheet** for editor UIs. Each track is an animated property whose keyframes (the shared `CurveKeyframe` model, reused from `CurveEditor`) lie along a frame-based time axis. A playhead scrubs across all tracks; the view zooms and pans over time. Keyframes render on a perf-isolated canvas while chrome stays in the DOM.

:::caution[In active development]
Timeline is being built incrementally on the `etui-timeline` branch. **Working now:** rendering (ruler, tracks, keyframes, playhead), scrubbing, zoom/pan, selection (click / shift / box-select), drag-move, add/delete, keyboard, and the imperative handle. **Still landing:** the track-header column + `Timeline.Toolbar`/`Timeline.Footer` slots, the built-in playback loop, and graph (curve) mode.
:::

**Live Preview**

## Import

```tsx
import { Timeline } from 'entangle-ui';
import type { TimelineTrack, TimelineHandle, TimelineView } from 'entangle-ui';
```

## Basic usage

`tracks` is controlled — hold the data yourself and update it from
`onTracksChange` (continuous, during a drag) and/or `onTracksChangeComplete`
(commit, for an undo stack). The playhead `frame` and the visible `view` are
each controlled or uncontrolled.

```tsx
import { useState } from 'react';
import { Timeline, type TimelineTrack } from 'entangle-ui';

const kf = (id: string, x: number, y: number) => ({
  id,
  x, // frame
  y, // value
  handleIn: { x: 0, y: 0 },
  handleOut: { x: 0, y: 0 },
  tangentMode: 'auto' as const,
});

function Editor() {
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    {
      id: 'opacity',
      label: 'Opacity',
      keyframes: [kf('a', 0, 1), kf('b', 48, 0)],
    },
  ]);
  const [frame, setFrame] = useState(0);

  return (
    <div style={{ height: 320 }}>
      <Timeline
        tracks={tracks}
        onTracksChange={setTracks}
        endFrame={72}
        fps={24}
        frame={frame}
        onFrameChange={setFrame}
      />
    </div>
  );
}
```

The timeline fills its parent when `responsive` (the default), so give the
wrapper a height — or pass a fixed `height={number}`.

## Interactions

| Gesture                                  | Action                                               |
| ---------------------------------------- | ---------------------------------------------------- |
| Drag / click the ruler (or the playhead) | Scrub the playhead (snaps to frame)                  |
| Click a keyframe                         | Select it                                            |
| Shift / Ctrl + click                     | Add / toggle in the selection                        |
| Drag on empty space                      | Box-select across tracks                             |
| Drag a selected keyframe                 | Move keyframes (snapped, clamped to range)           |
| Double-click empty space                 | Add a keyframe on that track                         |
| Delete / Backspace                       | Remove the selected keyframes                        |
| Wheel                                    | Zoom the time axis around the cursor                 |
| Shift + wheel / middle-drag              | Pan the time axis                                    |
| ← / → (Shift = ×10)                      | Step the playhead; Home / End jump to the range ends |

Hold **Ctrl** while dragging to momentarily disable snap-to-frame.

## Imperative handle

Pass a `ref` to drive the timeline programmatically:

```tsx
const ref = useRef<TimelineHandle>(null);

ref.current?.seek(48);
ref.current?.play();
ref.current?.zoomToSelection();
const x = ref.current?.frameToX(48); // frame → track-area pixel
```

`seek` · `play` / `pause` / `toggle` · `getFrame` · `zoomToFit(paddingFrames?)` ·
`zoomToSelection` · `getView` · `frameToX` / `xToFrame` · `focus` / `getElement`.

## Time domain

Time is expressed in **frames** with an `fps` prop that drives the
`HH:MM:SS:FF` ruler timecode and the snap grid. The global range is
`startFrame`..`endFrame`; the visible window is the `view`
(`{ startFrame, endFrame }`), bounded by `minFramesVisible` / `maxFramesVisible`.

## Custom canvas overlay

`renderOverlay` runs after the built-in content (and before the playhead),
receiving the 2D context plus the same `frameToX` / `xToFrame` math the
component uses — draw loop regions, markers, or annotations aligned to the
time axis.

```tsx
<Timeline
  tracks={tracks}
  endFrame={72}
  renderOverlay={(ctx, info) => {
    const x = info.frameToX(36);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, 0, info.frameToX(48) - x, info.size.height);
  }}
/>
```
