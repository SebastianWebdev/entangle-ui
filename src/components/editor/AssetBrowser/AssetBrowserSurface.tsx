'use client';

import React from 'react';

import { CloudUploadIcon } from '@/components/Icons';
import { ContextMenu } from '@/components/navigation/ContextMenu';
import { Icon } from '@/components/primitives/Icon';

import { importOverlay, main } from './AssetBrowser.css';
import { AssetBrowserContent } from './AssetBrowserContent';
import { useAssetBrowserContext, useAssetDrag } from './AssetBrowserContext';

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
 * file-import overlay. When the consumer supplies `renderEmptyContextMenu`, the
 * surface becomes a right-click target for the empty-area menu; per-cell menus
 * stop at the cell, so a right-click on a cell opens the item menu instead.
 */
export function AssetBrowserSurface({
  onDragOver,
  onDragLeave,
  onDrop,
}: AssetBrowserSurfaceProps): React.ReactElement {
  const { renderEmptyContextMenu } = useAssetBrowserContext();

  const surface = (
    <div
      className={main}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <AssetBrowserContent />
      <ImportOverlay />
    </div>
  );

  if (!renderEmptyContextMenu) return surface;
  return (
    <ContextMenu>
      <ContextMenu.Trigger render={surface} />
      <ContextMenu.Content>{renderEmptyContextMenu()}</ContextMenu.Content>
    </ContextMenu>
  );
}
