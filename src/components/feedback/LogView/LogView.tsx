'use client';

import React, {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useControlledState } from '@/hooks/useControlledState';
import { useLatest } from '@/hooks/useLatest';
import { useMergedRef } from '@/hooks/useMergedRef';
import { cx } from '@/utils/cx';
import { devWarn } from '@/utils/devWarn';

import { rootRecipe, toolbarSpacerStyle } from './LogView.css';
import { LogViewBody } from './LogViewBody';
import { LogViewContext } from './LogViewContext';
import { resolveLevelDefinition, resolveLevelOrder } from './logViewLevels';
import {
  LogViewClear,
  LogViewCopy,
  LogViewFooter,
  LogViewLevelFilter,
  LogViewSearch,
  LogViewToolbar,
} from './LogViewParts';
import { LogViewStore } from './LogViewStore';
import { defaultFormatTimestamp, filterEntries } from './logViewUtils';

import type {
  LogEntry,
  LogLevel,
  LogViewHandle,
  LogViewProps,
  ResolvedLogEntry,
} from './LogView.types';
import type { LogViewContextValue } from './LogViewContext';
import type { ResolvedLevelDefinition } from './logViewLevels';

const LogViewRoot = ({
  entries,
  defaultEntries,
  maxEntries,
  getEntryId,
  query: queryProp,
  defaultQuery,
  onQueryChange,
  caseSensitive = false,
  levels: levelsProp,
  defaultLevels,
  onLevelsChange,
  levelConfig,
  levelOrder: levelOrderProp,
  follow: followProp,
  defaultFollow = true,
  onFollowChange,
  wrap = false,
  density = 'compact',
  showTimestamps = false,
  formatTimestamp = defaultFormatTimestamp,
  showSource = true,
  showToolbar = true,
  showSearch = true,
  showLevelFilter = true,
  showClear = true,
  showCopy = true,
  virtualized = 'auto',
  virtualizationThreshold = 100,
  estimatedRowHeight,
  overscan = 12,
  selectionMode = false,
  selectedIds: selectedIdsProp,
  defaultSelectedIds,
  onSelectionChange,
  height = 320,
  maxHeight,
  renderEntry,
  emptyState,
  footer,
  onClear,
  onEntryClick,
  onCopy,
  slotProps,
  children,
  className,
  style,
  testId,
  ref,
  'aria-label': ariaLabel = 'Log output',
  ...rest
}: LogViewProps): React.ReactElement => {
  const rootRef = useRef<HTMLDivElement>(null);
  const setRootRef = useMergedRef<HTMLDivElement>(rootRef);
  const bodyId = useId();

  // One store per LogView instance. Created once; later prop changes flow
  // through the effects below (the same per-instance store pattern as Viewport).
  const store = useMemo(
    () =>
      new LogViewStore({
        initial: entries ?? defaultEntries,
        maxEntries,
        getEntryId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store is created once; prop updates are mirrored via effects.
    []
  );

  const isControlled = entries !== undefined;
  const isControlledRef = useLatest(isControlled);

  // Mirror the controlled entries prop into the store.
  useLayoutEffect(() => {
    if (entries !== undefined) store.setEntries(entries);
  }, [entries, store]);

  useEffect(() => {
    store.setMaxEntries(maxEntries);
  }, [maxEntries, store]);

  useEffect(() => {
    store.setGetEntryId(getEntryId);
  }, [getEntryId, store]);

  useEffect(
    () => () => {
      store.dispose();
    },
    [store]
  );

  // ── Levels ──
  const levelOrder = useMemo(
    () => resolveLevelOrder(levelConfig, levelOrderProp),
    [levelConfig, levelOrderProp]
  );

  const knownLevels = useMemo(
    () => new Set<LogLevel>(levelOrder),
    [levelOrder]
  );

  // Visibility is tracked as the set of *hidden* levels (uncontrolled) so the
  // active set can be derived as "known minus hidden". A level introduced later
  // via `levelConfig` is therefore visible by default, while an explicit
  // toggle-off survives changes to `levelOrder`. In controlled mode the
  // `levels` prop is the source of truth and this state is unused.
  const isLevelsControlled = levelsProp !== undefined;
  const [hiddenLevels, setHiddenLevels] = useState<ReadonlySet<LogLevel>>(() =>
    defaultLevels === undefined
      ? new Set<LogLevel>()
      : new Set(levelOrder.filter(level => !defaultLevels.includes(level)))
  );

  const activeLevels = useMemo<ReadonlySet<LogLevel>>(() => {
    if (isLevelsControlled) return new Set(levelsProp);
    return new Set(levelOrder.filter(level => !hiddenLevels.has(level)));
  }, [isLevelsControlled, levelsProp, levelOrder, hiddenLevels]);

  const isLevelActive = useCallback(
    (level: LogLevel) => activeLevels.has(level),
    [activeLevels]
  );

  // Read live values through refs so the toggle handler stays identity-stable.
  const onLevelsChangeRef = useLatest(onLevelsChange);
  const activeLevelsRef = useLatest(activeLevels);
  const levelOrderRef = useLatest(levelOrder);
  const isLevelsControlledRef = useLatest(isLevelsControlled);

  const toggleLevel = useCallback(
    (level: LogLevel) => {
      const willHide = activeLevelsRef.current.has(level);
      if (!isLevelsControlledRef.current) {
        setHiddenLevels(prev => {
          const next = new Set(prev);
          if (willHide) next.add(level);
          else next.delete(level);
          return next;
        });
      }
      // Emit the next visible set, ordered by `levelOrder`, in both modes.
      const visible = levelOrderRef.current.filter(other =>
        other === level ? !willHide : activeLevelsRef.current.has(other)
      );
      onLevelsChangeRef.current?.(visible);
    },
    [activeLevelsRef, isLevelsControlledRef, levelOrderRef, onLevelsChangeRef]
  );

  const getLevelDefinition = useCallback(
    (level: LogLevel): ResolvedLevelDefinition =>
      resolveLevelDefinition(level, levelConfig),
    [levelConfig]
  );

  // ── Filter / follow state ──
  const [query, setQuery] = useControlledState<string>({
    value: queryProp,
    defaultValue: defaultQuery,
    onChange: onQueryChange,
    fallback: '',
  });
  const queryRef = useLatest(query);

  const [follow, setFollow] = useControlledState<boolean>({
    value: followProp,
    defaultValue: defaultFollow,
    onChange: onFollowChange,
    fallback: true,
  });

  // ── Selection ──
  const [selection, setSelection] = useControlledState<readonly string[]>({
    value: selectedIdsProp,
    defaultValue: defaultSelectedIds,
    onChange: onSelectionChange as
      | ((value: readonly string[]) => void)
      | undefined,
    fallback: [],
  });
  const selectedIds = useMemo(() => new Set(selection), [selection]);
  const setSelectedIds = useCallback(
    (ids: ReadonlySet<string>) => {
      setSelection([...ids]);
    },
    [setSelection]
  );

  // ── Actions ──
  const onClearRef = useLatest(onClear);
  const clearLog = useCallback(() => {
    if (!isControlledRef.current) store.clear();
    setSelection([]);
    onClearRef.current?.();
  }, [store, isControlledRef, onClearRef, setSelection]);

  // Uses the live query (via ref), not the body's deferred query: this powers
  // Copy, an explicit user action, so it should reflect exactly what is typed.
  const getVisibleEntries = useCallback(
    (): ResolvedLogEntry[] =>
      filterEntries(store.getEntries(), {
        query: queryRef.current,
        caseSensitive,
        knownLevels,
        activeLevels,
      }),
    [store, queryRef, caseSensitive, knownLevels, activeLevels]
  );

  const selectedIdsRef = useLatest(selectedIds);
  const getCopyEntries = useCallback((): ResolvedLogEntry[] => {
    const ids = selectedIdsRef.current;
    if (ids.size > 0) {
      return store.getEntries().filter(entry => ids.has(entry.id));
    }
    return getVisibleEntries();
  }, [store, selectedIdsRef, getVisibleEntries]);

  // ── Imperative handle ──
  useImperativeHandle(
    ref,
    (): LogViewHandle => ({
      append: (entry: LogEntry) => {
        if (isControlledRef.current) {
          devWarn(
            '[LogView] handle.append() is a no-op while `entries` is controlled. ' +
              'Append to your `entries` state instead, or drop the prop to go uncontrolled.'
          );
          return;
        }
        store.append(entry);
      },
      appendMany: (next: readonly LogEntry[]) => {
        if (isControlledRef.current) {
          devWarn(
            '[LogView] handle.appendMany() is a no-op while `entries` is controlled.'
          );
          return;
        }
        store.appendMany(next);
      },
      clear: clearLog,
      scrollToBottom: () => {
        store.scrollToBottom();
      },
      scrollToIndex: (index: number) => {
        store.scrollToIndex(index);
      },
      getEntries: () => store.getEntries(),
      getElement: () => rootRef.current,
    }),
    [store, isControlledRef, clearLog]
  );

  // ── Context ──
  const contextValue = useMemo<LogViewContextValue>(
    () => ({
      store,
      query,
      setQuery,
      caseSensitive,
      activeLevels,
      knownLevels,
      isLevelActive,
      toggleLevel,
      follow,
      setFollow,
      levelOrder,
      getLevelDefinition,
      wrap,
      density,
      showTimestamps,
      formatTimestamp,
      showSource,
      virtualized,
      virtualizationThreshold,
      estimatedRowHeight,
      overscan,
      selectionMode,
      selectedIds,
      setSelectedIds,
      renderEntry,
      emptyState,
      onEntryClick,
      onCopy,
      clearLog,
      bodyId,
      getVisibleEntries,
      getCopyEntries,
    }),
    [
      store,
      query,
      setQuery,
      caseSensitive,
      activeLevels,
      knownLevels,
      isLevelActive,
      toggleLevel,
      follow,
      setFollow,
      levelOrder,
      getLevelDefinition,
      wrap,
      density,
      showTimestamps,
      formatTimestamp,
      showSource,
      virtualized,
      virtualizationThreshold,
      estimatedRowHeight,
      overscan,
      selectionMode,
      selectedIds,
      setSelectedIds,
      renderEntry,
      emptyState,
      onEntryClick,
      onCopy,
      clearLog,
      bodyId,
      getVisibleEntries,
      getCopyEntries,
    ]
  );

  const rootStyle: React.CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    ...(maxHeight !== undefined
      ? {
          maxHeight:
            typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }
      : {}),
    ...style,
  };

  const defaultComposition = (
    <>
      {showToolbar && (
        <LogViewToolbar {...slotProps?.toolbar}>
          {showSearch && <LogViewSearch {...slotProps?.search} />}
          {showLevelFilter && (
            <LogViewLevelFilter {...slotProps?.levelFilter} />
          )}
          <div className={toolbarSpacerStyle} />
          {showCopy && <LogViewCopy {...slotProps?.copy} />}
          {showClear && <LogViewClear {...slotProps?.clear} />}
        </LogViewToolbar>
      )}
      <LogViewBody {...slotProps?.body} />
      {footer != null && (
        <LogViewFooter {...slotProps?.footer}>{footer}</LogViewFooter>
      )}
    </>
  );

  return (
    <LogViewContext.Provider value={contextValue}>
      <div
        ref={setRootRef}
        className={cx(rootRecipe({ density }), className)}
        style={rootStyle}
        data-testid={testId}
        aria-label={ariaLabel}
        {...rest}
      >
        {children ?? defaultComposition}
      </div>
    </LogViewContext.Provider>
  );
};

LogViewRoot.displayName = 'LogView';

interface LogViewComponent {
  (props: LogViewProps): React.ReactElement;
  displayName?: string;
  Toolbar: typeof LogViewToolbar;
  Footer: typeof LogViewFooter;
  Search: typeof LogViewSearch;
  LevelFilter: typeof LogViewLevelFilter;
  Clear: typeof LogViewClear;
  Copy: typeof LogViewCopy;
  Body: typeof LogViewBody;
}

/**
 * A virtualized console / log output panel.
 *
 * Renders a large, append-only stream of {@link LogEntry} efficiently
 * (virtualized via `@tanstack/react-virtual`), with level coloring, level
 * filtering, text search with match highlighting, follow-tail auto-scroll, per
 * line and bulk copy, timestamps, and source tags.
 *
 * **Data flow.** Pass a controlled `entries` array, or go uncontrolled and push
 * via the imperative handle — `ref.append(entry)` / `appendMany` / `clear` are
 * rAF-batched, so a high-frequency stream collapses to one render per frame.
 *
 * **Composition.** Use it batteries-included (default toolbar + body), or
 * compose the slots yourself: `LogView.Toolbar`, `LogView.Search`,
 * `LogView.LevelFilter`, `LogView.Copy`, `LogView.Clear`, `LogView.Body`.
 *
 * @example Uncontrolled streaming
 * ```tsx
 * const ref = useRef<LogViewHandle>(null);
 * useEffect(() => {
 *   const id = setInterval(() => {
 *     ref.current?.append({ level: 'info', message: 'tick', timestamp: Date.now() });
 *   }, 50);
 *   return () => clearInterval(id);
 * }, []);
 * return <LogView ref={ref} showTimestamps height={360} />;
 * ```
 *
 * @example Custom composition
 * ```tsx
 * <LogView entries={entries} wrap>
 *   <LogView.Toolbar>
 *     <LogView.LevelFilter />
 *     <LogView.Search />
 *   </LogView.Toolbar>
 *   <LogView.Body />
 * </LogView>
 * ```
 */
export const LogView = LogViewRoot as LogViewComponent;

LogView.Toolbar = LogViewToolbar;
LogView.Footer = LogViewFooter;
LogView.Search = LogViewSearch;
LogView.LevelFilter = LogViewLevelFilter;
LogView.Clear = LogViewClear;
LogView.Copy = LogViewCopy;
LogView.Body = LogViewBody;
