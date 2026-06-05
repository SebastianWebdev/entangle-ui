'use client';

import React from 'react';

import { ChevronDownIcon } from '@/components/Icons';
import { Menu } from '@/components/navigation/Menu';
import { IconButton } from '@/components/primitives';

import { pathBarSiblingTriggerStyle } from './PathBar.css';
import { resolveSiblings } from './pathUtils';

import type { PathBarSize, PathSegment } from './PathBar.types';
import type { ResolvedPathSegment } from './pathUtils';

interface PathBarSiblingMenuProps {
  /** The resolved segment this dropdown hangs off — the sibling anchor. */
  segment: ResolvedPathSegment;
  /** Index of `segment` in the trail; forwarded to `onSelect`. */
  index: number;
  /** Returns the raw sibling entries for the segment. */
  getSiblings: (
    segment: PathSegment,
    index: number
  ) => ReadonlyArray<string | PathSegment>;
  /** Called with the chosen sibling (already resolved to a concrete value). */
  onSelect: (index: number, sibling: ResolvedPathSegment) => void;
  /** Scale shared with the rest of the bar — sizes the caret button and icon. */
  size: PathBarSize;
}

/**
 * Trailing caret + dropdown for a single crumb's siblings (the VS Code path-bar
 * affordance). Rendered as a crumb's `endContent`, so it mounts only for crumbs
 * Breadcrumbs actually renders — `getSiblings` runs lazily, never for segments
 * hidden behind the overflow ellipsis. Renders nothing when the segment has no
 * siblings.
 */
export const PathBarSiblingMenu = ({
  segment,
  index,
  getSiblings,
  onSelect,
  size,
}: PathBarSiblingMenuProps): React.ReactElement | null => {
  const siblings = resolveSiblings(segment, getSiblings(segment, index));
  if (siblings.length === 0) {
    return null;
  }

  return (
    <Menu>
      <Menu.Trigger
        render={
          <IconButton
            aria-label={`Browse ${segment.label} siblings`}
            size={size}
            radius="sm"
            className={pathBarSiblingTriggerStyle}
          >
            <ChevronDownIcon size={size} decorative />
          </IconButton>
        }
      />
      <Menu.Content>
        {siblings.map((sibling, siblingIndex) => (
          <Menu.Item
            key={`${sibling.value}-${siblingIndex}`}
            icon={sibling.icon}
            onSelect={() => {
              onSelect(index, sibling);
            }}
          >
            {sibling.label}
          </Menu.Item>
        ))}
      </Menu.Content>
    </Menu>
  );
};

PathBarSiblingMenu.displayName = 'PathBarSiblingMenu';
