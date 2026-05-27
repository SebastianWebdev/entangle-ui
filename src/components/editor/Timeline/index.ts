import { Timeline as TimelineBase } from './Timeline';
import { TimelineToolbar } from './TimelineToolbar';
import { TimelineFooter } from './TimelineFooter';

type TimelineCompound = typeof TimelineBase & {
  Toolbar: typeof TimelineToolbar;
  Footer: typeof TimelineFooter;
};

const TimelineWithSlots = TimelineBase as TimelineCompound;
TimelineWithSlots.Toolbar = TimelineToolbar;
TimelineWithSlots.Footer = TimelineFooter;

export const Timeline = TimelineWithSlots;
export { TimelineToolbar, TimelineFooter };
export {
  useTimelineContext,
  useTimelineGeometry,
  useTimelinePlayhead,
  useTimelineSelection,
} from './TimelineContext';
export { framesToTimecode } from './timelineCoords';
export { TIMELINE_SLOT } from './Timeline.types';

export type {
  TimelineProps,
  TimelineTrack,
  TimelineKeyframeRef,
  TimelineSelection,
  TimelineView,
  TimelineMode,
  TimelineLoop,
  TimelineInfinity,
  TimelineHandle,
  TimelineDrawInfo,
  TimelineTrackHeaderInfo,
  TimelineContextValue,
  TimelineToolbarProps,
  TimelineFooterProps,
  TimelineSlotKind,
  TimelineSlotMarker,
} from './Timeline.types';
export type {
  TimelineGeometryState,
  TimelinePlayheadState,
  TimelineDragState,
  TimelineDragKind,
} from './TimelineStore';
