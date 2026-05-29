'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';

import { useMergedRef } from '@/hooks';

import {
  timelineHeaderColumnStyle,
  timelineHeaderSpacerStyle,
  timelineHeaderRowsViewportStyle,
  timelineHeaderRowStyle,
  timelineHeaderGroupRowStyle,
  timelineHeaderToggleStyle,
  timelineHeaderSwatchStyle,
  timelineHeaderLabelStyle,
  timelineHeaderDropIndicatorStyle,
} from './Timeline.css';
import { reorderTracksByDrop } from './timelineEdits';

import type {
  TimelineSelection,
  TimelineTrack,
  TimelineTrackHeaderInfo,
} from './Timeline.types';
import type { TimelineRow, TimelineTrackRow } from './timelineLayout';

const GROUP_INDENT = 14;

interface TimelineTrackHeadersProps {
  rows: ReadonlyArray<TimelineRow>;
  contentHeight: number;
  tracks: ReadonlyArray<TimelineTrack>;
  rulerHeight: number;
  scrollTop: number;
  width: number;
  selection: TimelineSelection;
  editable: boolean;
  renderTrackHeader?:
    | ((track: TimelineTrack, info: TimelineTrackHeaderInfo) => React.ReactNode)
    | undefined;
  onReorderTracks?: ((tracks: TimelineTrack[]) => void) | undefined;
  onToggleGroupCollapsed: (groupId: string) => void;
  onToggleTrackExpanded: (trackId: string) => void;
  /** Forwarded ref to the column root, so the parent can attach extra DOM
   *  handlers (e.g. a native non-passive wheel listener for row scrolling). */
  ref?: React.Ref<HTMLDivElement>;
}

interface DragState {
  id: string;
  dropIndex: number;
}

/** A crisp disclosure triangle (right-pointing; rotates to point down). */
function Caret(): React.ReactElement {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
      <path d="M2 1 L6 4 L2 7 Z" fill="currentColor" />
    </svg>
  );
}

/**
 * The left track-header column. Renders a spacer aligned with the ruler band,
 * then the layout rows: group headers (with a collapse caret) and one row per
 * visible track (built-in label + color swatch + expand-to-graph caret by
 * default, or `renderTrackHeader`). Rows are absolutely positioned from the
 * shared layout so they stay aligned with the canvas lanes (variable heights,
 * expanded graph lanes). With the built-in header, track rows can be dragged to
 * reorder (a drop indicator marks the target gap).
 */
