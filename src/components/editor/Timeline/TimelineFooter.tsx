import { TIMELINE_SLOT } from './Timeline.types';
import type { TimelineFooterProps } from './Timeline.types';

/**
 * Footer strip rendered below the timeline body (status bar — selected
 * keyframe info, current frame / timecode). Picked out of `<Timeline>`
 * children by the `TIMELINE_SLOT` symbol — its position in the child tree
 * does not affect placement.
 */
const TimelineFooterImpl: (props: TimelineFooterProps) => null = () => null;

export const TimelineFooter = Object.assign(TimelineFooterImpl, {
  displayName: 'Timeline.Footer',
  [TIMELINE_SLOT]: 'footer' as const,
});
