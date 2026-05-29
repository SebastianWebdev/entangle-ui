import { useRef, useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Timeline,
  type TimelineHandle,
  type TimelineSelection,
  type TimelineTrack,
} from '@/components/editor/Timeline';
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
  { id: 't1', label: 'Track 1', keyframes: [kf('a', 0), kf('b', 50)] },
  {
    id: 't2',
    label: 'Track 2',
    color: '#e0a64b',
    keyframes: [kf('c', 20), kf('d', 70)],
  },
];

export default function TimelineHandleDemo() {
  const ref = useRef<TimelineHandle>(null);
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selection, setSelection] = useState<TimelineSelection>([
    { trackId: 't1', keyframeId: 'b' },
  ]);

  return (
    <DemoWrapper height="280px">
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Button size="sm" onClick={() => ref.current?.seek(24)}>
            seek(24)
          </Button>
          <Button size="sm" onClick={() => ref.current?.toggle()}>
            toggle()
          </Button>
          <Button size="sm" onClick={() => ref.current?.zoomToFit(8)}>
            zoomToFit
          </Button>
          <Button size="sm" onClick={() => ref.current?.zoomToSelection()}>
            zoomToSelection
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => ref.current?.focus()}
          >
            focus
          </Button>
        </div>
        <Timeline
          ref={ref}
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={80}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
          playing={playing}
          onPlayingChange={setPlaying}
          selection={selection}
          onSelectionChange={setSelection}
        />
      </div>
    </DemoWrapper>
  );
}
