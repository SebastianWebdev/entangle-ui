'use client';

import React, { useMemo } from 'react';
import type {
  TimelineSelection,
  TimelineTrack,
  TimelineTrackHeaderInfo,
} from './Timeline.types';
import {
  timelineHeaderColumnStyle,
  timelineHeaderSpacerStyle,
  timelineHeaderRowStyle,
  timelineHeaderSwatchStyle,
  timelineHeaderLabelStyle,
} from './Timeline.css';

interface TimelineTrackHeadersProps {
  tracks: ReadonlyArray<TimelineTrack>;
  trackHeight: number;
  rulerHeight: number;
  width: number;
  selection: TimelineSelection;
  renderTrackHeader?:
    | ((track: TimelineTrack, info: TimelineTrackHeaderInfo) => React.ReactNode)
    | undefined;
}

/**
 * The left track-header column. Renders a spacer aligned with the ruler band,
 * then one row per visible track — a built-in label + color swatch by default,
 * or whatever `renderTrackHeader` returns.
 */
export function TimelineTrackHeaders({
  tracks,
  trackHeight,
  rulerHeight,
  width,
  selection,
  renderTrackHeader,
}: TimelineTrackHeadersProps): React.ReactElement {
  const selectedTrackIds = useMemo(() => {
    const set = new Set<string>();
    for (const ref of selection) set.add(ref.trackId);
    return set;
  }, [selection]);

  const visible = tracks.filter(t => !t.hidden);

  return (
    <div className={timelineHeaderColumnStyle} style={{ width }}>
      {rulerHeight > 0 && (
        <div
          className={timelineHeaderSpacerStyle}
          style={{ height: rulerHeight }}
        />
      )}
      {visible.map((track, index) => {
        const rowH = track.height ?? trackHeight;
        const hasSelection = selectedTrackIds.has(track.id);
        return (
          <div
            key={track.id}
            className={timelineHeaderRowStyle}
            style={{ height: rowH }}
            data-locked={track.locked ? true : undefined}
            data-selected={hasSelection || undefined}
          >
            {renderTrackHeader ? (
              renderTrackHeader(track, { index, hasSelection })
            ) : (
              <>
                <span
                  className={timelineHeaderSwatchStyle}
                  style={track.color ? { background: track.color } : undefined}
                />
                <span className={timelineHeaderLabelStyle}>
                  {track.label ?? track.id}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
