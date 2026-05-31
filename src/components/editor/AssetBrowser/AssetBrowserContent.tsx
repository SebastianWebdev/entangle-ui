'use client';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import React from 'react';

import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorIcon } from '@/components/Icons';
import { Button } from '@/components/primitives/Button';

import {
  cellWidthVar,
  emptyText,
  emptyWrap,
  loadingGrid,
  skeletonCell,
} from './AssetBrowser.css';
import {
  useAssetBrowserChrome,
  useAssetBrowserContext,
} from './AssetBrowserContext';
import { cellWidth } from './assetBrowserGeometry';
import { AssetBrowserGrid } from './AssetBrowserGrid';
import { AssetBrowserList } from './AssetBrowserList';

/**
 * Skeleton placeholder grid shown while `loading`. Renders `loadingItemCount`
 * cells sized to the current thumbnail scale (a square block + a label line)
 * so the loading state matches the real grid's geometry instead of a lone
 * spinner. Static (`animation="none"`) — dozens of pulsing blocks are noise.
 */
function LoadingGrid({
  count,
  thumbPx,
}: {
  count: number;
  thumbPx: number;
}): React.ReactElement {
  return (
    <div
      className={loadingGrid}
      style={assignInlineVars({ [cellWidthVar]: `${cellWidth(thumbPx)}px` })}
      role="presentation"
      aria-hidden
      data-testid="asset-browser-loading"
    >
      {Array.from({ length: Math.max(0, count) }, (_, i) => (
        <div key={i} className={skeletonCell}>
          <Skeleton width={thumbPx} height={thumbPx} animation="none" />
          <Skeleton shape="line" width="80%" animation="none" />
        </div>
      ))}
    </div>
  );
}

/**
 * Resolves the main content area: error → error state, loading → skeleton grid,
 * empty → empty state, otherwise the grid or list view depending on
 * `chrome.view`.
 */
export function AssetBrowserContent(): React.ReactElement {
  const {
    loading,
    loadingItemCount,
    thumbnailSizePx,
    displayedItems,
    emptyState,
    error,
    onErrorRetry,
    labels,
  } = useAssetBrowserContext();
  const { view } = useAssetBrowserChrome();

  // `null` / `undefined` / `false` → no error; `true` → built-in message;
  // any other node → custom replacement.
  if (error !== undefined && error !== null && error !== false) {
    return (
      <div className={emptyWrap}>
        {error === true ? (
          <EmptyState
            icon={<ErrorIcon />}
            title={labels.errorTitle}
            description={labels.errorDescription}
            action={
              onErrorRetry ? (
                <Button size="sm" variant="default" onClick={onErrorRetry}>
                  {labels.retry}
                </Button>
              ) : undefined
            }
          />
        ) : (
          error
        )}
      </div>
    );
  }
  if (loading) {
    return view === 'grid' ? (
      <LoadingGrid count={loadingItemCount} thumbPx={thumbnailSizePx} />
    ) : (
      <div className={emptyWrap}>
        <EmptyState loading title={labels.loading} />
      </div>
    );
  }
  if (displayedItems.length === 0) {
    return (
      <div className={emptyWrap}>
        {emptyState ?? <span className={emptyText}>{labels.empty}</span>}
      </div>
    );
  }
  return view === 'grid' ? <AssetBrowserGrid /> : <AssetBrowserList />;
}
