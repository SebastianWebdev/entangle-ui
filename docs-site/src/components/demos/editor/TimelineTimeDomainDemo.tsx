import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Timeline, type TimelineTrack } from '@/components/editor/Timeline';
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
    id: 'audio',
    label: 'Audio cue',
    keyframes: [kf('a', 0), kf('b', 60), kf('c', 150), kf('d', 270)],
  },
  {
    id: 'caption',
    label: 'Caption',
    color: '#e0a64b',
    keyframes: [kf('e', 30), kf('f', 120), kf('g', 240)],
  },
];

function formatSeconds(frame: number, fps: number): string {
  const seconds = frame / fps;
  return `${seconds.toFixed(2)}s`;
}

function formatTimecode(frame: number, fps: number): string {
  const total = Math.floor(frame);
  const f = total % fps;
  const s = Math.floor(total / fps) % 60;
  const m = Math.floor(total / (fps * 60));
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${pad(m)}:${pad(s)}:${pad(f)}`;
}

export default function TimelineTimeDomainDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [frame, setFrame] = useState(0);
  const [useSeconds, setUseSeconds] = useState(false);
  const fps = 30;

  return (
    <DemoWrapper height="260px">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={300}
          fps={fps}
          frame={frame}
          onFrameChange={setFrame}
          formatTime={useSeconds ? formatSeconds : formatTimecode}
        >
          <Timeline.Toolbar>
            <Button
              size="sm"
              variant={useSeconds ? 'filled' : 'outlined'}
              onClick={() => setUseSeconds(s => !s)}
            >
              {useSeconds ? 'Showing seconds' : 'Showing MM:SS:FF'}
            </Button>
          </Timeline.Toolbar>
        </Timeline>
      </div>
    </DemoWrapper>
  );
}
