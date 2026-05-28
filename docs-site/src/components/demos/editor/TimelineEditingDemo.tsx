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
      kf('a', 0, -60),
      kf('b', 20, 0),
      kf('c', 40, 60),
      kf('d', 70, 0),
    ],
  },
  {
    id: 'scale',
    label: 'Scale',
    color: '#e0a64b',
    keyframes: [kf('e', 0, 1), kf('f', 50, 1.4)],
  },
];

export default function TimelineEditingDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [frame, setFrame] = useState(0);

  return (
    <DemoWrapper height="320px">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={80}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
        >
          <Timeline.Footer>
            Try: drag a keyframe · double-click empty space · select then Delete
            · Ctrl/Cmd + C / V to copy-paste at the playhead · grab a tangent
            handle on the expanded lane
          </Timeline.Footer>
        </Timeline>
      </div>
    </DemoWrapper>
  );
}
