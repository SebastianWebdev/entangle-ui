'use client';

import React from 'react';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/navigation/SegmentedControl';
import { useAssetBrowserChrome } from './AssetBrowserContext';
import type { AssetThumbnailSize } from './AssetBrowser.types';
import { statusBar, statusSpacer } from './AssetBrowser.css';

export interface AssetBrowserStatusBarProps {
  announcement: string;
  thumbnailSize: AssetThumbnailSize;
  setThumbnailSize: (size: AssetThumbnailSize) => void;
}

export function AssetBrowserStatusBar({
  announcement,
  thumbnailSize,
  setThumbnailSize,
}: AssetBrowserStatusBarProps): React.ReactElement {
  const { view } = useAssetBrowserChrome();
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
