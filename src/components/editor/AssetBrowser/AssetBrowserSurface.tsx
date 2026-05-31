'use client';

import React from 'react';

import { CloudUploadIcon } from '@/components/Icons';
import { Icon } from '@/components/primitives/Icon';

import { importOverlay, main } from './AssetBrowser.css';
import { AssetBrowserContent } from './AssetBrowserContent';
import { useAssetBrowserContext, useAssetDrag } from './AssetBrowserContext';
import { AssetBrowserContextMenuLayer } from './AssetBrowserContextMenu';

function ImportOverlay(): React.ReactElement | null {
  const drag = useAssetDrag();
  const { labels } = useAssetBrowserContext();
  if (!drag.externalOver) return null;
  return (
    <div className={importOverlay}>
      <Icon size="lg" decorative>
        <CloudUploadIcon />
      </Icon>
      <span>{labels.importOverlay}</span>
    </div>
  );
}

export interface AssetBrowserSurfaceProps {
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

/**
 * The scrollable content surface (grid/list/empty/loading/error) plus the
 * file-import overlay. Right-click menus (item + empty area) are handled by the
 * single view-agnostic {@link AssetBrowserContextMenuLayer}, which detects the
 * target from `data-asset-id` — so grid cells and list rows behave identically.
 */
export function AssetBrowserSurface({
  onDragOver,
  onDragLeave,
  onDrop,
}: AssetBrowserSurfaceProps): React.ReactElement {
  return (
    <AssetBrowserContextMenuLayer>
      <div
        className={main}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <AssetBrowserContent />
        <ImportOverlay />
      </div>
    </AssetBrowserContextMenuLayer>
  );
}
