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

const TRACKS: TimelineTrack[] = [
  {
    id: 'shot.a',
    label: 'Shot A',
    keyframes: [kf('a', 0), kf('b', 18), kf('c', 36)],
  },
  {
    id: 'shot.b',
    label: 'Shot B',
    color: '#e0a64b',
    keyframes: [kf('d', 24), kf('e', 48), kf('f', 64)],
  },
];

const ACT_BREAK_START = 30;
const ACT_BREAK_END = 50;

export default function TimelineOverlayDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [frame, setFrame] = useState(20);

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
          renderOverlay={(ctx, info) => {
            const x0 = info.frameToX(ACT_BREAK_START);
            const x1 = info.frameToX(ACT_BREAK_END);
            ctx.save();
            ctx.fillStyle = 'rgba(224, 166, 75, 0.10)';
            ctx.fillRect(x0, 0, x1 - x0, info.size.height);
            ctx.fillStyle = 'rgba(224, 166, 75, 0.9)';
            ctx.font = '11px sans-serif';
            ctx.textBaseline = 'top';
            ctx.fillText('Act II break', x0 + 6, 4);
            ctx.restore();
          }}
        />
      </div>
    </DemoWrapper>
  );
}
