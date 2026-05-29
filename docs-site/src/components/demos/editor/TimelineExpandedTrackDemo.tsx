import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import { Timeline, type TimelineTrack } from '@/components/editor/Timeline';

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
    id: 'pos.x',
    label: 'Position X',
    expanded: true,
    valueRange: [-100, 100],
    keyframes: [
      kf('a', 0, -80),
      kf('b', 20, 80),
      kf('c', 40, -40),
      kf('d', 60, 60),
      kf('e', 80, 0),
    ],
  },
  {
    id: 'pos.y',
    label: 'Position Y',
    color: '#e0a64b',
    keyframes: [kf('y1', 0, 0), kf('y2', 40, 30), kf('y3', 80, 0)],
  },
  {
    id: 'opacity',
    label: 'Opacity',
    color: '#5bbf7b',
    keyframes: [kf('o1', 0, 1), kf('o2', 60, 0.4)],
  },
];

export default function TimelineExpandedTrackDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [frame, setFrame] = useState(20);

  return (
    <DemoWrapper height="300px">
      <div style={{ height: '100%' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={80}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
        />
      </div>
    </DemoWrapper>
  );
}
