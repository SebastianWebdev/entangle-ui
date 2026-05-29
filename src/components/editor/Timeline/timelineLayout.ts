import { autoValueRange } from './timelineCoords';

import type { TimelineGroup, TimelineTrack } from './Timeline.types';

/** A rendered track lane. */
export interface TimelineTrackRow {
  kind: 'track';
  track: TimelineTrack;
  /** Top in content space (before scroll), CSS px. */
  top: number;
  height: number;
  /** Render as a graph (curve) lane. */
  graph: boolean;
  /** Cached value range — `track.valueRange` or auto-fit from keyframes. */
  range: readonly [number, number];
}

/** A group header row. */
export interface TimelineGroupRow {
  kind: 'group';
  group: TimelineGroup;
  top: number;
  height: number;
}

export type TimelineRow = TimelineTrackRow | TimelineGroupRow;

export interface RowLayoutOptions {
  trackHeight: number;
  expandedHeight: number;
  groupHeaderHeight: number;
  /** Global graph mode (each track also graphs when `track.expanded`). */
  globalGraph: boolean;
  groups: ReadonlyArray<TimelineGroup>;
}

export interface TrackGeometry {
  top: number;
  height: number;
  graph: boolean;
  range: readonly [number, number];
}

export interface RowLayout {
  rows: TimelineRow[];
  /** Per-track content-space geometry, for keyframe positioning + hit-testing. */
  trackTops: Map<string, TrackGeometry>;
  contentHeight: number;
}

/**
 * Flatten tracks into the rendered row list: a group header before the first
 * visible member of each group (collapsing hides its members), then each
 * non-hidden track at its (variable) height — taller when graph-expanded.
 * With no groups and no expanded tracks the layout is the uniform grid
 * `index * trackHeight`.
 */
export function computeRows(
  tracks: ReadonlyArray<TimelineTrack>,
  opts: RowLayoutOptions
): RowLayout {
  const groupById = new Map(opts.groups.map(g => [g.id, g]));
  const seen = new Set<string>();
  const rows: TimelineRow[] = [];
  const trackTops = new Map<string, TrackGeometry>();
  let top = 0;

  for (const track of tracks) {
    if (track.hidden) continue;
    const group = track.groupId ? groupById.get(track.groupId) : undefined;
    if (group && !seen.has(group.id)) {
      seen.add(group.id);
      rows.push({ kind: 'group', group, top, height: opts.groupHeaderHeight });
      top += opts.groupHeaderHeight;
    }
    if (group?.collapsed) continue;
    const graph = opts.globalGraph || !!track.expanded;
    const height =
      track.height ?? (track.expanded ? opts.expandedHeight : opts.trackHeight);
    const range = track.valueRange ?? autoValueRange(track.keyframes);
    const geom: TrackGeometry = { top, height, graph, range };
    rows.push({ kind: 'track', track, top, height, graph, range });
    trackTops.set(track.id, geom);
    top += height;
  }

  return { rows, trackTops, contentHeight: top };
}
