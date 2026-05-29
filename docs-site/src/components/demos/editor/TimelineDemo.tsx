import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Timeline,
  type TimelineGroup,
  type TimelineMode,
  type TimelineTrack,
} from '@/components/editor/Timeline';
import { Button } from '@/components/primitives/Button';

function kf(
  id: string,
  x: number,
  y: number
): TimelineTrack['keyframes'][number] {
  return {
    id,
    x,
    y,
    handleIn: { x: -6, y: 0 },
    handleOut: { x: 6, y: 0 },
    tangentMode: 'auto',
  };
}

const INITIAL_TRACKS: TimelineTrack[] = [
  {
    id: 'pos-x',
    label: 'Position X',
    groupId: 'transform',
    keyframes: [kf('a', 0, 0), kf('b', 24, 120), kf('c', 60, 40)],
  },
  {
    id: 'pos-y',
    label: 'Position Y',
    groupId: 'transform',
    color: '#e0a64b',
    keyframes: [kf('d', 0, 0), kf('e', 36, 80)],
  },
  {
    id: 'scale',
    label: 'Scale',
    groupId: 'transform',
    expanded: true,
    keyframes: [kf('i', 12, 1), kf('j', 60, 2)],
  },
  {
    id: 'opacity',
    label: 'Opacity',
    groupId: 'material',
    color: '#5bbf7b',
    keyframes: [kf('f', 0, 1), kf('g', 48, 0), kf('h', 72, 1)],
  },
];

const INITIAL_GROUPS: TimelineGroup[] = [
  { id: 'transform', label: 'Transform' },
  { id: 'material', label: 'Material' },
];

export default function TimelineDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(INITIAL_TRACKS);
  const [groups, setGroups] = useState<TimelineGroup[]>(INITIAL_GROUPS);
  const [frame, setFrame] = useState(18);
  const [mode, setMode] = useState<TimelineMode>('dope-sheet');
  const [playing, setPlaying] = useState(false);

  return (
    <DemoWrapper height="360px">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          groups={groups}
          onGroupsChange={setGroups}
          endFrame={72}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
          mode={mode}
          onModeChange={setMode}
          playing={playing}
          onPlayingChange={setPlaying}
          loop
        >
          <Timeline.Toolbar>
            <Button size="sm" onClick={() => setPlaying(p => !p)}>
              {playing ? 'Pause' : 'Play'}
            </Button>
            <Button
              size="sm"
              onClick={() =>
                setMode(m => (m === 'graph' ? 'dope-sheet' : 'graph'))
              }
            >
              {mode === 'graph' ? 'Dope sheet' : 'Graph'}
            </Button>
          </Timeline.Toolbar>
          <Timeline.Footer>
            Frame {Math.round(frame)} · {mode}
          </Timeline.Footer>
        </Timeline>
      </div>
    </DemoWrapper>
  );
}
