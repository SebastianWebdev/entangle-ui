'use client';

import { useEffect, useRef } from 'react';
import { useLatest } from '@/hooks';
import type { TimelineLoop } from './Timeline.types';

export interface PlaybackRange {
  startFrame: number;
  endFrame: number;
}

export interface AdvanceResult {
  frame: number;
  /** True when a non-looping playback has reached the end. */
  ended: boolean;
}

/**
 * Advance a playhead by `dtSeconds` of wall-clock time at `fps`. Forward only.
 * With a `loop` region the playhead wraps within it; without one it stops at
 * `range.endFrame`. Pure — the rAF hook below drives it.
 */
export function advancePlayback(
  current: number,
  dtSeconds: number,
  fps: number,
  range: PlaybackRange,
  loop: PlaybackRange | null
): AdvanceResult {
  const next = current + Math.max(0, dtSeconds) * Math.max(0, fps);
  if (loop) {
    if (next < loop.endFrame) return { frame: next, ended: false };
    const span = Math.max(1e-6, loop.endFrame - loop.startFrame);
    return {
      frame: loop.startFrame + ((next - loop.startFrame) % span),
      ended: false,
    };
  }
  if (next >= range.endFrame) return { frame: range.endFrame, ended: true };
  return { frame: next, ended: false };
}

function resolveLoopRegion(
  loop: TimelineLoop | undefined,
  range: PlaybackRange
): PlaybackRange | null {
  if (loop === true) return range;
  if (loop && typeof loop === 'object') return loop;
  return null;
}

interface UseTimelinePlaybackOptions {
  playing: boolean;
  frame: number;
  fps: number;
  startFrame: number;
  endFrame: number;
  loop: TimelineLoop | undefined;
  /** Push the advanced (float) frame — the component clamps + fires onFrameChange. */
  onAdvance: (frame: number) => void;
  /** Called once when non-looping playback reaches the end. */
  onEnd: () => void;
}

/**
 * Drives the playhead while `playing` is true: a rAF loop advancing the frame
 * in real time at `fps`. Keeps its own float accumulator (independent of the
 * snapped/committed frame) and resyncs if the frame is changed externally
 * (e.g. the user scrubs mid-playback).
 */
export function useTimelinePlayback(opts: UseTimelinePlaybackOptions): void {
  const fpsRef = useLatest(opts.fps);
  const startRef = useLatest(opts.startFrame);
  const endRef = useLatest(opts.endFrame);
  const loopRef = useLatest(opts.loop);
  const frameRef = useLatest(opts.frame);
  const onAdvanceRef = useLatest(opts.onAdvance);
  const onEndRef = useLatest(opts.onEnd);

  const accRef = useRef(opts.frame);
  const lastEmittedRef = useRef(opts.frame);

  useEffect(() => {
    if (!opts.playing || typeof window === 'undefined') return;

    accRef.current = frameRef.current;
    lastEmittedRef.current = frameRef.current;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number): void => {
      const dt = (now - last) / 1000;
      last = now;

      // External scrub during playback → resync the accumulator.
      if (frameRef.current !== lastEmittedRef.current) {
        accRef.current = frameRef.current;
      }

      const range: PlaybackRange = {
        startFrame: startRef.current,
        endFrame: endRef.current,
      };
      const region = resolveLoopRegion(loopRef.current, range);
      const result = advancePlayback(
        accRef.current,
        dt,
        fpsRef.current,
        range,
        region
      );

      accRef.current = result.frame;
      lastEmittedRef.current = result.frame;
      onAdvanceRef.current(result.frame);

      if (result.ended) {
        onEndRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    opts.playing,
    fpsRef,
    startRef,
    endRef,
    loopRef,
    frameRef,
    onAdvanceRef,
    onEndRef,
  ]);
}
