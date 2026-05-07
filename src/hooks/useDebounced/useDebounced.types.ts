export interface UseDebouncedCallbackOptions {
  /** Fire on the leading edge in addition to trailing. @default false */
  leading?: boolean;
  /** Maximum time the callback may be deferred before being forced. */
  maxWait?: number;
}

export interface DebouncedCallback<Args extends unknown[]> {
  (...args: Args): void;
  /** Cancel a pending call. */
  cancel: () => void;
  /** Fire a pending call immediately (no-op when nothing is pending). */
  flush: () => void;
}
