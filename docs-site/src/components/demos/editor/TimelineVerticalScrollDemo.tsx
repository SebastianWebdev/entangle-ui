import { useMemo, useState } from 'react';
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

function buildTracks(): TimelineTrack[] {
  const palette = [
    undefined,
    '#e0a64b',
    '#5bbf7b',
    '#9b6bd6',
    '#4fb6e0',
    '#d65b8a',
  ];
  return Array.from({ length: 24 }, (_, i) => {
    const base = (i * 7) % 60;
    return {
      id: `t${i}`,
      label: `Channel ${String(i + 1).padStart(2, '0')}`,
      ...(palette[i % palette.length]
        ? { color: palette[i % palette.length] as string }
        : {}),
      keyframes: [
        kf(`k${i}-a`, base),
        kf(`k${i}-b`, base + 12),
        kf(`k${i}-c`, base + 30),
      ],
    } satisfies TimelineTrack;
  });
}

export default function TimelineVerticalScrollDemo() {
  const initial = useMemo(() => buildTracks(), []);
  const [tracks, setTracks] = useState<TimelineTrack[]>(initial);
  const [frame, setFrame] = useState(0);

  return (
    <DemoWrapper height="260px">
      <div style={{ height: '100%' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={120}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
        />
      </div>
    </DemoWrapper>
  );
}
