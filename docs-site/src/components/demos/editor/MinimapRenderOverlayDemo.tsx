import { useEffect, useMemo, useState } from 'react';
import { Minimap, type MinimapItem } from '@/components/editor/Minimap';
import { useFakeViewport } from './minimapDemoUtils';
import { prettyClip, prettyPlayhead } from './minimapPresentation';

const TRACK_HEIGHT = 24;
const TRACK_GAP = 8;
const TRACKS = 3;
const TOTAL_HEIGHT = TRACKS * TRACK_HEIGHT + (TRACKS - 1) * TRACK_GAP;
const TIMELINE_DURATION = 700;
const PLAYBACK_MS_PER_UNIT = 12;

interface ClipDef {
  track: number;
  start: number;
  duration: number;
  hue: number;
  fadeOut?: boolean;
}

const CLIPS: ClipDef[] = [
  { track: 0, start: 0, duration: 220, hue: 200 },
  { track: 0, start: 280, duration: 320, hue: 200, fadeOut: true },
  { track: 1, start: 60, duration: 480, hue: 130 },
  { track: 2, start: 120, duration: 180, hue: 350 },
  { track: 2, start: 380, duration: 220, hue: 350, fadeOut: true },
];

const ITEMS: MinimapItem[] = CLIPS.map((c, i) =>
  prettyClip({
    id: `clip-${i}`,
    x: c.start,
    y: c.track * (TRACK_HEIGHT + TRACK_GAP),
    width: c.duration,
    height: TRACK_HEIGHT,
    hue: c.hue,
    ...(c.fadeOut ? { fadeOut: true } : {}),
  })
);

export default function MinimapRenderOverlayDemo(): React.ReactElement {
  const fake = useFakeViewport({ width: 700, height: TOTAL_HEIGHT });
  const [playhead, setPlayhead] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number): void => {
      const elapsed = now - start;
      const pos = (elapsed / PLAYBACK_MS_PER_UNIT) % TIMELINE_DURATION;
      setPlayhead(pos);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const worldBounds = useMemo(
    () => ({
      x: -20,
      y: -10,
      width: TIMELINE_DURATION + 40,
      height: TOTAL_HEIGHT + 20,
    }),
    []
  );

  return (
    <Minimap
      items={ITEMS}
      worldBounds={worldBounds}
      transform={fake.transform}
      viewportSize={fake.viewportSize}
      onNavigate={fake.onNavigate}
      width={520}
      minHeight={64}
      maxHeight={140}
      renderOverlay={(ctx, info) => {
        prettyPlayhead(ctx, info, playhead);
      }}
    >
      <Minimap.Title>Playhead via renderOverlay</Minimap.Title>
    </Minimap>
  );
}
