'use client';

import { useCallback } from 'react';

import { useLatest } from '@/hooks';

import type { AssetBrowserStore } from './AssetBrowserStore';
import type { AssetMutationsApi } from './useAssetMutations';
import type { KeyboardEvent } from 'react';

export interface UseAssetMutationKeyboardOptions {
  store: AssetBrowserStore;
  mutations: AssetMutationsApi;
  /** Live selection set — the F2 rename target falls back to a single selection. */
  selection: ReadonlySet<string>;
}

export interface AssetMutationKeyboard {
  /** Attach to the AssetBrowser root: F2 / Delete / Ctrl+D, view-agnostic. */
  onKeyDown: (event: KeyboardEvent) => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );
}

/**
 * View-agnostic mutation keyboard shortcuts. The same handler is exposed through
 * context (`mutationKeyDown`) and attached by each view to its own scroller —
 * the grid (merged with its 2D nav) and the list wrapper — so the shortcuts
 * work identically in both without relying on event bubbling to the root.
 *
 * - **F2** — inline-rename the focused item, or the sole selected item (the list
 *   has no store roving-focus, so it falls back to a single selection).
 * - **Delete** (and **⌘⌫** on macOS) — delete the selection. Plain `Backspace`
 *   stays reserved for the root's "go to parent" shortcut.
 * - **Ctrl/⌘+D** — duplicate the selection.
 *
 * Each shortcut is a no-op unless its mutation callback is wired, and all are
 * skipped while the focus is in an editable element (search box, rename field).
 * The handler is `useCallback`-stable; live state is read through `useLatest`.
 */
export function useAssetMutationKeyboard(
  options: UseAssetMutationKeyboardOptions
): AssetMutationKeyboard {
  const { store, mutations } = options;
  const mutationsRef = useLatest(mutations);
  const selectionRef = useLatest(options.selection);

  const onKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (isEditableTarget(event.target)) return;
      const key = event.key;
      const m = mutationsRef.current;

      if (
        (event.ctrlKey || event.metaKey) &&
        (key === 'd' || key === 'D') &&
        m.canDuplicate
      ) {
        event.preventDefault();
        m.duplicateItems();
        return;
      }
      if (key === 'F2' && m.canRename) {
        const focusedId = store.getFocusedId();
        const sel = selectionRef.current;
        const targetId =
          focusedId ?? (sel.size === 1 ? [...sel][0] : undefined);
        if (targetId !== undefined) {
          event.preventDefault();
          m.beginRename(targetId);
        }
        return;
      }
      if (
        (key === 'Delete' || (event.metaKey && key === 'Backspace')) &&
        m.canDelete
      ) {
        event.preventDefault();
        m.deleteItems();
      }
    },
    [store, mutationsRef, selectionRef]
  );

  return { onKeyDown };
}
