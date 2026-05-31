export interface UseNavigationHistoryOptions<T = string> {
  /** Seeds the stack with this entry on first mount. */
  initial?: T;
  /**
   * When `false`, mutations no-op and `canGoBack` / `canGoForward` are always
   * `false`. The stack itself is preserved so toggling back to `true` restores
   * the previous history. Defaults to `true`.
   */
  enabled?: boolean;
}

export interface NavigationHistoryApi<T = string> {
  /** The entry the index is currently pointing at, or `undefined` when empty. */
  current: T | undefined;
  canGoBack: boolean;
  canGoForward: boolean;
  /**
   * Append `entry` and move the index to it. Truncates any forward entries
   * first (matching browser semantics). No-op when an entry equal to `current`
   * is pushed.
   */
  push: (entry: T) => void;
  /** Move the index back by one. Returns the new current entry, or `undefined`. */
  goBack: () => T | undefined;
  /** Move the index forward by one. Returns the new current entry, or `undefined`. */
  goForward: () => T | undefined;
  /** Clear the stack (with no argument) or replace it with a single entry. */
  reset: (entry?: T) => void;
}
