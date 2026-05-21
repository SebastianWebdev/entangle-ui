import { useMemo } from 'react';
import { Minimap, type MinimapItem } from '@/components/editor/Minimap';
import { useFakeViewport } from './minimapDemoUtils';
import { prettyClip, prettyKeyframe } from './minimapPresentation';

const TRACK_HEIGHT = 24;
const TRACK_GAP = 6;
const TRACKS = 4;

interface Clip {
  track: number;
  start: number;
  duration: number;
  hue: number;
  fadeOut?: boolean;
}

const CLIPS: Clip[] = [
  { track: 0, start: 0, duration: 2400, hue: 200 },
  { track: 0, start: 3000, duration: 4200, hue: 200, fadeOut: true },
  { track: 1, start: 600, duration: 1800, hue: 130 },
  { track: 1, start: 2800, duration: 2200, hue: 130 },
  { track: 1, start: 5400, duration: 1800, hue: 130, fadeOut: true },
  { track: 2, start: 1200, duration: 4800, hue: 350 },
  { track: 3, start: 0, duration: 800, hue: 35 },
  { track: 3, start: 1600, duration: 1600, hue: 35 },
  { track: 3, start: 4200, duration: 2400, hue: 35, fadeOut: true },
];

// Keyframes on the automation row (track 2 — middle of timeline).
const KEYFRAMES: number[] = [400, 1800, 3600, 5200, 6800];

const TIMELINE_TOTAL = 8000;
const TOTAL_H = TRACKS * TRACK_HEIGHT + (TRACKS - 1) * TRACK_GAP;

const ITEMS: MinimapItem[] = [
  ...CLIPS.map((c, i) =>
    prettyClip({
      id: `clip-${i}`,
      x: c.start,
      y: c.track * (TRACK_HEIGHT + TRACK_GAP),
      width: c.duration,
      height: TRACK_HEIGHT,
      hue: c.hue,
      ...(c.fadeOut ? { fadeOut: true } : {}),
    })
  ),
  ...KEYFRAMES.map((t, i) =>
    prettyKeyframe({
      id: `kf-${i}`,
      cx: t,
      cy: 2 * (TRACK_HEIGHT + TRACK_GAP) + TRACK_HEIGHT / 2,
      size: 70,
    })
  ),
];

export default function MinimapTimelineDemo(): React.ReactElement {
  const fake = useFakeViewport({ width: 2000, height: TOTAL_H });
  const worldBounds = useMemo(
    () => ({
      x: -100,
      y: -10,
      width: TIMELINE_TOTAL + 200,
      height: TOTAL_H + 20,
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
      width={600}
      minHeight={64}
      maxHeight={112}
    >
      <Minimap.Title>Master timeline</Minimap.Title>
      <Minimap.Footer>
        8000 frames · 4 tracks · 9 clips · 5 keyframes
      </Minimap.Footer>
    </Minimap>
  );
}
