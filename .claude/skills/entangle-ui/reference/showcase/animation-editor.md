# Animation Editor

> A timeline-driven animation editor built around the Entangle UI Timeline — multi-track dope sheet / graph editor, a live 3D-CSS cube driven by the keyframe curves, scene tree, and frame-bound inspector.

A focused showcase built around the `Timeline` flagship: a multi-track
dope-sheet / graph editor with collapsible groups and a per-track
expand-to-graph lane, paired with a live 3D-CSS cube whose **position,
rotation, scale, hue, and opacity** are sampled from each track's curve at the
current frame. Drag a keyframe in the timeline and the cube responds. Hit play
and the whole scene animates in real time.

Built entirely from Entangle UI primitives — `AppShell`, `MenuBar`, `Toolbar`,
`SplitPane`, `PanelSurface`, `TreeView`, `Timeline`, `StatusBar`.

<a
  href="/showcase/animation-editor/"
  style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.6rem 1.2rem;background:#007acc;color:#fff;border-radius:6px;text-decoration:none;font-weight:500;font-size:0.95rem;margin-top:0.5rem;"
>
  Open Animation Editor ↗
</a>

## What to try

- **Hit play** in the top toolbar — the cube animates against its eight
  keyframed tracks (position X/Y/Z, rotation X/Y, scale, hue, opacity). The
  loop region spans the whole take.
- **Scrub the ruler** — drag the playhead and watch the inspector readouts
  update live; the cube tracks the curve at every frame.
- **Toggle the Material group** in the left header column — collapse the
  group to hide its tracks; the cube's hue / opacity keep playing.
- **Drag a keyframe** in the Position X lane (it's expanded by default, so
  it draws as a full curve lane) — moving a point in time or value re-animates
  the cube instantly.
- **Switch to Graph mode** with the toolbar's Dope / Graph buttons to see
  every track as a curve at once; tangent handles appear on the selected
  keyframe (try the keyboard ←/→ to step the playhead).
- **Box-select** across tracks (drag on empty space) — the status bar updates
  with the count.

## How it's wired up

The cube is a CSS-3D mesh whose transform is recomputed every render from
the live tracks:

```tsx
import { evaluateCurve } from 'entangle-ui';

function readCube(tracks: TimelineTrack[], frame: number): CubeState {
  const byId = new Map(tracks.map(t => [t.id, t]));
  const sample = (id: string): number =>
    evaluateCurve(
      {
        keyframes: byId.get(id)?.keyframes ?? [],
        domainX: [0, END_FRAME],
        domainY: byId.get(id)?.valueRange ?? [0, 1],
      },
      frame
    );

  return {
    px: sample('pos.x'),
    py: sample('pos.y'),
    pz: sample('pos.z'),
    rx: sample('rot.x'),
    ry: sample('rot.y'),
    scale: sample('scale'),
    hue: sample('mat.hue'),
    opacity: sample('mat.opacity'),
  };
}
```

The `Timeline`'s built-in playback loop advances `frame` at `fps`, and React's
render pulls a fresh `cube` for every frame through the `useMemo` above. No
imperative animation loop, no rAF — the timeline drives everything.

```tsx
<Timeline
  tracks={tracks}
  onTracksChange={setTracks}
  groups={groups}
  onGroupsChange={setGroups}
  endFrame={120}
  fps={30}
  frame={frame}
  onFrameChange={setFrame}
  playing={playing}
  onPlayingChange={setPlaying}
  loop={{ startFrame: 0, endFrame: 120 }}
/>
```

The full source lives at
`docs-site/src/components/demos/editor/AnimationEditorDemo.tsx` — under 500
lines for the whole editor.

## Compare to

- [Full Editor](/showcase/editor/) — a static 3D editor showcase (no animation
  timeline) focused on the property inspector / scene tree / shell composition.
