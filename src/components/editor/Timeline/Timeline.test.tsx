import { describe, it, expect, vi } from 'vitest';
import { act } from '@testing-library/react';
import { createRef } from 'react';
import { renderWithTheme } from '@/tests/testUtils';
import { Timeline } from './Timeline';
import type { TimelineHandle, TimelineTrack } from './Timeline.types';

function kf(
  id: string,
  x: number,
  y: number
): TimelineTrack['keyframes'][number] {
  return {
    id,
    x,
    y,
    handleIn: { x: 0, y: 0 },
    handleOut: { x: 0, y: 0 },
    tangentMode: 'auto',
  };
}

const TRACKS: TimelineTrack[] = [
  {
    id: 'opacity',
    label: 'Opacity',
    keyframes: [kf('k1', 0, 0), kf('k2', 50, 1)],
  },
];

describe('Timeline', () => {
  describe('Rendering', () => {
    it('renders a labelled group with a canvas', () => {
      const { getByRole, container } = renderWithTheme(
        <Timeline
          tracks={TRACKS}
          endFrame={100}
          ariaLabel="Anim timeline"
          height={200}
        />
      );
      expect(getByRole('group', { name: 'Anim timeline' })).toBeInTheDocument();
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('renders overlay children', () => {
      const { getByText } = renderWithTheme(
        <Timeline tracks={TRACKS} endFrame={100} height={200}>
          <div>overlay-content</div>
        </Timeline>
      );
      expect(getByText('overlay-content')).toBeInTheDocument();
    });
  });

  describe('Imperative handle', () => {
    it('defaults the view to the full range and the playhead to startFrame', () => {
      const ref = createRef<TimelineHandle>();
      renderWithTheme(
        <Timeline
          ref={ref}
          tracks={TRACKS}
          startFrame={0}
          endFrame={100}
          height={200}
        />
      );
      expect(ref.current?.getView()).toEqual({ startFrame: 0, endFrame: 100 });
      expect(ref.current?.getFrame()).toBe(0);
    });

    it('respects defaultFrame (uncontrolled)', () => {
      const ref = createRef<TimelineHandle>();
      renderWithTheme(
        <Timeline
          ref={ref}
          tracks={TRACKS}
          endFrame={100}
          defaultFrame={10}
          height={200}
        />
      );
      expect(ref.current?.getFrame()).toBe(10);
    });

    it('seek snaps + clamps and reports via onFrameChange (uncontrolled)', () => {
      const onFrameChange = vi.fn();
      const ref = createRef<TimelineHandle>();
      renderWithTheme(
        <Timeline
          ref={ref}
          tracks={TRACKS}
          endFrame={100}
          defaultFrame={0}
          onFrameChange={onFrameChange}
          height={200}
        />
      );
      act(() => ref.current?.seek(33.4));
      expect(onFrameChange).toHaveBeenLastCalledWith(33);
      expect(ref.current?.getFrame()).toBe(33);
      act(() => ref.current?.seek(999));
      expect(ref.current?.getFrame()).toBe(100);
    });

    it('play/pause report via onPlayingChange', () => {
      const onPlayingChange = vi.fn();
      const ref = createRef<TimelineHandle>();
      renderWithTheme(
        <Timeline
          ref={ref}
          tracks={TRACKS}
          endFrame={100}
          onPlayingChange={onPlayingChange}
          height={200}
        />
      );
      act(() => ref.current?.play());
      expect(onPlayingChange).toHaveBeenLastCalledWith(true);
      act(() => ref.current?.pause());
      expect(onPlayingChange).toHaveBeenLastCalledWith(false);
    });

    it('zoomToFit sets the view via onViewChange (clamped to the range)', () => {
      const onViewChange = vi.fn();
      const ref = createRef<TimelineHandle>();
      renderWithTheme(
        <Timeline
          ref={ref}
          tracks={TRACKS}
          startFrame={0}
          endFrame={100}
          onViewChange={onViewChange}
          height={200}
        />
      );
      act(() => ref.current?.zoomToFit(10));
      expect(onViewChange).toHaveBeenLastCalledWith({
        startFrame: 0,
        endFrame: 100,
      });
    });

    it('controlled frame reflects in getFrame', () => {
      const ref = createRef<TimelineHandle>();
      renderWithTheme(
        <Timeline
          ref={ref}
          tracks={TRACKS}
          endFrame={100}
          frame={20}
          height={200}
        />
      );
      expect(ref.current?.getFrame()).toBe(20);
    });
  });
});
