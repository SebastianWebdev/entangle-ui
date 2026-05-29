import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Timeline, type TimelineTrack } from '@/components/editor/Timeline';

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

const INITIAL: TimelineTrack[] = [
  {
    id: 'opacity',
    label: 'Opacity',
    keyframes: [kf('a', 0, 1), kf('b', 48, 0)],
  },
  {
    id: 'scale',
    label: 'Scale',
    color: '#e0a64b',
    keyframes: [kf('c', 0, 1), kf('d', 30, 1.5), kf('e', 60, 1)],
  },
];

export default function TimelineBasicDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(INITIAL);
  const [frame, setFrame] = useState(0);

  return (
    <DemoWrapper height="220px">
      <div style={{ height: '100%' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={72}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
        />
      </div>
    </DemoWrapper>
  );
}
