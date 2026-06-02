'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { ChevronDownIcon } from '@/components/Icons/ChevronDownIcon';
import { CopyIcon } from '@/components/Icons/CopyIcon';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { useClipboard } from '@/hooks/useClipboard';
import { useLatest } from '@/hooks/useLatest';
import { cx } from '@/utils/cx';

import {
  DENSITY_ROW_HEIGHT,
  bodyDensityRecipe,
  bodyStyle,
  copyLineButtonStyle,
  emptyStateStyle,
  highlightStyle,
  jumpBadgeStyle,
  jumpButtonRecipe,
  levelColorVar,
  messageRecipe,
  plainBodyStyle,
  rowGlyphStyle,
  rowRecipe,
  scrollViewportStyle,
  sourceTagStyle,
  timestampStyle,
  totalHeightVar,
  virtualBodyStyle,
} from './LogView.css';
import { useLogEntries, useLogViewContext } from './LogViewContext';
import { levelVariant } from './logViewLevels';
import {
  entriesToText,
  entryToText,
  filterEntries,
  getHighlightSegments,
} from './logViewUtils';
import { useFollowTail } from './useFollowTail';
import { useLogSelection } from './useLogSelection';

import type {
  LogEntryRenderInfo,
  LogLevel,
  LogViewBodyProps,
  ResolvedLogEntry,
} from './LogView.types';
import type { ResolvedLevelDefinition } from './logViewLevels';

/**
 * True when there is an active (non-collapsed) text selection whose anchor is
 * inside `container`. Scoped to the log body so a selection elsewhere on the
 * page does not suppress a row click or the copy shortcut.
 */
function hasTextSelectionWithin(container: HTMLElement | null): boolean {
  if (
    container === null ||
    typeof window === 'undefined' ||
    typeof window.getSelection !== 'function'
  )
    return false;
  const selection = window.getSelection();
  if (
    selection === null ||
    selection.isCollapsed ||
    selection.toString() === ''
  )
    return false;
  return (
    selection.anchorNode !== null && container.contains(selection.anchorNode)
  );
}

interface LogRowProps {
  entry: ResolvedLogEntry;
  index: number;
  query: string;
  caseSensitive: boolean;
  levelDef: ResolvedLevelDefinition;
  wrap: boolean;
  showTimestamps: boolean;
  formatTimestamp: (timestamp: number | Date) => string;
  showSource: boolean;
  interactive: boolean;
  selectable: boolean;
  selected: boolean;
  renderEntry: ((info: LogEntryRenderInfo) => React.ReactNode) | undefined;
  onRowClick: (
    entry: ResolvedLogEntry,
    index: number,
    event: React.MouseEvent | React.KeyboardEvent
  ) => void;
  onRowKeyDown: (
    entry: ResolvedLogEntry,
    index: number,
    event: React.KeyboardEvent<HTMLDivElement>
  ) => void;
  onCopyLine: (entry: ResolvedLogEntry) => void;
  virtualized: boolean;
  start: number;
  measureRef?: (node: Element | null) => void;
}

