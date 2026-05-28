'use client';

import { useEffectEvent, useMemo, type KeyboardEvent } from 'react';
import { useNavigationHistory } from '@/hooks';
import type {
  AssetItem,
  AssetNavigationSource,
  AssetPathSegment,
} from './AssetBrowser.types';

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
 * is a `useEffectEvent`, so identities are stable for the component lifetime
 * but bodies always read the latest props.
 */
export function useAssetNavigation(
  options: UseAssetNavigationOptions
): AssetNavigationApi {
  const { history, path, onNavigate, onItemOpen, currentFolderId } = options;

  const histApi = useNavigationHistory<string>({
    initial: currentFolderId,
    enabled: history,
  });
  const { push, canGoBack, canGoForward } = histApi;
  const histGoBack = histApi.goBack;
  const histGoForward = histApi.goForward;

  const navigate = useEffectEvent(
    (folderId: string, source: AssetNavigationSource): void => {
      push(folderId);
      onNavigate?.(folderId, source);
    }
  );

  const goBack = useEffectEvent((): void => {
    const target = histGoBack();
    if (target === undefined) return;
    onNavigate?.(target, 'back');
  });

  const goForward = useEffectEvent((): void => {
    const target = histGoForward();
    if (target === undefined) return;
    onNavigate?.(target, 'forward');
  });

  const activateItem = useEffectEvent((item: AssetItem): void => {
    if (item.kind === 'folder') navigate(item.id, 'open');
    else onItemOpen?.(item);
  });

  const handleRootKeyDown = useEffectEvent((event: KeyboardEvent): void => {
    if (!history) return;
    if (isEditableTarget(event.target)) return;
    const goToParent =
      event.key === 'Backspace' || (event.altKey && event.key === 'ArrowUp');
    if (!goToParent) return;
    const parent = path[path.length - 2];
    if (parent) {
      event.preventDefault();
      navigate(parent.id, 'breadcrumb');
    }
  });

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
