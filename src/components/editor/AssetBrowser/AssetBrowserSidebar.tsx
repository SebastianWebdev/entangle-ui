'use client';

import React from 'react';
import { TreeView } from '@/components/controls/TreeView';
import type { TreeNodeData } from '@/components/controls/TreeView';
import { useAssetBrowserContext } from './AssetBrowserContext';
import { sidebar } from './AssetBrowser.css';

export function AssetBrowserSidebar(): React.ReactElement | null {
  const ctx = useAssetBrowserContext();
  if (!ctx.folderTree) return null;

  return (
    <div className={sidebar}>
      <TreeView
        nodes={ctx.folderTree as TreeNodeData[]}
        selectionMode="single"
        selectedIds={ctx.currentFolderId ? [ctx.currentFolderId] : []}
        onSelectionChange={ids => {
          const id = ids[0];
          if (id) ctx.navigate(id, 'sidebar');
        }}
      />
    </div>
  );
}
