import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Timeline,
  type TimelineSelection,
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
    keyframes: [kf('a', 0), kf('b', 24), kf('c', 48)],
  },
  {
    id: 'pos.y',
    label: 'Position Y',
    color: '#e0a64b',
    keyframes: [kf('d', 12), kf('e', 36), kf('f', 60)],
  },
  {
    id: 'opacity',
    label: 'Opacity',
    color: '#5bbf7b',
    keyframes: [kf('g', 0), kf('h', 18), kf('i', 54)],
  },
];

export default function TimelineSelectionDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(TRACKS);
  const [frame, setFrame] = useState(0);
  const [selection, setSelection] = useState<TimelineSelection>([]);

  return (
    <DemoWrapper height="320px">
      <div
        style={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 200px',
          gap: 'var(--etui-spacing-sm)',
        }}
      >
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={72}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
          selection={selection}
          onSelectionChange={setSelection}
        />
        <div
          style={{
            padding: 'var(--etui-spacing-sm)',
            background: 'var(--etui-color-bg-secondary)',
            border: '1px solid var(--etui-color-border-default)',
            borderRadius: 4,
            fontSize: 'var(--etui-font-size-xs)',
            overflow: 'auto',
            fontFamily: 'var(--etui-font-family-mono)',
          }}
        >
          <div
            style={{
              fontWeight: 500,
              marginBottom: 8,
              color: 'var(--etui-color-text-muted)',
              fontFamily: 'var(--etui-font-family-sans)',
            }}
          >
            Selection ({selection.length})
          </div>
          {selection.length === 0 ? (
            <em style={{ color: 'var(--etui-color-text-muted)' }}>
              Drag on empty space to box-select, or shift-click keyframes.
            </em>
          ) : (
            selection.map(r => (
              <div key={`${r.trackId}/${r.keyframeId}`}>
                {r.trackId} / {r.keyframeId}
              </div>
            ))
          )}
        </div>
      </div>
    </DemoWrapper>
  );
}
