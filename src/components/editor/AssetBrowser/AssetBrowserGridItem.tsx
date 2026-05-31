'use client';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import React, { useState } from 'react';

import {
  CodeIcon,
  EyeDropperIcon,
  FileTextIcon,
  FolderIcon,
  GridIcon,
  PlayIcon,
} from '@/components/Icons';
import { ContextMenu } from '@/components/navigation/ContextMenu';
import { Icon } from '@/components/primitives/Icon';

import {
  cellLabel,
  cellRecipe,
  cellWidthVar,
  cellHeightVar,
  thumb,
  thumbImage,
  thumbSizeVar,
} from './AssetBrowser.css';
import {
  useAssetBrowserContext,
  useAssetDropTarget,
  useAssetEditing,
  useAssetFocused,
  useAssetSelected,
  useAssetSelection,
} from './AssetBrowserContext';
import { DefaultItemMenu } from './AssetBrowserDefaultMenus';
import { cellDomId, cellHeight, cellWidth } from './assetBrowserGeometry';
import { AssetBrowserRenameField } from './AssetBrowserRenameField';

import type {
  AssetItem,
  AssetItemActions,
  AssetType,
} from './AssetBrowser.types';

export interface AssetBrowserGridItemProps {
  item: AssetItem;
  index: number;
  /** Grid `useId` base — builds the cell `id` for `aria-activedescendant`. */
  gridId: string;
  /** Current column count — derives 1-based `aria-rowindex`/`aria-colindex`. */
  columns: number;
}

/**
 * Type-derived fallback glyph for files without a thumbnail or explicit `icon`.
 * Only the asset types whose fallback is actually seen (image/model usually
 * carry a thumbnail) get a distinct icon; the rest share the generic file icon.
 */
function typeFallbackIcon(
  assetType: AssetType | undefined
): React.ReactElement {
  switch (assetType) {
    case 'material':
      return <EyeDropperIcon />;
    case 'audio':
    case 'video':
      return <PlayIcon />;
    case 'scene':
      return <GridIcon />;
    case 'text':
      return <CodeIcon />;
    default:
      return <FileTextIcon />;
  }
}

function FallbackIcon({ item }: { item: AssetItem }): React.ReactElement {
  if (item.icon) return <>{item.icon}</>;
  return (
    <Icon size="lg" color="muted" decorative>
      {item.kind === 'folder' ? (
        <FolderIcon />
      ) : (
        typeFallbackIcon(item.assetType)
      )}
    </Icon>
  );
}

function Thumbnail({
  item,
  thumbPx,
  selected,
}: {
  item: AssetItem;
  thumbPx: number;
  selected: boolean;
}): React.ReactElement {
  const { renderThumbnail } = useAssetBrowserContext();
  const custom = renderThumbnail?.(item, { size: thumbPx, selected });
  // Broken / expired / CORS-failed thumbnail URLs fall back to the type icon
  // instead of the browser's broken-image glyph. The error flag resets when the
  // source changes via the adjust-state-during-render pattern (a previous-prop
  // sentinel in state — component-patterns.md §14), so no effect is needed.
  const [errored, setErrored] = useState(false);
  const [errorUrl, setErrorUrl] = useState(item.thumbnailUrl);
  if (item.thumbnailUrl !== errorUrl) {
    setErrorUrl(item.thumbnailUrl);
    setErrored(false);
  }
  const showImg = !custom && item.thumbnailUrl !== undefined && !errored;
  return (
    <div className={thumb}>
      {custom ??
        (showImg ? (
          <img
            className={thumbImage}
            src={item.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => {
              setErrored(true);
            }}
          />
        ) : (
          <FallbackIcon item={item} />
        ))}
    </div>
  );
}

/**
 * Body of the per-item right-click menu. Rendered only while the menu is open
 * (base-ui unmounts closed popups), so reading the whole selection set here
 * doesn't re-render closed cells. Resolves the acted-on items (the full
 * selection when the right-clicked item is part of it, otherwise just that
 * item), builds the mutation `actions` bound to them, and renders either the
 * consumer's `renderItemContextMenu` or the auto-generated default menu.
 */
