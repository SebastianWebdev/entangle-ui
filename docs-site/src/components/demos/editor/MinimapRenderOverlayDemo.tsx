import { useEffect, useMemo, useState } from 'react';
import { Minimap, type MinimapItem } from '@/components/editor/Minimap';
import { useFakeViewport } from './minimapDemoUtils';

const TRACK_HEIGHT = 24;
const TRACK_GAP = 8;
const TRACKS = 3;

// Pre-baked timeline clips on three tracks
const ITEMS: MinimapItem[] = [
  {
    id: 'a',
    type: 'rect',
    x: 0,
    y: 0,
    width: 220,
    height: TRACK_HEIGHT,
    color: '#4a86c8',
  },
  {
    id: 'b',
    type: 'rect',
    x: 280,
    y: 0,
    width: 320,
    height: TRACK_HEIGHT,
    color: '#4a86c8',
  },
  {
    id: 'c',
    type: 'rect',
    x: 60,
    y: TRACK_HEIGHT + TRACK_GAP,
    width: 480,
    height: TRACK_HEIGHT,
    color: '#6aa84f',
  },
  {
    id: 'd',
    type: 'rect',
    x: 120,
    y: (TRACK_HEIGHT + TRACK_GAP) * 2,
    width: 180,
    height: TRACK_HEIGHT,
    color: '#e63946',
  },
  {
    id: 'e',
    type: 'rect',
    x: 380,
    y: (TRACK_HEIGHT + TRACK_GAP) * 2,
    width: 220,
    height: TRACK_HEIGHT,
    color: '#e63946',
  },
];

const TOTAL_HEIGHT = TRACKS * TRACK_HEIGHT + (TRACKS - 1) * TRACK_GAP;
const TIMELINE_DURATION = 700;
const PLAYBACK_MS_PER_UNIT = 12;

export default function MinimapRenderOverlayDemo(): React.ReactElement {
  const fake = useFakeViewport({ width: 700, height: TOTAL_HEIGHT });
  const [playhead, setPlayhead] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start = performance.now();
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
      minHeight={48}
      maxHeight={120}
      renderOverlay={(ctx, info) => {
        const p = info.worldToMinimap({ x: playhead, y: 0 });
        ctx.strokeStyle = '#ff3860';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x + 0.5, 0);
        ctx.lineTo(p.x + 0.5, info.minimapSize.height);
        ctx.stroke();
        // Playhead dot at the top
        ctx.fillStyle = '#ff3860';
        ctx.beginPath();
        ctx.arc(p.x + 0.5, 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }}
    >
      <Minimap.Title>Playhead via renderOverlay</Minimap.Title>
    </Minimap>
  );
}
