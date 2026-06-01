import type { BreadcrumbsSize } from '@/components/navigation/Breadcrumbs';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import type React from 'react';

export type PathBarSize = BreadcrumbsSize;

/**
 * A single segment of a path. Pass these (instead of a raw string) when a
 * segment needs its own icon or an explicit navigation value.
 */
export interface PathSegment {
  /** Text shown for the segment. */
  label: string;

  /**
   * Path handed to `onNavigate` when this segment is activated. Defaults to the
   * cumulative path built from the preceding labels and the `delimiter`.
   */
  value?: string;

  /** Icon rendered before the label, overriding any default for this segment. */
  icon?: React.ReactNode;
}

/**
 * Accepted shapes for a path: a delimited string (split on `delimiter`) or a
 * pre-split array mixing plain label strings and structured {@link PathSegment}
 * objects.
 */
export type PathInput = string | ReadonlyArray<string | PathSegment>;

export interface PathBarBaseProps extends Omit<
  BaseComponent<HTMLElement>,
  'onChange' | 'defaultValue'
> {
  /**
   * Controlled current path. When provided, PathBar renders exactly this path
   * and never mutates it — drive changes from `onNavigate`.
   */
  value?: PathInput;

  /**
   * Uncontrolled initial path. PathBar then tracks the current path itself:
   * navigating to an ancestor truncates the trail; picking a sibling swaps the
   * segment.
   */
  defaultValue?: PathInput;

  /**
   * Delimiter used to split string paths and to join cumulative navigation
   * values.
   * @default "/"
   */
  delimiter?: string;

  /**
   * Called when a segment is activated — by clicking a folder crumb or by
   * choosing an entry from a segment's sibling dropdown. `path` is the
   * activated segment's navigation value.
   */
  onNavigate?: (path: string, segment: PathSegment, index: number) => void;

  /**
   * Return the sibling entries for a segment to enable a dropdown picker on
   * that crumb. Return an empty array (or omit the prop) to leave a segment
   * without a dropdown. Choosing a sibling fires `onNavigate` with that
   * sibling's value.
   */
  getSiblings?: (
    segment: PathSegment,
    index: number
  ) => ReadonlyArray<string | PathSegment>;

  /**
   * Icon rendered before the first segment when that segment has no `icon` of
   * its own — typically a workspace or home glyph.
   */
  rootIcon?: React.ReactNode;

  /**
   * Separator inserted between segments.
   * @default <ChevronRightIcon size="sm" decorative />
   */
  separator?: React.ReactNode;

  /**
   * Maximum number of segments to show before collapsing the middle into an
   * ellipsis. `0` never collapses.
   * @default 0
   */
  maxItems?: number;

  /**
   * Segments to keep visible at the start when collapsing.
   * @default 1
   */
  itemsBeforeCollapse?: number;

  /**
   * Segments to keep visible at the end when collapsing.
   * @default 2
   */
  itemsAfterCollapse?: number;

  /**
   * Render the ellipsis as a button that expands the collapsed segments.
   * @default true
   */
  expandable?: boolean;

  /**
   * Typography and spacing scale.
   * @default "sm"
   */
  size?: PathBarSize;
}

export type PathBarProps = Prettify<PathBarBaseProps>;
