'use client';

import React, { useCallback, useRef } from 'react';

import { useLatest } from '@/hooks';
import { clamp } from '@/utils/mathUtils';

import {
  trackRowStyle,
  trackStyle,
  trackFillStyle,
  stopHandleRecipe,
  stopHandleColorStyle,
} from './GradientEditor.css';
import { formatRampPreviewCSS, sortStops } from './gradientUtils';

import type { GradientStop } from './GradientEditor.types';

// Vertical distance (px) the pointer must travel off the track before a drag
// is treated as a delete gesture (matches CurveEditor's drag-off-to-delete).
const DELETE_THRESHOLD_PX = 40;

interface GradientStopsProps {
  stops: GradientStop[];
  selectedId: string | null;
  disabled: boolean;
  canAdd: boolean;
  canDelete: boolean;
  /** Continuous position update while dragging a stop. */
  onMoveStop: (id: string, position: number) => void;
  /** Add a stop at a track position (0–1). */
  onAddStop: (position: number) => void;
  /** Remove a stop by id. */
  onDeleteStop: (id: string) => void;
  /** Selection change (also fires on pointer-down on a handle). */
  onSelectStop: (id: string) => void;
  /** Commit boundary — drag end / add / delete. */
  onCommit: () => void;
}

export const GradientStops = ({
  stops,
  selectedId,
  disabled,
  canAdd,
  canDelete,
  onMoveStop,
  onAddStop,
  onDeleteStop,
  onSelectStop,
  onCommit,
}: GradientStopsProps): React.ReactElement => {
  const trackRef = useRef<HTMLDivElement>(null);

  // Live refs so the pointer handlers can stay identity-stable.
  const stopsRef = useLatest(stops);
  const canDeleteRef = useLatest(canDelete);
  const onMoveStopRef = useLatest(onMoveStop);
  const onDeleteStopRef = useLatest(onDeleteStop);
  const onCommitRef = useLatest(onCommit);

  // Drag bookkeeping for the active pointer gesture.
  const dragRef = useRef<{ id: string; willDelete: boolean } | null>(null);

  const positionFromClientX = useCallback((clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  }, []);

  const handleTrackPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only the bare track adds a stop; handles stop propagation themselves.
      if (disabled || !canAdd) return;
      if (e.target !== trackRef.current) return;
      e.preventDefault();
      onAddStop(positionFromClientX(e.clientX));
    },
    [disabled, canAdd, onAddStop, positionFromClientX]
  );

  const handleHandlePointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      onSelectStop(id);
      dragRef.current = { id, willDelete: false };
    },
    [disabled, onSelectStop]
  );

  const handleHandlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || e.buttons === 0) return;

      const rect = trackRef.current?.getBoundingClientRect();
      const offY = rect
        ? Math.max(rect.top - e.clientY, e.clientY - rect.bottom)
        : 0;

      // Past the threshold (and deletion allowed) → arm delete, hold position.
      const willDelete =
        canDeleteRef.current &&
        stopsRef.current.length > 2 &&
        offY > DELETE_THRESHOLD_PX;
      dragRef.current = { ...drag, willDelete };

      if (!willDelete) {
        onMoveStopRef.current(drag.id, positionFromClientX(e.clientX));
      }
    },
    [canDeleteRef, stopsRef, onMoveStopRef, positionFromClientX]
  );

  const handleHandlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

      if (drag.willDelete) {
        onDeleteStopRef.current(drag.id);
      }
      onCommitRef.current();
    },
    [onDeleteStopRef, onCommitRef]
  );

  const handleHandleKeyDown = useCallback(
    (e: React.KeyboardEvent, stop: GradientStop) => {
      if (disabled) return;
      const step = e.shiftKey ? 0.1 : 0.01;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          onMoveStop(stop.id, clamp(stop.position - step, 0, 1));
          onCommit();
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          onMoveStop(stop.id, clamp(stop.position + step, 0, 1));
          onCommit();
          break;
        case 'Delete':
        case 'Backspace':
          if (canDelete && stops.length > 2) {
            e.preventDefault();
            onDeleteStop(stop.id);
            onCommit();
          }
          break;
        default:
          break;
      }
    },
    [disabled, canDelete, stops.length, onMoveStop, onDeleteStop, onCommit]
  );

  const rampPreview = formatRampPreviewCSS(stops);

  return (
    <div className={trackRowStyle}>
      <div
        ref={trackRef}
        className={trackStyle}
        onPointerDown={handleTrackPointerDown}
      >
        <div className={trackFillStyle} style={{ background: rampPreview }} />
        {sortStops(stops).map(stop => (
          <button
            key={stop.id}
            type="button"
            className={stopHandleRecipe({ selected: stop.id === selectedId })}
            style={{ left: `${stop.position * 100}%` }}
            role="slider"
            aria-label={`Gradient stop at ${Math.round(stop.position * 100)}%`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(stop.position * 100)}
            aria-valuetext={`${Math.round(stop.position * 100)}%, ${stop.color}`}
            disabled={disabled}
            onPointerDown={e => {
              handleHandlePointerDown(e, stop.id);
            }}
            onPointerMove={handleHandlePointerMove}
            onPointerUp={handleHandlePointerUp}
            onKeyDown={e => {
              handleHandleKeyDown(e, stop);
            }}
          >
            <span
              className={stopHandleColorStyle}
              style={{ backgroundColor: stop.color }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

GradientStops.displayName = 'GradientStops';
