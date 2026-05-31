'use client';

import React from 'react';

import { CopyIcon, EditIcon, FolderIcon, TrashIcon } from '@/components/Icons';
import { Menu } from '@/components/navigation/Menu';

import { useAssetBrowserContext } from './AssetBrowserContext';

import type { AssetItemActions } from './AssetBrowser.types';

/**
 * Auto-generated item context-menu body used when `defaultItemActions` is set
 * and the consumer hasn't supplied `renderItemContextMenu`. Renders only the
 * entries whose mutation callback is present. Rename targets a single item.
 */
export function DefaultItemMenu({
  actions,
}: {
  actions: AssetItemActions;
}): React.ReactElement | null {
  const { mutations, labels } = useAssetBrowserContext();
  const single = actions.items.length === 1;

  const entries: React.ReactNode[] = [];
  if (mutations.canRename) {
    entries.push(
      <Menu.Item
        key="rename"
        icon={<EditIcon />}
        shortcut="F2"
        disabled={!single}
        onClick={actions.rename}
      >
        {labels.rename}
      </Menu.Item>
    );
  }
  if (mutations.canDuplicate) {
    entries.push(
      <Menu.Item
        key="duplicate"
        icon={<CopyIcon />}
        onClick={actions.duplicate}
      >
        {labels.duplicate}
      </Menu.Item>
    );
  }
  if (mutations.canDelete) {
    if (entries.length > 0) entries.push(<Menu.Separator key="sep" />);
    entries.push(
      <Menu.Item key="delete" icon={<TrashIcon />} onClick={actions.delete}>
        {labels.delete}
      </Menu.Item>
    );
  }

  if (entries.length === 0) return null;
  return <>{entries}</>;
}

/**
 * Auto-generated empty-area context-menu body used when `defaultItemActions` is
 * set and the consumer hasn't supplied `renderEmptyContextMenu`. Currently just
 * the New-folder entry (when `onCreateFolder` is present).
 */
export function DefaultEmptyMenu(): React.ReactElement | null {
  const { mutations, labels } = useAssetBrowserContext();
  if (!mutations.canCreateFolder) return null;
  return (
    <Menu.Item icon={<FolderIcon />} onClick={mutations.createFolder}>
      {labels.newFolder}
    </Menu.Item>
  );
}
