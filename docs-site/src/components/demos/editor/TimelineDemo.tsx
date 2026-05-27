import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Timeline, type TimelineTrack } from '@/components/editor/Timeline';

function kf(
  id: string,
  x: number,
  y: number
): TimelineTrack['keyframes'][number] {
  return {
    id,
    x,
    y,
    handleIn: { x: 0, y: 0 },
    handleOut: { x: 0, y: 0 },
    tangentMode: 'auto',
  };
}

const INITIAL_TRACKS: TimelineTrack[] = [
  {
    id: 'pos-x',
    label: 'Position X',
    keyframes: [kf('a', 0, 0), kf('b', 24, 120), kf('c', 60, 40)],
  },
  {
    id: 'pos-y',
    label: 'Position Y',
    color: '#e0a64b',
    keyframes: [kf('d', 0, 0), kf('e', 36, 80)],
  },
  {
    id: 'opacity',
    label: 'Opacity',
    color: '#5bbf7b',
    keyframes: [kf('f', 0, 1), kf('g', 48, 0), kf('h', 72, 1)],
  },
  {
    id: 'scale',
    label: 'Scale',
    keyframes: [kf('i', 12, 1), kf('j', 60, 2)],
  },
];

export default function TimelineDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(INITIAL_TRACKS);
  const [frame, setFrame] = useState(18);

  return (
    <DemoWrapper height="340px">
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            color: 'var(--etui-color-text-muted)',
            fontSize: 'var(--etui-font-size-sm)',
          }}
        >
          Frame {Math.round(frame)} — scrub the ruler, drag or box-select
          keyframes, double-click empty space to add, Delete to remove, wheel to
          zoom, shift+wheel / middle-drag to pan.
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Timeline
            tracks={tracks}
            onTracksChange={setTracks}
            endFrame={72}
            fps={24}
            frame={frame}
            onFrameChange={setFrame}
          />
        </div>
      </div>
    </DemoWrapper>
  );
}
