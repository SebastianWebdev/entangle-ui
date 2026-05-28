import { Timeline as TimelineBase } from './Timeline';
import { TimelineToolbar } from './TimelineToolbar';
import { TimelineFooter } from './TimelineFooter';
import { TimelineMinimap } from './TimelineMinimap';

type TimelineCompound = typeof TimelineBase & {
  Toolbar: typeof TimelineToolbar;
  Footer: typeof TimelineFooter;
  Minimap: typeof TimelineMinimap;
};

const TimelineWithSlots = TimelineBase as TimelineCompound;
TimelineWithSlots.Toolbar = TimelineToolbar;
TimelineWithSlots.Footer = TimelineFooter;
TimelineWithSlots.Minimap = TimelineMinimap;

export const Timeline = TimelineWithSlots;
export { TimelineToolbar, TimelineFooter, TimelineMinimap };
export {
  useTimelineContext,
  useTimelineGeometry,
  useTimelinePlayhead,
  useTimelineSelection,
  useTimelineSelectedTangentMode,
} from './TimelineContext';
export type { TimelineSelectedTangentMode } from './TimelineContext';
export { selectedTangentMode, setSelectedTangentMode } from './timelineEdits';
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
  TimelineGroup,
  TimelineInfinity,
  TimelineHandle,
  TimelineDrawInfo,
  TimelineTrackHeaderInfo,
  TimelineContextValue,
  TimelineToolbarProps,
  TimelineFooterProps,
  TimelineMinimapProps,
  TimelineSlotKind,
  TimelineSlotMarker,
} from './Timeline.types';
export type {
  TimelineGeometryState,
  TimelinePlayheadState,
  TimelineDragState,
  TimelineDragKind,
} from './TimelineStore';
