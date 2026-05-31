'use client';

import React, { useRef, useState } from 'react';

import { ContextMenu } from '@/components/navigation/ContextMenu';

import { contextMenuTrigger } from './AssetBrowser.css';
import {
  useAssetBrowserContext,
  useAssetSelection,
} from './AssetBrowserContext';
import { DefaultEmptyMenu, DefaultItemMenu } from './AssetBrowserDefaultMenus';

import type { AssetItem, AssetItemActions } from './AssetBrowser.types';
import type { AssetBrowserContextValue } from './AssetBrowserContext';

/** Whether any item-level menu can be shown (custom render-prop or auto-built). */
function hasItemMenu(ctx: AssetBrowserContextValue): boolean {
  if (ctx.renderItemContextMenu) return true;
  return (
    ctx.defaultItemActions &&
    (ctx.mutations.canRename ||
      ctx.mutations.canDelete ||
      ctx.mutations.canDuplicate)
  );
}

/** Whether any empty-area menu can be shown. */
function hasEmptyMenu(ctx: AssetBrowserContextValue): boolean {
  if (ctx.renderEmptyContextMenu) return true;
  return ctx.defaultItemActions && ctx.mutations.canCreateFolder;
}

/**
 * Item context-menu body for the right-clicked item. Resolves the acted-on
 * items (the whole selection when the target is part of it, otherwise just the
 * target), builds the mutation `actions` bound to them, and renders either the
 * consumer's `renderItemContextMenu` or the auto-built default menu. Rendered
 * only while the menu is open (base-ui unmounts closed popups).
 */
function ItemMenuBody({ targetId }: { targetId: string }): React.ReactElement {
  const ctx = useAssetBrowserContext();
  const selection = useAssetSelection();
  const target = ctx.displayedItems.find(it => it.id === targetId);
  const items: AssetItem[] = target
    ? selection.has(target.id)
      ? ctx.displayedItems.filter(it => selection.has(it.id))
      : [target]
    : [];

  const actions: AssetItemActions = {
    items,
    rename: () => {
      const first = items[0];
      if (first) ctx.mutations.beginRename(first.id);
    },
    delete: () => {
      ctx.mutations.deleteItems(items);
    },
    duplicate: () => {
      ctx.mutations.duplicateItems(items);
    },
  };

  if (ctx.renderItemContextMenu) {
    return <>{ctx.renderItemContextMenu(items, actions)}</>;
  }
  return <DefaultItemMenu actions={actions} />;
}

/** Empty-area context-menu body (consumer render-prop or the default). */
function EmptyMenuBody(): React.ReactElement {
  const ctx = useAssetBrowserContext();
  if (ctx.renderEmptyContextMenu) return <>{ctx.renderEmptyContextMenu()}</>;
  return <DefaultEmptyMenu />;
}

/**
 * Single, view-agnostic context-menu mechanism for the whole content surface.
 *
 * One `ContextMenu` wraps both the grid and the list. On right-click it walks up
 * from the event target to the nearest item element — a grid cell
 * (`[data-asset-id]`) or a list row (`[data-row-key]`, set by DataTable to the
 * row's id) — to decide whether an **item** was hit (show the item menu + select
 * it) or **empty space** (show the empty-area menu). The same code path runs
 * regardless of view, so grid and list share identical right-click behaviour
 * with no per-cell / per-row wrapping and no DataTable changes.
 *
 * Open state is controlled so a right-click that resolves to no body (e.g. blank
 * space when only an item menu is configured) never opens an empty popup.
 */
export function AssetBrowserContextMenuLayer({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const ctx = useAssetBrowserContext();
  const [open, setOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  // Synchronous mirror of the right-clicked target, read by `onOpenChange`
  // (which fires in the same event, before the `setTargetId` render flushes).
  const targetIdRef = useRef<string | null>(null);

  const itemEnabled = hasItemMenu(ctx);
  const emptyEnabled = hasEmptyMenu(ctx);

  // No menus configured → render the surface untouched.
  if (!itemEnabled && !emptyEnabled) return <>{children}</>;

  const handleContextMenuCapture = (event: React.MouseEvent): void => {
    // Grid cells carry `data-asset-id`; DataTable list rows carry `data-row-key`
    // (the asset id, since `rowKey="id"`). Match either to find the hit item.
    const el =
      event.target instanceof Element
        ? event.target.closest('[data-asset-id], [data-row-key]')
        : null;
    const id =
      el?.getAttribute('data-asset-id') ??
      el?.getAttribute('data-row-key') ??
      null;
    targetIdRef.current = id;
    setTargetId(id);
    if (id) {
      const item = ctx.displayedItems.find(it => it.id === id);
      if (item) ctx.contextMenuSelect(item);
    }
  };

  const showItemBody = targetId !== null && itemEnabled;

  return (
    <ContextMenu
      open={open}
      onOpenChange={next => {
        // Only allow opening when the resolved target has a body to show.
        if (next) {
          const willShow = targetIdRef.current ? itemEnabled : emptyEnabled;
          setOpen(willShow);
        } else {
          setOpen(false);
        }
      }}
    >
      <ContextMenu.Trigger
        render={
          <div
            className={contextMenuTrigger}
            onContextMenuCapture={handleContextMenuCapture}
          >
            {children}
          </div>
        }
      />
      <ContextMenu.Content>
        {showItemBody ? (
          <ItemMenuBody targetId={targetId} />
        ) : emptyEnabled ? (
          <EmptyMenuBody />
        ) : null}
      </ContextMenu.Content>
    </ContextMenu>
  );
}
