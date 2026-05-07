export interface UseThrottledCallbackOptions {
  /** Fire on the leading edge (first call). @default true */
  leading?: boolean;
  /** Fire on the trailing edge (after the last call in the window). @default true */
  trailing?: boolean;
}

export interface ThrottledCallback<Args extends unknown[]> {
  (...args: Args): void;
  /** Cancel any pending trailing call and reset the throttle window. */
  cancel: () => void;
}
