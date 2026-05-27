'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { clamp } from './timelineCoords';
import { reorderTracksByDrop } from './timelineEdits';
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
  timelineHeaderDropIndicatorStyle,
} from './Timeline.css';

interface TimelineTrackHeadersProps {
  tracks: ReadonlyArray<TimelineTrack>;
  trackHeight: number;
  rulerHeight: number;
  width: number;
  selection: TimelineSelection;
  editable: boolean;
  renderTrackHeader?:
    | ((track: TimelineTrack, info: TimelineTrackHeaderInfo) => React.ReactNode)
    | undefined;
  onReorderTracks?: ((tracks: TimelineTrack[]) => void) | undefined;
}

interface DragState {
  id: string;
  dropIndex: number;
}

/**
 * The left track-header column. Renders a spacer aligned with the ruler band,
 * then one row per visible track (built-in label + color swatch by default,
 * or `renderTrackHeader`). With the built-in header, rows can be dragged to
 * reorder tracks (a drop indicator marks the target gap).
 */
export function TimelineTrackHeaders({
  tracks,
  trackHeight,
  rulerHeight,
  width,
  selection,
  editable,
  renderTrackHeader,
  onReorderTracks,
}: TimelineTrackHeadersProps): React.ReactElement {
  const columnRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const selectedTrackIds = useMemo(() => {
    const set = new Set<string>();
    for (const ref of selection) set.add(ref.trackId);
    return set;
  }, [selection]);

  const visible = tracks.filter(t => !t.hidden);
  // Reorder-drag is only wired for the built-in header, so custom headers keep
  // full control of their own pointer interactions.
  const reorderable = editable && !!onReorderTracks && !renderTrackHeader;

  const dropIndexAt = useCallback(
    (clientY: number): number => {
      const rect = columnRef.current?.getBoundingClientRect();
      const top = (rect?.top ?? 0) + rulerHeight;
      const raw = Math.round((clientY - top) / Math.max(1, trackHeight));
      return clamp(raw, 0, visible.length);
    },
    [rulerHeight, trackHeight, visible.length]
  );

  const handleRowPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, trackId: string): void => {
      if (!reorderable || e.button !== 0) return;
      const column = columnRef.current;
      if (!column) return;
      column.setPointerCapture(e.pointerId);
      const index = visible.findIndex(t => t.id === trackId);
      setDrag({ id: trackId, dropIndex: index < 0 ? 0 : index });
    },
    [reorderable, visible]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const y = e.clientY;
      setDrag(d => (d ? { ...d, dropIndex: dropIndexAt(y) } : d));
    },
    [dropIndexAt]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const column = columnRef.current;
      if (column?.hasPointerCapture(e.pointerId)) {
        column.releasePointerCapture(e.pointerId);
      }
      setDrag(current => {
        if (current && onReorderTracks) {
          const next = reorderTracksByDrop(
            tracks,
            current.id,
            current.dropIndex
          );
          if (next.some((t, i) => t.id !== tracks[i]?.id))
            onReorderTracks(next);
        }
        return null;
      });
    },
    [tracks, onReorderTracks]
  );

  return (
    <div
      ref={columnRef}
      className={timelineHeaderColumnStyle}
      style={{ width }}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
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
            data-draggable={reorderable || undefined}
            data-dragging={drag?.id === track.id || undefined}
            data-locked={track.locked ? true : undefined}
            data-selected={hasSelection || undefined}
            onPointerDown={
              reorderable ? e => handleRowPointerDown(e, track.id) : undefined
            }
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
      {drag && (
        <div
          className={timelineHeaderDropIndicatorStyle}
          style={{ top: rulerHeight + drag.dropIndex * trackHeight }}
        />
      )}
    </div>
  );
}
