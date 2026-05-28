'use client';

import React from 'react';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/navigation/SegmentedControl';
import type { AssetThumbnailSize, AssetView } from './AssetBrowser.types';
import { useAssetBrowserAnnouncement } from './useAssetBrowserAnnouncement';
import { statusBar, statusSpacer } from './AssetBrowser.css';

export interface AssetBrowserStatusBarProps {
  /** Current view — drives whether the thumbnail-size control is rendered. */
  view: AssetView;
  thumbnailSize: AssetThumbnailSize;
  setThumbnailSize: (size: AssetThumbnailSize) => void;
}

/**
 * Optional footer bar showing the live announcement and (in grid view) a
 * thumbnail-size segmented control. The announcement is sourced from the
 * `useAssetBrowserAnnouncement` slice hook, so the bar updates without the
 * root recomputing it.
 */
export function AssetBrowserStatusBar({
  view,
  thumbnailSize,
  setThumbnailSize,
}: AssetBrowserStatusBarProps): React.ReactElement {
  const announcement = useAssetBrowserAnnouncement();
  return (
    <div className={statusBar}>
      <span>{announcement}</span>
      <span className={statusSpacer} />
      {view === 'grid' && (
        <SegmentedControl
          value={typeof thumbnailSize === 'string' ? thumbnailSize : 'md'}
          onChange={value => setThumbnailSize(value as AssetThumbnailSize)}
          size="sm"
          aria-label="Thumbnail size"
        >
          <SegmentedControlItem value="sm">S</SegmentedControlItem>
          <SegmentedControlItem value="md">M</SegmentedControlItem>
          <SegmentedControlItem value="lg">L</SegmentedControlItem>
        </SegmentedControl>
      )}
    </div>
  );
}
