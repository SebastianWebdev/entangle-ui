import { TIMELINE_SLOT } from './Timeline.types';
import type { TimelineTrackScaleProps } from './Timeline.types';

/**
 * Renders a tiny min / max value scale on every graph / expanded-track lane.
 * Picked out of `<Timeline>` children by the `TIMELINE_SLOT` symbol — its
 * position in the child tree does not affect placement (always drawn inside
 * the canvas, at the start or end of each lane).
 *
 * Pure marker — the actual drawing happens inside `drawTimeline`.
 */
const TimelineTrackScaleImpl: (props: TimelineTrackScaleProps) => null = () =>
  null;

export const TimelineTrackScale = Object.assign(TimelineTrackScaleImpl, {
  displayName: 'Timeline.TrackScale',
  [TIMELINE_SLOT]: 'track-scale' as const,
});
