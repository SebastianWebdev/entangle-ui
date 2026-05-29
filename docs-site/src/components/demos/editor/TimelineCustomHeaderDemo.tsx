import { useState } from 'react';
import DemoWrapper from '../DemoWrapper';
import {
  Timeline,
  type TimelineTrack,
  type TimelineTrackHeaderInfo,
} from '@/components/editor/Timeline';

interface ChannelMeta {
  muted?: boolean;
  solo?: boolean;
}

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

const INITIAL: TimelineTrack[] = [
  {
    id: 'vox',
    label: 'Vocals',
    keyframes: [kf('a', 0), kf('b', 20), kf('c', 40)],
  },
  {
    id: 'gtr',
    label: 'Guitar',
    color: '#e0a64b',
    keyframes: [kf('d', 8), kf('e', 28), kf('f', 56)],
  },
  {
    id: 'drm',
    label: 'Drums',
    color: '#5bbf7b',
    keyframes: [kf('g', 0), kf('h', 16), kf('i', 32), kf('j', 48), kf('k', 64)],
  },
];

const PILL: React.CSSProperties = {
  fontSize: 10,
  padding: '2px 6px',
  borderRadius: 3,
  border: '1px solid var(--etui-color-border-default)',
  background: 'transparent',
  color: 'var(--etui-color-text-muted)',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const PILL_ACTIVE: React.CSSProperties = {
  ...PILL,
  background: 'var(--etui-color-accent-primary)',
  borderColor: 'var(--etui-color-accent-primary)',
  color: '#fff',
};

export default function TimelineCustomHeaderDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(INITIAL);
  const [frame, setFrame] = useState(20);
  const [meta, setMeta] = useState<Record<string, ChannelMeta>>({});

  const toggle = (id: string, key: keyof ChannelMeta): void => {
    setMeta(m => ({ ...m, [id]: { ...m[id], [key]: !m[id]?.[key] } }));
  };

  return (
    <DemoWrapper height="280px">
      <div style={{ height: '100%' }}>
        <Timeline
          tracks={tracks}
          onTracksChange={setTracks}
          endFrame={72}
          fps={24}
          frame={frame}
          onFrameChange={setFrame}
          trackHeaderWidth={200}
          renderTrackHeader={(
            track: TimelineTrack,
            info: TimelineTrackHeaderInfo
          ) => {
            const m = meta[track.id] ?? {};
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  paddingRight: 6,
                  opacity: m.muted ? 0.5 : 1,
                  fontWeight: info.hasSelection ? 500 : 400,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background:
                      track.color ?? 'var(--etui-color-accent-secondary)',
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {track.label}
                </span>
                <button
                  type="button"
                  style={m.muted ? PILL_ACTIVE : PILL}
                  onClick={() => toggle(track.id, 'muted')}
                >
                  M
                </button>
                <button
                  type="button"
                  style={m.solo ? PILL_ACTIVE : PILL}
                  onClick={() => toggle(track.id, 'solo')}
                >
                  S
                </button>
              </div>
            );
          }}
        />
      </div>
    </DemoWrapper>
  );
}
