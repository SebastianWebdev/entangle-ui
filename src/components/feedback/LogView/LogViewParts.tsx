'use client';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import React from 'react';

import { CopyIcon } from '@/components/Icons/CopyIcon';
import { SearchIcon } from '@/components/Icons/SearchIcon';
import { TrashIcon } from '@/components/Icons/TrashIcon';
import { IconButton } from '@/components/primitives/IconButton';
import { Input } from '@/components/primitives/Input';
import { useClipboard } from '@/hooks/useClipboard';
import { cx } from '@/utils/cx';

import {
  chipCountStyle,
  footerStyle,
  levelChipRecipe,
  levelColorVar,
  levelDotStyle,
  levelFilterStyle,
  levelGlyphStyle,
  searchWrapperStyle,
  toolbarStyle,
} from './LogView.css';
import { useLogCounts, useLogViewContext } from './LogViewContext';
import { levelVariant } from './logViewLevels';
import { entriesToText } from './logViewUtils';

import type {
  LogViewClearProps,
  LogViewCopyProps,
  LogViewFooterProps,
  LogViewLevelFilterProps,
  LogViewSearchProps,
  LogViewToolbarProps,
} from './LogView.types';

/** Toolbar container. Lays out search, level chips, and action buttons. */
export const LogViewToolbar = ({
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}: LogViewToolbarProps): React.ReactElement => (
  <div
    ref={ref}
    className={cx(toolbarStyle, className)}
    style={style}
    data-testid={testId}
    {...rest}
  >
    {children}
  </div>
);
LogViewToolbar.displayName = 'LogView.Toolbar';

/** Footer container. A thin bar below the body for status / summary content. */
export const LogViewFooter = ({
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}: LogViewFooterProps): React.ReactElement => (
  <div
    ref={ref}
    className={cx(footerStyle, className)}
    style={style}
    data-testid={testId}
    {...rest}
  >
    {children}
  </div>
);
LogViewFooter.displayName = 'LogView.Footer';

/** Search field bound to the LogView query state. */
export const LogViewSearch = ({
  placeholder = 'Filter logs…',
  size = 'md',
  className,
  style,
  testId,
  ref,
  ...rest
}: LogViewSearchProps): React.ReactElement => {
  const { query, setQuery } = useLogViewContext();
  return (
    <div
      ref={ref}
      className={cx(searchWrapperStyle, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <Input
        type="search"
        size={size}
        value={query}
        onChange={setQuery}
        placeholder={placeholder}
        startIcon={<SearchIcon size="md" />}
        aria-label="Filter logs"
      />
    </div>
  );
};
LogViewSearch.displayName = 'LogView.Search';

/** Multi-toggle level filter chips with live per-level counts. */
export const LogViewLevelFilter = ({
  className,
  style,
  testId,
  ref,
  ...rest
}: LogViewLevelFilterProps): React.ReactElement => {
  const { store, levelOrder, getLevelDefinition, isLevelActive, toggleLevel } =
    useLogViewContext();
  const counts = useLogCounts(store);

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Filter by level"
      className={cx(levelFilterStyle, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {levelOrder.map(level => {
        const def = getLevelDefinition(level);
        const active = isLevelActive(level);
        const Icon = def.icon;
        const count = counts[level] ?? 0;
        const chipStyle =
          !def.isBuiltIn && def.color !== undefined
            ? assignInlineVars({ [levelColorVar]: def.color })
            : undefined;
        return (
          <button
            key={String(level)}
            type="button"
            aria-pressed={active}
            className={levelChipRecipe({
              level: levelVariant(def),
              active,
            })}
            style={chipStyle}
            onClick={() => {
              toggleLevel(level);
            }}
          >
            {Icon ? (
              <span className={levelGlyphStyle} aria-hidden="true">
                <Icon size="md" color="currentColor" />
              </span>
            ) : (
              <span className={levelDotStyle} aria-hidden="true" />
            )}
            <span>{def.label}</span>
            <span className={chipCountStyle}>{count}</span>
          </button>
        );
      })}
    </div>
  );
};
LogViewLevelFilter.displayName = 'LogView.LevelFilter';

/** Clear-all button. */
export const LogViewClear = ({
  children,
  className,
  style,
  testId,
  'aria-label': ariaLabel = 'Clear logs',
  ref,
  ...rest
}: LogViewClearProps): React.ReactElement => {
  const { clearLog } = useLogViewContext();
  return (
    <IconButton
      ref={ref}
      aria-label={ariaLabel}
      size="md"
      variant="ghost"
      className={className}
      style={style}
      data-testid={testId}
      onClick={() => {
        clearLog();
      }}
      {...rest}
    >
      {children ?? <TrashIcon size="md" />}
    </IconButton>
  );
};
LogViewClear.displayName = 'LogView.Clear';

/** Copy-all-visible button. Copies the currently-filtered lines to the clipboard. */
export const LogViewCopy = ({
  children,
  className,
  style,
  testId,
  'aria-label': ariaLabel = 'Copy logs',
  ref,
  ...rest
}: LogViewCopyProps): React.ReactElement => {
  const { getCopyEntries, showTimestamps, formatTimestamp, onCopy } =
    useLogViewContext();
  const { copy } = useClipboard();
  return (
    <IconButton
      ref={ref}
      aria-label={ariaLabel}
      size="md"
      variant="ghost"
      className={className}
      style={style}
      data-testid={testId}
      onClick={() => {
        const text = entriesToText(getCopyEntries(), {
          showTimestamps,
          formatTimestamp,
        });
        void copy(text);
        onCopy?.(text);
      }}
      {...rest}
    >
      {children ?? <CopyIcon size="md" />}
    </IconButton>
  );
};
LogViewCopy.displayName = 'LogView.Copy';
