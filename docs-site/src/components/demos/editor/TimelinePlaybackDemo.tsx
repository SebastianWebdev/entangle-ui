import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Timeline,
  type TimelineLoop,
  type TimelineTrack,
} from '@/components/editor/Timeline';
import { Button } from '@/components/primitives/Button';

const kf = (
  id: string,
  x: number,
  y: number
): TimelineTrack['keyframes'][number] => ({
  id,
  x,
  y,
  handleIn: { x: -6, y: 0 },
  handleOut: { x: 6, y: 0 },
  tangentMode: 'auto',
});

const TRACKS: TimelineTrack[] = [
  {
    id: 'opacity',
    label: 'Opacity',
    valueRange: [0, 1],
    keyframes: [
      kf('a', 0, 1),
      kf('b', 30, 0.2),
      kf('c', 60, 1),
      kf('d', 90, 0.4),
    ],
  },
  {
    id: 'scale',
    label: 'Scale',
    color: '#e0a64b',
    valueRange: [0.5, 1.6],
    keyframes: [kf('e', 0, 1), kf('f', 45, 1.4), kf('g', 90, 1)],
  },
];

export default function TimelinePlaybackDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState<TimelineLoop>({
    startFrame: 20,
    endFrame: 80,
  });

  return (
    <DemoWrapper height="280px">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={120}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
          playing={playing}
          onPlayingChange={setPlaying}
          loop={loop}
          onLoopChange={setLoop}
        >
          <Timeline.Toolbar>
            <Button size="sm" onClick={() => setPlaying(p => !p)}>
              {playing ? 'Pause' : 'Play'}
            </Button>
            <Button size="sm" variant="outlined" onClick={() => setFrame(0)}>
              Rewind
            </Button>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => setLoop({ startFrame: 0, endFrame: 120 })}
            >
              Loop full
            </Button>
          </Timeline.Toolbar>
          <Timeline.Footer>
            Frame {Math.round(frame)} · loop{' '}
            {typeof loop === 'object' && loop
              ? `${loop.startFrame}–${loop.endFrame}`
              : 'off'}
          </Timeline.Footer>
        </Timeline>
      </div>
    </DemoWrapper>
  );
}
