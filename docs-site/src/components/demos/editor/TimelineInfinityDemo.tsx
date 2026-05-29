import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Timeline,
  type TimelineInfinity,
  type TimelineTrack,
} from '@/components/editor/Timeline';

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

const baseInfinity: TimelineInfinity = { pre: 'cycle', post: 'oscillate' };

const TRACKS: TimelineTrack[] = [
  {
    id: 'wave',
    label: 'Cycle + Oscillate',
    expanded: true,
    valueRange: [-1, 1],
    infinity: baseInfinity,
    keyframes: [kf('a', 30, -1), kf('b', 50, 1)],
  },
  {
    id: 'flat',
    label: 'No infinity (constant)',
    expanded: true,
    color: '#e0a64b',
    valueRange: [0, 1],
    keyframes: [kf('c', 30, 0.2), kf('d', 50, 0.8)],
  },
];

export default function TimelineInfinityDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [frame, setFrame] = useState(15);

  return (
    <DemoWrapper height="360px">
      <div style={{ height: '100%' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          mode="graph"
          startFrame={0}
          endFrame={100}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
        />
      </div>
    </DemoWrapper>
  );
}
