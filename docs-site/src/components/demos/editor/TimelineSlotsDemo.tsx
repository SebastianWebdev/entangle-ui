import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Timeline,
  framesToTimecode,
  type TimelineTrack,
} from '@/components/editor/Timeline';
import { Button } from '@/components/primitives/Button';

const kf = (
  id: string,
  x: number,
  y = 0
): TimelineTrack['keyframes'][number] => ({
  id,
  x,
  y,
  handleIn: { x: 0, y: 0 },
  handleOut: { x: 0, y: 0 },
  tangentMode: 'auto',
});

const TRACKS: TimelineTrack[] = [
  {
    id: 'cam.zoom',
    label: 'Camera Zoom',
    keyframes: [kf('a', 0), kf('b', 36), kf('c', 72)],
  },
  {
    id: 'cam.pan',
    label: 'Camera Pan',
    color: '#e0a64b',
    keyframes: [kf('d', 12), kf('e', 60)],
  },
];

const FPS = 30;

export default function TimelineSlotsDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <DemoWrapper height="280px">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={90}
          fps={FPS}
          frame={frame}
          onFrameChange={setFrame}
          playing={playing}
          onPlayingChange={setPlaying}
        >
          <Timeline.Toolbar>
            <Button size="sm" onClick={() => setPlaying(p => !p)}>
              {playing ? '⏸ Pause' : '▶ Play'}
            </Button>
            <Button size="sm" variant="outlined" onClick={() => setFrame(0)}>
              ⏮ Start
            </Button>
            <Button size="sm" variant="outlined" onClick={() => setFrame(90)}>
              ⏭ End
            </Button>
          </Timeline.Toolbar>
          <Timeline.Footer>
            <span style={{ fontFamily: 'var(--etui-font-family-mono)' }}>
              {framesToTimecode(frame, FPS)}
            </span>
            <span style={{ marginLeft: 12, opacity: 0.6 }}>
              {tracks.reduce((n, t) => n + t.keyframes.length, 0)} keyframes
              across {tracks.length} tracks
            </span>
          </Timeline.Footer>
        </Timeline>
      </div>
    </DemoWrapper>
  );
}
