'use client';

import React from 'react';

import { EmptyState } from '@/components/feedback/EmptyState';

import { emptyText, emptyWrap } from './AssetBrowser.css';
import {
  useAssetBrowserChrome,
  useAssetBrowserContext,
} from './AssetBrowserContext';
import { AssetBrowserGrid } from './AssetBrowserGrid';
import { AssetBrowserList } from './AssetBrowserList';

/**
 * Resolves the main content area: loading → spinner, empty → empty state,
 * otherwise the grid or list view depending on `chrome.view`.
 */
export function AssetBrowserContent(): React.ReactElement {
  const { loading, displayedItems, emptyState } = useAssetBrowserContext();
  const { view } = useAssetBrowserChrome();

  if (loading) {
    return (
      <div className={emptyWrap}>
        <EmptyState loading title="Loading assets…" />
      </div>
    );
  }
  if (displayedItems.length === 0) {
    return (
      <div className={emptyWrap}>
        {emptyState ?? <span className={emptyText}>This folder is empty.</span>}
      </div>
    );
  }
  return view === 'grid' ? <AssetBrowserGrid /> : <AssetBrowserList />;
}