function ItemContextMenuContent({
  item,
}: {
  item: AssetItem;
}): React.ReactElement {
  const ctx = useAssetBrowserContext();
  const selection = useAssetSelection();
  const items = selection.has(item.id)
    ? ctx.displayedItems.filter(it => selection.has(it.id))
    : [item];

  const actions: AssetItemActions = {
    items,
    rename: () => {
      const target = items[0];
      if (target) ctx.mutations.beginRename(target.id);
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

function GridItemImpl({
  item,
  index,
  gridId,
  columns,
}: AssetBrowserGridItemProps): React.ReactElement {
  const ctx = useAssetBrowserContext();
  const selected = useAssetSelected(item.id);
  const focused = useAssetFocused(item.id);
  const dropActive = useAssetDropTarget(item.id);
  const editing = useAssetEditing(item.id);

  const isDropTarget = item.kind === 'folder' && dropActive;
  const thumbPx = ctx.thumbnailSizePx;
  // 1-based grid position for assistive tech, computed from display index so it
  // reflects true totals even though only the virtualization window is mounted.
  const cols = Math.max(1, columns);
  const ariaRowIndex = Math.floor(index / cols) + 1;
  const ariaColIndex = (index % cols) + 1;

  const isDraggable = item.draggable !== false && item.disabled !== true;
  const isFolderTarget =
    item.kind === 'folder' &&
    item.droppable !== false &&
    ctx.dnd.internalEnabled;

  const inner = ctx.renderItem ? (
    ctx.renderItem(item, {
      selected,
      focused,
      index,
      view: 'grid',
      dropTarget: isDropTarget,
    })
  ) : (
    <>
      <Thumbnail item={item} thumbPx={thumbPx} selected={selected} />
      {editing ? (
        <AssetBrowserRenameField item={item} />
      ) : (
        <span className={cellLabel}>{item.name}</span>
      )}
    </>
  );

  const cell = (
    // Keyboard interaction is centralized at the grid level: cells use roving
    // tabIndex and AssetBrowserGrid's onKeyDown drives Enter/Space/arrow nav,
    // so a redundant per-cell key handler is intentionally omitted.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      role="gridcell"
      id={cellDomId(gridId, item.id)}
      data-asset-id={item.id}
      aria-selected={selected}
      aria-label={item.name}
      aria-rowindex={ariaRowIndex}
      aria-colindex={ariaColIndex}
      title={item.name}
      tabIndex={focused ? 0 : -1}
      className={cellRecipe({
        selected,
        dropTarget: isDropTarget,
        disabled: item.disabled === true,
      })}
      style={assignInlineVars({
        [cellWidthVar]: `${cellWidth(thumbPx)}px`,
        [cellHeightVar]: `${cellHeight(thumbPx)}px`,
        [thumbSizeVar]: `${thumbPx}px`,
      })}
      // While renaming, the cell is non-interactive for selection/open/drag —
      // clicks on the thumbnail above the field must not reselect or navigate.
      draggable={isDraggable && !editing}
      onClick={
        editing
          ? undefined
          : e => {
              ctx.handleItemClick(item, index, e);
            }
      }
      onDoubleClick={
        editing
          ? undefined
          : () => {
              ctx.activateItem(item);
            }
      }
      onContextMenu={() => {
        ctx.contextMenuSelect(item);
      }}
      onDragStart={
        isDraggable && !editing
          ? e => {
              ctx.dnd.onItemDragStart(item, e);
            }
          : undefined
      }
      onDragEnd={
        isDraggable
          ? e => {
              ctx.dnd.onItemDragEnd(item, e);
            }
          : undefined
      }
      onDragOver={
        isFolderTarget
          ? e => {
              ctx.dnd.onFolderDragOver(item.id, e);
            }
          : undefined
      }
      onDragLeave={
        isFolderTarget
          ? e => {
              ctx.dnd.onFolderDragLeave(item.id, e);
            }
          : undefined
      }
      onDrop={
        isFolderTarget
          ? e => {
              ctx.dnd.onFolderDrop(item.id, e);
            }
          : undefined
      }
    >
      {inner}
    </div>
  );

  // Per-item right-click menu is opt-in: wrap when the consumer supplies
  // `renderItemContextMenu`, or when `defaultItemActions` is on and at least one
  // item-level mutation exists. base-ui's `render` prop makes the cell itself the
  // trigger (no extra wrapper, so the cell stays a direct grid child), and the
  // closed popup renders nothing — so unopened cells pay no menu-body cost.
  const hasDefaultItemMenu =
    ctx.defaultItemActions &&
    (ctx.mutations.canRename ||
      ctx.mutations.canDelete ||
      ctx.mutations.canDuplicate);
  if (!ctx.renderItemContextMenu && !hasDefaultItemMenu) return cell;
  return (
    <ContextMenu>
      <ContextMenu.Trigger render={cell} />
      <ContextMenu.Content>
        <ItemContextMenuContent item={item} />
      </ContextMenu.Content>
    </ContextMenu>
  );
}

export const AssetBrowserGridItem = /*#__PURE__*/ React.memo(GridItemImpl);
AssetBrowserGridItem.displayName = 'AssetBrowserGridItem';
