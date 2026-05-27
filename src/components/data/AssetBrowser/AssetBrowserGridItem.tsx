'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { Icon } from '@/components/primitives/Icon';
import { FileTextIcon, FolderIcon } from '@/components/Icons';
import { cx } from '@/utils/cx';
import type { AssetItem } from './AssetBrowser.types';
import {
  useAssetBrowserContext,
  useAssetDrag,
  useAssetFocus,
} from './AssetBrowserContext';
import {
  cellLabel,
  cellRecipe,
  cellWidthVar,
  cellHeightVar,
  thumb,
  thumbImage,
  thumbSizeVar,
} from './AssetBrowser.css';
import { cellHeight, cellWidth } from './assetBrowserGeometry';

export interface AssetBrowserGridItemProps {
  item: AssetItem;
  index: number;
}

function FallbackIcon({ item }: { item: AssetItem }): React.ReactElement {
  if (item.icon) return <>{item.icon}</>;
  return (
    <Icon size="lg" color="muted" decorative>
      {item.kind === 'folder' ? <FolderIcon /> : <FileTextIcon />}
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
  return (
    <div className={thumb}>
      {custom ??
        (item.thumbnailUrl ? (
          <img
            className={thumbImage}
            src={item.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <FallbackIcon item={item} />
        ))}
    </div>
  );
}

function GridItemImpl({
  item,
  index,
}: AssetBrowserGridItemProps): React.ReactElement {
  const ctx = useAssetBrowserContext();
  const focusedId = useAssetFocus();
  const drag = useAssetDrag();

  const selected = ctx.selection.has(item.id);
  const focused = focusedId === item.id;
  const isDropTarget =
    item.kind === 'folder' && drag.active && drag.dropTargetId === item.id;
  const thumbPx = ctx.thumbnailSizePx;

  const isDraggable = item.draggable !== false && item.disabled !== true;
  const isFolderTarget =
    item.kind === 'folder' &&
    item.droppable !== false &&
    ctx.dnd.internalEnabled;

  if (ctx.renderItem) {
    return (
      <div
        role="gridcell"
        data-asset-id={item.id}
        aria-selected={selected}
        tabIndex={focused ? 0 : -1}
      >
        {ctx.renderItem(item, {
          selected,
          focused,
          index,
          view: 'grid',
          dropTarget: isDropTarget,
        })}
      </div>
    );
  }

  return (
    <div
      role="gridcell"
      data-asset-id={item.id}
      aria-selected={selected}
      aria-label={item.name}
      tabIndex={focused ? 0 : -1}
      className={cx(
        cellRecipe({
          selected,
          dropTarget: isDropTarget,
          disabled: item.disabled === true,
        })
      )}
      style={assignInlineVars({
        [cellWidthVar]: `${cellWidth(thumbPx)}px`,
        [cellHeightVar]: `${cellHeight(thumbPx)}px`,
        [thumbSizeVar]: `${thumbPx}px`,
      })}
      draggable={isDraggable}
      onClick={e => ctx.handleItemClick(item, index, e)}
      onDoubleClick={() => ctx.activateItem(item)}
      onContextMenu={() => ctx.contextMenuSelect(item, index)}
      onDragStart={
        isDraggable ? e => ctx.dnd.onItemDragStart(item, e) : undefined
      }
      onDragEnd={isDraggable ? e => ctx.dnd.onItemDragEnd(item, e) : undefined}
      onDragOver={
        isFolderTarget ? e => ctx.dnd.onFolderDragOver(item.id, e) : undefined
      }
      onDragLeave={
        isFolderTarget ? e => ctx.dnd.onFolderDragLeave(item.id, e) : undefined
      }
      onDrop={
        isFolderTarget ? e => ctx.dnd.onFolderDrop(item.id, e) : undefined
      }
    >
      <Thumbnail item={item} thumbPx={thumbPx} selected={selected} />
      <span className={cellLabel}>{item.name}</span>
    </div>
  );
}

export const AssetBrowserGridItem = /*#__PURE__*/ React.memo(GridItemImpl);
AssetBrowserGridItem.displayName = 'AssetBrowserGridItem';
