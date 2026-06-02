import type { LogViewLabels } from './LogView.types';

/**
 * English defaults for every user-facing string LogView renders. Override any
 * subset by passing `labels` to `<LogView>`; the rest fall back here.
 */
export const DEFAULT_LOG_VIEW_LABELS: LogViewLabels = {
  regionLabel: 'Log output',
  searchPlaceholder: 'Filter logs…',
  searchLabel: 'Filter logs',
  levelFilterLabel: 'Filter by level',
  clearLabel: 'Clear logs',
  copyLabel: 'Copy logs',
  copyLineLabel: 'Copy line',
  jumpToBottomLabel: 'Jump to bottom',
  newLinesLabel: count => `${count} new`,
  emptyLabel: 'No log entries',
};

/** Merge a partial `labels` override onto the English defaults. */
export function resolveLogViewLabels(
  overrides: Partial<LogViewLabels> | undefined
): LogViewLabels {
  return overrides
    ? { ...DEFAULT_LOG_VIEW_LABELS, ...overrides }
    : DEFAULT_LOG_VIEW_LABELS;
}
