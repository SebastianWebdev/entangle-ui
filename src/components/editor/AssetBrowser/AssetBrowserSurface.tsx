'use client';

import React from 'react';

import { CloudUploadIcon } from '@/components/Icons';
import { ContextMenu } from '@/components/navigation/ContextMenu';
import { Icon } from '@/components/primitives/Icon';

import { importOverlay, main } from './AssetBrowser.css';
import { AssetBrowserContent } from './AssetBrowserContent';
import { useAssetBrowserContext, useAssetDrag } from './AssetBrowserContext';
import { DefaultEmptyMenu } from './AssetBrowserDefaultMenus';

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
 * file-import overlay. Becomes a right-click target for the empty-area menu when
 * the consumer supplies `renderEmptyContextMenu`, or when `defaultItemActions`
 * is on and `onCreateFolder` is set. Per-cell menus stop at the cell, so a
 * right-click on a cell opens the item menu instead.
 */
export function AssetBrowserSurface({
  onDragOver,
  onDragLeave,
  onDrop,
}: AssetBrowserSurfaceProps): React.ReactElement {
  const { renderEmptyContextMenu, defaultItemActions, mutations } =
    useAssetBrowserContext();

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

  const hasDefaultEmptyMenu = defaultItemActions && mutations.canCreateFolder;
  if (!renderEmptyContextMenu && !hasDefaultEmptyMenu) return surface;
  return (
    <ContextMenu>
      <ContextMenu.Trigger render={surface} />
      <ContextMenu.Content>
        {renderEmptyContextMenu ? (
          renderEmptyContextMenu()
        ) : (
          <DefaultEmptyMenu />
        )}
      </ContextMenu.Content>
    </ContextMenu>
  );
}
