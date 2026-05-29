import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Timeline,
  useTimelinePlayhead,
  useTimelineSelection,
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
    id: 't1',
    label: 'Track 1',
    keyframes: [kf('a', 0), kf('b', 30), kf('c', 60)],
  },
  {
    id: 't2',
    label: 'Track 2',
    color: '#e0a64b',
    keyframes: [kf('d', 12), kf('e', 48)],
  },
];

function LiveOverlay() {
  const playhead = useTimelinePlayhead();
  const selection = useTimelineSelection();
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        padding: '6px 10px',
        background: 'rgba(0, 0, 0, 0.55)',
        border: '1px solid var(--etui-color-border-default)',
        borderRadius: 4,
        fontSize: 'var(--etui-font-size-xs)',
        fontFamily: 'var(--etui-font-family-mono)',
        color: 'var(--etui-color-text-primary)',
        pointerEvents: 'none',
      }}
    >
      <div>frame: {Math.round(playhead.frame)}</div>
      <div>playing: {String(playhead.playing)}</div>
      <div>selected: {selection.length}</div>
    </div>
  );
}

export default function TimelineHooksDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [frame, setFrame] = useState(18);
  const [playing, setPlaying] = useState(false);

  return (
    <DemoWrapper height="240px">
      <div style={{ height: '100%' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={72}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
          playing={playing}
          onPlayingChange={setPlaying}
        >
          <LiveOverlay />
        </Timeline>
      </div>
    </DemoWrapper>
  );
}
