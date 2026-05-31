'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { Input } from '@/components/primitives/Input';

import { renameField } from './AssetBrowser.css';
import { useAssetBrowserContext } from './AssetBrowserContext';

import type { AssetItem } from './AssetBrowser.types';

export interface AssetBrowserRenameFieldProps {
  item: AssetItem;
}

/**
 * Inline label editor shown in place of a grid cell's name while the cell is
 * the rename target. Owns only the transient text buffer; the "is editing" flag
 * lives in the store. Commits on Enter / blur (changed value), cancels on
 * Escape, and stops key propagation so the grid's roving navigation doesn't
 * steal keystrokes.
 */
export function AssetBrowserRenameField({
  item,
}: AssetBrowserRenameFieldProps): React.ReactElement {
  const { mutations, labels } = useAssetBrowserContext();
  const [value, setValue] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);
  // Guard against the blur fired by our own Enter/Escape commit double-firing.
  const committedRef = useRef(false);

  // Focus + select the basename once, after the field mounts.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  const commit = useCallback((): void => {
    if (committedRef.current) return;
    committedRef.current = true;
    void mutations.commitRename(item, value).then(accepted => {
      // Rejected name → reopen for another attempt.
      if (!accepted) committedRef.current = false;
    });
  }, [mutations, item, value]);

  const cancel = useCallback((): void => {
    committedRef.current = true;
    mutations.cancelRename();
  }, [mutations]);

  return (
    <Input
      ref={inputRef}
      className={renameField}
      size="sm"
      value={value}
      aria-label={`${labels.rename} ${item.name}`}
      onChange={setValue}
      onKeyDown={e => {
        // Keep arrows / Space / type-ahead inside the field, away from the grid.
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancel();
        }
      }}
      onBlur={commit}
      onClick={e => {
        // A click on the field shouldn't reselect / navigate the cell.
        e.stopPropagation();
      }}
      onDoubleClick={e => {
        e.stopPropagation();
      }}
    />
  );
}
