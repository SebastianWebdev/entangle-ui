import { TIMELINE_SLOT } from './Timeline.types';

import type { TimelineToolbarProps } from './Timeline.types';

/**
 * Toolbar strip rendered above the timeline body (transport, mode toggle,
 * zoom controls). Picked out of `<Timeline>` children by the `TIMELINE_SLOT`
 * symbol — its position in the child tree does not affect placement.
 */
const TimelineToolbarImpl: (props: TimelineToolbarProps) => null = () => null;

export const TimelineToolbar = Object.assign(TimelineToolbarImpl, {
  displayName: 'Timeline.Toolbar',
  [TIMELINE_SLOT]: 'toolbar' as const,
});
