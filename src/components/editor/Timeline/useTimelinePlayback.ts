'use client';

import { useEffect, useEffectEvent, useRef } from 'react';

import { resolveLoop } from './timelineCoords';

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
  const accRef = useRef(opts.frame);
  const lastEmittedRef = useRef(opts.frame);

  // Canonical `useEffectEvent` use case: `tick` is called *only* from inside
  // the rAF loop below (never attached to JSX or passed out), so it may read
  // the latest props/state without re-arming the loop. This is the React
  // "timer with latest values" pattern — keep it here; do not convert it to a
  // handler that escapes the effect.
  const tick = useEffectEvent((dt: number): boolean => {
    // External scrub during playback → resync the accumulator.
    if (opts.frame !== lastEmittedRef.current) {
      accRef.current = opts.frame;
    }
    const range: PlaybackRange = {
      startFrame: opts.startFrame,
      endFrame: opts.endFrame,
    };
    const region = resolveLoop(opts.loop, range.startFrame, range.endFrame);
    const result = advancePlayback(accRef.current, dt, opts.fps, range, region);
    accRef.current = result.frame;
    lastEmittedRef.current = result.frame;
    opts.onAdvance(result.frame);
    if (result.ended) {
      opts.onEnd();
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (!opts.playing || typeof window === 'undefined') return;
    accRef.current = opts.frame;
    lastEmittedRef.current = opts.frame;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number): void => {
      const dt = (now - last) / 1000;
      last = now;
      const ended = tick(dt);
      if (!ended) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
    };
    // Only `playing` drives the rAF lifecycle; the rest reads through `tick`.
  }, [opts.playing]);
}
