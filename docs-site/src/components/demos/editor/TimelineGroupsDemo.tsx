import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Timeline,
  type TimelineGroup,
  type TimelineTrack,
} from '@/components/editor/Timeline';

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
    id: 'pos.x',
    label: 'Position X',
    groupId: 'transform',
    keyframes: [kf('a', 0, 0), kf('b', 30, 80)],
  },
  {
    id: 'pos.y',
    label: 'Position Y',
    groupId: 'transform',
    color: '#e0a64b',
    keyframes: [kf('c', 0, 0), kf('d', 40, 40)],
  },
  {
    id: 'scale',
    label: 'Uniform Scale',
    groupId: 'transform',
    keyframes: [kf('e', 0, 1), kf('f', 50, 1.4)],
  },
  {
    id: 'opacity',
    label: 'Opacity',
    groupId: 'material',
    color: '#5bbf7b',
    keyframes: [kf('g', 0, 1), kf('h', 60, 0.2)],
  },
  {
    id: 'hue',
    label: 'Hue Shift',
    groupId: 'material',
    color: '#4fb6e0',
    keyframes: [kf('i', 0, 200), kf('j', 60, 280)],
  },
  {
    id: 'intensity',
    label: 'Light Intensity',
    groupId: 'light',
    color: '#d65b8a',
    keyframes: [kf('k', 0, 1), kf('l', 72, 1.6)],
  },
];

const GROUPS: TimelineGroup[] = [
  { id: 'transform', label: 'Transform' },
  { id: 'material', label: 'Material' },
  { id: 'light', label: 'Light', collapsed: true },
];

export default function TimelineGroupsDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [groups, setGroups] = useState<TimelineGroup[]>(GROUPS);
  const [frame, setFrame] = useState(0);

  return (
    <DemoWrapper height="360px">
      <div style={{ height: '100%' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          groups={groups}
          onGroupsChange={setGroups}
          endFrame={72}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
        />
      </div>
    </DemoWrapper>
  );
}
