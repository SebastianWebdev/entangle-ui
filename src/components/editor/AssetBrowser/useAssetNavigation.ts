'use client';

import { useCallback, useEffect, useMemo } from 'react';

import { useLatest, useNavigationHistory } from '@/hooks';

import type {
  AssetItem,
  AssetNavigationSource,
  AssetPathSegment,
} from './AssetBrowser.types';
import type { KeyboardEvent } from 'react';

export interface UseAssetNavigationOptions {
  /** Enables Back/Forward + parent-nav. When false, the hook is a thin pass-through. */
  history: boolean;
  /** Current location (oldest → newest). Used to resolve "go to parent". */
  path: readonly AssetPathSegment[];
  /** Seeds the history stack on mount. */
  currentFolderId: string | undefined;
  onNavigate?: (folderId: string, source: AssetNavigationSource) => void;
  onItemOpen?: (item: AssetItem) => void;
}

export interface AssetNavigationApi {
  /** Pass-through for navigation (breadcrumb / sidebar / folder open). Pushes onto history. */
  navigate: (folderId: string, source: AssetNavigationSource) => void;
  /** Open a file or enter a folder (file → onItemOpen; folder → navigate). */
  activateItem: (item: AssetItem) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  /** Pass-through of the prop so consumers can gate UI on it. */
  history: boolean;
  /** Attach to the AssetBrowser root: Backspace / Alt+ArrowUp → parent folder. */
  handleRootKeyDown: (event: KeyboardEvent) => void;
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
 * Folder navigation + back/forward stack + "go to parent" keyboard shortcuts,
 * built on top of the library's `useNavigationHistory` primitive. Every handler
 * has a stable identity (`useCallback`) and reads the latest props through
 * `useLatest` refs, matching `component-patterns.md` rules #3/#11.
 */
export function useAssetNavigation(
  options: UseAssetNavigationOptions
): AssetNavigationApi {
  const { history, path, onNavigate, onItemOpen, currentFolderId } = options;

  const histApi = useNavigationHistory({
    initial: currentFolderId,
    enabled: history,
  });
  const { push, canGoBack, canGoForward } = histApi;
  const histGoBack = histApi.goBack;
  const histGoForward = histApi.goForward;

  // Keep the back/forward stack in sync with the controlled `currentFolderId`.
  // `useNavigationHistory` only seeds `initial` once on mount, so an out-of-band
  // change (deep link, "reveal in browser", or a parent that updates
  // `currentFolderId` without routing through `navigate`) would otherwise leave
  // the stack — and `canGoBack`/`canGoForward` — stale. `push` no-ops when the
  // entry already equals the current one, so navigate/back/forward (which leave
  // `current === currentFolderId`) don't double-push and the forward branch
  // survives; only a genuine external change advances the stack. This is the
  // "mirror React state into an external store" bridge that component-patterns.md
  // §2 lists as a legitimate `useEffect` use.
  useEffect(() => {
    if (!history || currentFolderId === undefined) return;
    push(currentFolderId);
  }, [history, currentFolderId, push]);

  const onNavigateRef = useLatest(onNavigate);
  const onItemOpenRef = useLatest(onItemOpen);
  const historyRef = useLatest(history);
  const pathRef = useLatest(path);

  const navigate = useCallback(
    (folderId: string, source: AssetNavigationSource): void => {
      push(folderId);
      onNavigateRef.current?.(folderId, source);
    },
    [push, onNavigateRef]
  );

  const goBack = useCallback((): void => {
    const target = histGoBack();
    if (target === undefined) return;
    onNavigateRef.current?.(target, 'back');
  }, [histGoBack, onNavigateRef]);

  const goForward = useCallback((): void => {
    const target = histGoForward();
    if (target === undefined) return;
    onNavigateRef.current?.(target, 'forward');
  }, [histGoForward, onNavigateRef]);

  const activateItem = useCallback(
    (item: AssetItem): void => {
      if (item.kind === 'folder') navigate(item.id, 'open');
      else onItemOpenRef.current?.(item);
    },
    [navigate, onItemOpenRef]
  );

  const handleRootKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (!historyRef.current) return;
      if (isEditableTarget(event.target)) return;
      const goToParent =
        event.key === 'Backspace' || (event.altKey && event.key === 'ArrowUp');
      if (!goToParent) return;
      const currentPath = pathRef.current;
      const parent = currentPath[currentPath.length - 2];
      if (parent) {
        event.preventDefault();
        navigate(parent.id, 'breadcrumb');
      }
    },
    [navigate, historyRef, pathRef]
  );

  return useMemo(
    () => ({
      navigate,
      activateItem,
      goBack,
      goForward,
      canGoBack,
      canGoForward,
      history,
      handleRootKeyDown,
    }),
    [
      navigate,
      activateItem,
      goBack,
      goForward,
      canGoBack,
      canGoForward,
      history,
      handleRootKeyDown,
    ]
  );
}