/** A single log line. Memoized so scrolling only renders newly-visible rows. */
const LogRow = memo(function LogRow({
  entry,
  index,
  query,
  caseSensitive,
  levelDef,
  wrap,
  showTimestamps,
  formatTimestamp,
  showSource,
  interactive,
  selectable,
  selected,
  renderEntry,
  onRowClick,
  onRowKeyDown,
  onCopyLine,
  virtualized,
  start,
  measureRef,
}: LogRowProps): React.ReactElement {
  const Icon = levelDef.icon;

  const rowStyle: React.CSSProperties = {};
  if (virtualized) rowStyle.transform = `translateY(${start}px)`;
  if (!levelDef.isBuiltIn && levelDef.color !== undefined) {
    Object.assign(
      rowStyle,
      assignInlineVars({ [levelColorVar]: levelDef.color })
    );
  }

  const handleClick = interactive
    ? (event: React.MouseEvent<HTMLDivElement>) => {
        onRowClick(entry, index, event);
      }
    : undefined;
  const handleKeyDown = interactive
    ? (event: React.KeyboardEvent<HTMLDivElement>) => {
        onRowKeyDown(entry, index, event);
      }
    : undefined;

  const segments = getHighlightSegments(entry.message, query, caseSensitive);

  return (
    <div
      ref={measureRef}
      data-index={index}
      data-log-row
      data-log-copy-host
      data-level={entry.level}
      data-selected={selected || undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={selectable ? selected : undefined}
      className={cx(
        rowRecipe({
          level: levelVariant(levelDef),
          virtualized: virtualized || undefined,
          interactive: interactive || undefined,
          selected: selected || undefined,
          align: wrap ? 'start' : 'center',
        })
      )}
      style={rowStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {showTimestamps && entry.timestamp != null && (
        <span className={timestampStyle}>
          {formatTimestamp(entry.timestamp)}
        </span>
      )}

      <span className={rowGlyphStyle} aria-hidden="true">
        {Icon ? <Icon size="md" color="currentColor" /> : null}
      </span>

      {showSource && entry.source != null && entry.source !== '' && (
        <Badge variant="subtle" size="xs" className={sourceTagStyle}>
          {entry.source}
        </Badge>
      )}

      <span className={messageRecipe({ wrap })}>
        {renderEntry
          ? renderEntry({ entry, index, query })
          : segments.map((segment, i) =>
              segment.match ? (
                <mark key={i} className={highlightStyle}>
                  {segment.text}
                </mark>
              ) : (
                <React.Fragment key={i}>{segment.text}</React.Fragment>
              )
            )}
      </span>

      <span className={copyLineButtonStyle} data-log-copy>
        <IconButton
          aria-label="Copy line"
          size="sm"
          variant="ghost"
          onClick={event => {
            event.stopPropagation();
            onCopyLine(entry);
          }}
        >
          <CopyIcon size="md" />
        </IconButton>
      </span>
    </div>
  );
});

/**
 * The virtualized log body. Reads the entry stream from the store, applies the
 * deferred search + level filter, and renders only the visible window via
 * `@tanstack/react-virtual` (mirroring `DataTable`). Owns follow-tail behavior
 * and the floating jump-to-bottom button.
 */
export const LogViewBody = ({
  className,
  style,
  testId,
  ref,
  ...rest
}: LogViewBodyProps): React.ReactElement => {
  const ctx = useLogViewContext();
  const {
    store,
    query,
    caseSensitive,
    activeLevels,
    knownLevels,
    follow,
    setFollow,
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
    getCopyEntries,
    renderEntry,
    emptyState,
    onEntryClick,
    onCopy,
    bodyId,
  } = ctx;

  const entries = useLogEntries(store);
  const deferredQuery = useDeferredValue(query);

  const allLevelsActive = useMemo(() => {
    for (const level of knownLevels) {
      if (!activeLevels.has(level)) return false;
    }
    return true;
  }, [knownLevels, activeLevels]);

  const filtered = useMemo<readonly ResolvedLogEntry[]>(() => {
    if (deferredQuery.trim() === '' && allLevelsActive) return entries;
    return filterEntries(entries, {
      query: deferredQuery,
      caseSensitive,
      knownLevels,
      activeLevels,
    });
  }, [
    entries,
    deferredQuery,
    caseSensitive,
    knownLevels,
    activeLevels,
    allLevelsActive,
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const shouldVirtualize =
    virtualized === true ||
    (virtualized === 'auto' && filtered.length > virtualizationThreshold);

  const rowHeightPx = estimatedRowHeight ?? DENSITY_ROW_HEIGHT[density];

  // TanStack Virtual returns functions that can't be memoized; the Compiler
  // flags it as an incompatible library. Reads are imperative per render.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? filtered.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeightPx,
    overscan,
  });

  const virtualItems = shouldVirtualize ? virtualizer.getVirtualItems() : [];
  const totalSize = shouldVirtualize ? virtualizer.getTotalSize() : 0;

  const { scrollToBottom, isDetached, newSinceDetach } = useFollowTail({
    scrollRef,
    follow,
    setFollow,
    entryCount: filtered.length,
  });

  // Let the imperative handle's scrollToBottom reach this body.
  useEffect(
    () => store.registerScroller(scrollToBottom),
    [store, scrollToBottom]
  );

  // Let the imperative handle's scrollToIndex reach this body.
  const scrollToIndex = useCallback(
    (index: number) => {
      if (shouldVirtualize) {
        virtualizer.scrollToIndex(index, { align: 'auto' });
        return;
      }
      const el = scrollRef.current?.querySelector<HTMLElement>(
        `[data-index="${index}"]`
      );
      el?.scrollIntoView({ block: 'nearest' });
    },
    [shouldVirtualize, virtualizer]
  );

  useEffect(
    () => store.registerScrollToIndex(scrollToIndex),
    [store, scrollToIndex]
  );

  const { copy } = useClipboard();
  const onCopyRef = useLatest(onCopy);

  const handleCopyLine = useCallback(
    (entry: ResolvedLogEntry) => {
      const text = entryToText(entry, { showTimestamps, formatTimestamp });
      void copy(text);
      onCopyRef.current?.(text);
    },
    [copy, showTimestamps, formatTimestamp, onCopyRef]
  );

  const selectable = selectionMode !== false;
  const interactive = selectable || onEntryClick !== undefined;

  const copySelectionOrVisible = useCallback(() => {
    const entries = getCopyEntries();
    if (entries.length === 0) return;
    const text = entriesToText(entries, { showTimestamps, formatTimestamp });
    void copy(text);
    onCopyRef.current?.(text);
  }, [getCopyEntries, showTimestamps, formatTimestamp, copy, onCopyRef]);

  // Scoped to the scroll viewport so a selection elsewhere on the page doesn't
  // suppress a row click or the copy shortcut.
  const isTextSelected = useCallback(
    () => hasTextSelectionWithin(scrollRef.current),
    []
  );

  const { handleRowClick, handleRowKeyDown } = useLogSelection({
    selectionMode,
    selectedIds,
    setSelectedIds,
    filtered,
    onEntryClick,
    isTextSelected,
    onCopyShortcut: copySelectionOrVisible,
  });

  // Resolve level definitions through a per-render-stable cache: `LogRow` is
  // memoized, so handing it a fresh definition object each render would defeat
  // the memo. The cache resets whenever `getLevelDefinition` (i.e. levelConfig)
  // changes.
  const resolveLevelDef = useMemo(() => {
    const cache = new Map<LogLevel, ResolvedLevelDefinition>();
    return (level: LogLevel): ResolvedLevelDefinition => {
      const cached = cache.get(level);
      if (cached !== undefined) return cached;
      const def = getLevelDefinition(level);
      cache.set(level, def);
      return def;
    };
  }, [getLevelDefinition]);

  const renderRow = (entry: ResolvedLogEntry, index: number, start: number) => (
    <LogRow
      key={entry.id}
      entry={entry}
      index={index}
      query={deferredQuery}
      caseSensitive={caseSensitive}
      levelDef={resolveLevelDef(entry.level)}
      wrap={wrap}
      showTimestamps={showTimestamps}
      formatTimestamp={formatTimestamp}
      showSource={showSource}
      interactive={interactive}
      selectable={selectable}
      selected={selectedIds.has(entry.id)}
      renderEntry={renderEntry}
      onRowClick={handleRowClick}
      onRowKeyDown={handleRowKeyDown}
      onCopyLine={handleCopyLine}
      virtualized={shouldVirtualize}
      start={start}
      measureRef={
        shouldVirtualize && wrap ? virtualizer.measureElement : undefined
      }
    />
  );

  const isEmpty = filtered.length === 0;

  return (
    <div
      ref={ref}
      className={cx(bodyStyle, bodyDensityRecipe({ density }), className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <div
        ref={scrollRef}
        id={bodyId}
        role="log"
        aria-live="off"
        className={scrollViewportStyle}
      >
        {isEmpty ? (
          <div className={emptyStateStyle}>
            {emptyState ?? 'No log entries'}
          </div>
        ) : shouldVirtualize ? (
          <div
            className={virtualBodyStyle}
            style={assignInlineVars({ [totalHeightVar]: `${totalSize}px` })}
          >
            {virtualItems.map(item => {
              const entry = filtered[item.index];
              if (entry === undefined) return null;
              return renderRow(entry, item.index, item.start);
            })}
          </div>
        ) : (
          <div className={plainBodyStyle}>
            {filtered.map((entry, index) => renderRow(entry, index, 0))}
          </div>
        )}
      </div>

      <div
        data-log-jump
        className={jumpButtonRecipe({ visible: isDetached || undefined })}
        aria-hidden={!isDetached}
      >
        <Button
          size="sm"
          variant="default"
          icon={<ChevronDownIcon size="md" />}
          onClick={scrollToBottom}
          aria-label="Jump to bottom"
          tabIndex={isDetached ? 0 : -1}
        >
          {newSinceDetach > 0 ? (
            <>
              <span className={jumpBadgeStyle}>{newSinceDetach}</span> new
            </>
          ) : (
            'Jump to bottom'
          )}
        </Button>
      </div>
    </div>
  );
};

LogViewBody.displayName = 'LogView.Body';