export function TimelineTrackHeaders({
  rows,
  contentHeight,
  tracks,
  rulerHeight,
  scrollTop,
  width,
  selection,
  editable,
  renderTrackHeader,
  onReorderTracks,
  onToggleGroupCollapsed,
  onToggleTrackExpanded,
  ref,
}: TimelineTrackHeadersProps): React.ReactElement {
  const columnRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef<HTMLDivElement>(columnRef, ref);
  const [drag, setDrag] = useState<DragState | null>(null);

  const selectedTrackIds = useMemo(() => {
    const set = new Set<string>();
    for (const ref of selection) set.add(ref.trackId);
    return set;
  }, [selection]);

  const trackRows = useMemo(
    () => rows.filter((r): r is TimelineTrackRow => r.kind === 'track'),
    [rows]
  );
  const trackIndexById = useMemo(() => {
    const m = new Map<string, number>();
    trackRows.forEach((r, i) => m.set(r.track.id, i));
    return m;
  }, [trackRows]);

  // Reorder-drag is only wired for the built-in header, so custom headers keep
  // full control of their own pointer interactions.
  const reorderable = editable && !!onReorderTracks && !renderTrackHeader;

  const dropIndexAt = useCallback(
    (clientY: number): number => {
      const rect = columnRef.current?.getBoundingClientRect();
      const top = (rect?.top ?? 0) + rulerHeight;
      const contentY = clientY - top + scrollTop;
      for (let i = 0; i < trackRows.length; i += 1) {
        const r = trackRows[i];
        if (r && contentY < r.top + r.height / 2) return i;
      }
      return trackRows.length;
    },
    [rulerHeight, scrollTop, trackRows]
  );

  const handleRowPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, trackId: string): void => {
      if (!reorderable || e.button !== 0) return;
      const column = columnRef.current;
      if (!column) return;
      column.setPointerCapture(e.pointerId);
      const index = trackRows.findIndex(r => r.track.id === trackId);
      setDrag({ id: trackId, dropIndex: index < 0 ? 0 : index });
    },
    [reorderable, trackRows]
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
          const visible = tracks.filter(t => !t.hidden);
          let visibleIndex: number;
          if (current.dropIndex >= trackRows.length) {
            visibleIndex = visible.length;
          } else {
            const targetId = trackRows[current.dropIndex]?.track.id;
            visibleIndex = targetId
              ? visible.findIndex(t => t.id === targetId)
              : visible.length;
          }
          const next = reorderTracksByDrop(tracks, current.id, visibleIndex);
          if (next.some((t, i) => t.id !== tracks[i]?.id))
            onReorderTracks(next);
        }
        return null;
      });
    },
    [tracks, trackRows, onReorderTracks]
  );

  const dropTop =
    drag &&
    (drag.dropIndex < trackRows.length
      ? (trackRows[drag.dropIndex]?.top ?? contentHeight)
      : contentHeight);

  return (
    <div
      ref={mergedRef}
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
      <div className={timelineHeaderRowsViewportStyle}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${-scrollTop}px)`,
          }}
        >
          {rows.map(row => {
            if (row.kind === 'group') {
              const collapsed = row.group.collapsed ?? false;
              return (
                <div
                  key={`group:${row.group.id}`}
                  className={timelineHeaderGroupRowStyle}
                  style={{ top: row.top, height: row.height }}
                  onClick={() => {
                    onToggleGroupCollapsed(row.group.id);
                  }}
                >
                  <span
                    className={timelineHeaderToggleStyle}
                    data-open={!collapsed || undefined}
                  >
                    <Caret />
                  </span>
                  {row.group.color && (
                    <span
                      className={timelineHeaderSwatchStyle}
                      style={{ background: row.group.color }}
                    />
                  )}
                  <span className={timelineHeaderLabelStyle}>
                    {row.group.label ?? row.group.id}
                  </span>
                </div>
              );
            }

            const track = row.track;
            const hasSelection = selectedTrackIds.has(track.id);
            const grouped = track.groupId !== undefined;
            return (
              <div
                key={track.id}
                className={timelineHeaderRowStyle}
                style={{
                  top: row.top,
                  height: row.height,
                  ...(grouped ? { paddingInlineStart: GROUP_INDENT } : {}),
                }}
                data-draggable={reorderable || undefined}
                data-dragging={drag?.id === track.id || undefined}
                data-locked={track.locked ? true : undefined}
                data-selected={hasSelection || undefined}
                onPointerDown={
                  reorderable
                    ? e => {
                        handleRowPointerDown(e, track.id);
                      }
                    : undefined
                }
              >
                {renderTrackHeader ? (
                  renderTrackHeader(track, {
                    index: trackIndexById.get(track.id) ?? 0,
                    hasSelection,
                  })
                ) : (
                  <>
                    <button
                      type="button"
                      className={timelineHeaderToggleStyle}
                      data-open={track.expanded ? true : undefined}
                      onPointerDown={e => {
                        e.stopPropagation();
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        onToggleTrackExpanded(track.id);
                      }}
                      aria-label={
                        track.expanded ? 'Collapse track' : 'Expand track'
                      }
                      aria-expanded={track.expanded ?? false}
                    >
                      <Caret />
                    </button>
                    <span
                      className={timelineHeaderSwatchStyle}
                      style={
                        track.color ? { background: track.color } : undefined
                      }
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
      </div>
      {drag && dropTop !== null && (
        <div
          className={timelineHeaderDropIndicatorStyle}
          style={{ top: rulerHeight + (dropTop ?? 0) - scrollTop }}
        />
      )}
    </div>
  );
}
