import { useMemo } from 'react';
import { Minimap, type MinimapItem } from '@/components/editor/Minimap';
import { useFakeViewport } from './minimapDemoUtils';

const TRACK_HEIGHT = 24;
const TRACK_GAP = 6;
const TRACKS = 4;

const CLIPS: Array<[number, number, number, string]> = [
  // [trackIndex, startTime, duration, color]
  [0, 0, 2400, '#4a86c8'],
  [0, 3000, 4200, '#4a86c8'],
  [1, 600, 1800, '#6aa84f'],
  [1, 2800, 2200, '#6aa84f'],
  [1, 5400, 1800, '#6aa84f'],
  [2, 1200, 4800, '#e63946'],
  [3, 0, 800, '#f4a261'],
  [3, 1600, 1600, '#f4a261'],
  [3, 4200, 2400, '#f4a261'],
];

const TIMELINE_TOTAL = 8000;
const TOTAL_H = TRACKS * TRACK_HEIGHT + (TRACKS - 1) * TRACK_GAP;

const ITEMS: MinimapItem[] = CLIPS.map(
  ([track, start, duration, color], i) => ({
    id: `clip-${i}`,
    type: 'rect',
    x: start,
    y: track * (TRACK_HEIGHT + TRACK_GAP),
    width: duration,
    height: TRACK_HEIGHT,
    color,
  })
);

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
      minHeight={56}
      maxHeight={96}
    >
      <Minimap.Title>Master timeline</Minimap.Title>
      <Minimap.Footer>8000 frames · 4 tracks · 9 clips</Minimap.Footer>
    </Minimap>
  );
}
