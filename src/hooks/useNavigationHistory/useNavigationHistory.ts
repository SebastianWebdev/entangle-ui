'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import type {
  NavigationHistoryApi,
  UseNavigationHistoryOptions,
} from './useNavigationHistory.types';

/**
 * Per-instance back/forward stack. Lives outside React so reads are stable
 * across concurrent renders and so non-React handlers can mutate without
 * scheduling extra renders for unrelated consumers.
 */
class NavigationHistoryStore<T> {
  #stack: T[];
  #index: number;
  #listeners = new Set<() => void>();

  constructor(initial: T | undefined) {
    if (initial !== undefined) {
      this.#stack = [initial];
      this.#index = 0;
    } else {
      this.#stack = [];
      this.#index = -1;
    }
  }

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  getCurrent = (): T | undefined => this.#stack[this.#index];
  getCanGoBack = (): boolean => this.#index > 0;
  getCanGoForward = (): boolean => this.#index < this.#stack.length - 1;

  #notify(): void {
    this.#listeners.forEach(l => l());
  }

  push(entry: T): void {
    if (this.#stack[this.#index] === entry) return;
    const next = this.#stack.slice(0, this.#index + 1);
    next.push(entry);
    this.#stack = next;
    this.#index = next.length - 1;
    this.#notify();
  }

  goBack(): T | undefined {
    if (this.#index <= 0) return undefined;
    this.#index -= 1;
    this.#notify();
    return this.#stack[this.#index];
  }

  goForward(): T | undefined {
    if (this.#index >= this.#stack.length - 1) return undefined;
    this.#index += 1;
    this.#notify();
    return this.#stack[this.#index];
  }

  reset(entry: T | undefined): void {
    if (entry !== undefined) {
      if (
        this.#stack.length === 1 &&
        this.#index === 0 &&
        this.#stack[0] === entry
      ) {
        return;
      }
      this.#stack = [entry];
      this.#index = 0;
    } else {
      if (this.#stack.length === 0) return;
      this.#stack = [];
      this.#index = -1;
    }
    this.#notify();
  }
}

/**
 * Back/forward history primitive. Tracks a stack of entries (`T`) with a
 * cursor, mirrors browser semantics (pushing truncates the forward branch),
 * and exposes the current entry plus `canGoBack` / `canGoForward` flags via
 * `useSyncExternalStore`.
 *
 * Useful any time a UI needs Back/Forward controls over a finite navigation
 * — folder browsers, wizard steps, drill-down inspectors. Generic over the
 * entry type, so it works with ids, paths, route objects, anything stable.
 *
 * @example
 * ```tsx
 * const nav = useNavigationHistory<string>({ initial: 'root' });
 *
 * <Toolbar>
 *   <IconButton aria-label="Back" disabled={!nav.canGoBack} onClick={nav.goBack}>
 *     <ChevronLeftIcon />
 *   </IconButton>
 *   <IconButton aria-label="Forward" disabled={!nav.canGoForward} onClick={nav.goForward}>
 *     <ChevronRightIcon />
 *   </IconButton>
 * </Toolbar>
 * ```
 */
export function useNavigationHistory<T = string>(
  options: UseNavigationHistoryOptions<T> = {}
): NavigationHistoryApi<T> {
  const { initial, enabled = true } = options;

  // Lazy init via useState — the initial value is captured once on mount.
  // Subsequent changes to `initial` are ignored (use `reset()` to re-seed).
  const [store] = useState(() => new NavigationHistoryStore<T>(initial));

  const current = useSyncExternalStore(store.subscribe, store.getCurrent);
  const canGoBackRaw = useSyncExternalStore(
    store.subscribe,
    store.getCanGoBack
  );
  const canGoForwardRaw = useSyncExternalStore(
    store.subscribe,
    store.getCanGoForward
  );

  const canGoBack = enabled && canGoBackRaw;
  const canGoForward = enabled && canGoForwardRaw;

  const push = useCallback(
    (entry: T): void => {
      if (!enabled) return;
      store.push(entry);
    },
    [store, enabled]
  );

  const goBack = useCallback((): T | undefined => {
    if (!enabled) return undefined;
    return store.goBack();
  }, [store, enabled]);

  const goForward = useCallback((): T | undefined => {
    if (!enabled) return undefined;
    return store.goForward();
  }, [store, enabled]);

  const reset = useCallback(
    (entry?: T): void => {
      store.reset(entry);
    },
    [store]
  );

  return useMemo(
    () => ({
      current,
      canGoBack,
      canGoForward,
      push,
      goBack,
      goForward,
      reset,
    }),
    [current, canGoBack, canGoForward, push, goBack, goForward, reset]
  );
}
