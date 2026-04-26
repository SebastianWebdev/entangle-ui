export type ClipboardStatus = 'idle' | 'copied' | 'error';

export interface UseClipboardOptions {
  /**
   * How long the `copied` state stays before resetting to `idle`, in ms.
   * @default 2000
   */
  timeout?: number;
}

export interface UseClipboardReturn {
  /** Current state — flips to 'copied' for `timeout` ms after a successful copy. */
  status: ClipboardStatus;
  /** Convenience boolean — `status === 'copied'`. */
  copied: boolean;
  /** Last error from a failed copy attempt, if any. */
  error: Error | null;
  /** Copy text to clipboard. Returns the resolved success boolean. */
  copy: (text: string) => Promise<boolean>;
  /** Manually reset status to 'idle'. */
  reset: () => void;
}
