'use client';

import React from 'react';

import { srOnly } from './AssetBrowser.css';
import { useAssetBrowserAnnouncement } from './useAssetBrowserAnnouncement';

/**
 * Screen-reader-only `aria-live="polite"` region carrying the current
 * "N items, M selected" announcement. Subscribes to the displayed-count and
 * selection slices via {@link useAssetBrowserAnnouncement}.
 */
export function AssetBrowserAnnouncementLive(): React.ReactElement {
  const announcement = useAssetBrowserAnnouncement();
  return (
    <div className={srOnly} aria-live="polite" role="status">
      {announcement}
    </div>
  );
}
