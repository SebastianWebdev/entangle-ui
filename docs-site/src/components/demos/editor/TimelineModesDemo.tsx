import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Timeline,
  type TimelineMode,
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
    id: 'pos.x',
    label: 'Position X',
    valueRange: [-100, 100],
    keyframes: [
      kf('a', 0, -80),
      kf('b', 24, 0),
      kf('c', 48, 80),
      kf('d', 72, 0),
    ],
  },
  {
    id: 'scale',
    label: 'Scale',
    color: '#e0a64b',
    valueRange: [0.5, 1.5],
    keyframes: [kf('e', 0, 1), kf('f', 36, 1.4), kf('g', 72, 1)],
  },
];

export default function TimelineModesDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [frame, setFrame] = useState(24);
  const [mode, setMode] = useState<TimelineMode>('dope-sheet');

  return (
    <DemoWrapper height="320px">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={72}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
          mode={mode}
          onModeChange={setMode}
        >
          <Timeline.Toolbar>
            <Button
              size="sm"
              variant={mode === 'dope-sheet' ? 'filled' : 'outlined'}
              onClick={() => setMode('dope-sheet')}
            >
              Dope sheet
            </Button>
            <Button
              size="sm"
              variant={mode === 'graph' ? 'filled' : 'outlined'}
              onClick={() => setMode('graph')}
            >
              Graph
            </Button>
          </Timeline.Toolbar>
        </Timeline>
      </div>
    </DemoWrapper>
  );
}
