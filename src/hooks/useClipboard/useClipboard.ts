'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ClipboardStatus,
  UseClipboardOptions,
  UseClipboardReturn,
} from './useClipboard.types';

const DEFAULT_TIMEOUT = 2000;

async function writeViaClipboardApi(text: string): Promise<boolean> {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.clipboard === 'undefined' ||
    typeof navigator.clipboard.writeText !== 'function'
  ) {
    return false;
  }
  await navigator.clipboard.writeText(text);
  return true;
}

function writeViaExecCommand(text: string): boolean {
  if (typeof document === 'undefined') return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();

  let succeeded = false;
  try {
    succeeded = document.execCommand('copy');
  } catch {
    succeeded = false;
  }
  document.body.removeChild(textarea);
  return succeeded;
}

/**
 * Copy text to the clipboard with a built-in timeout-driven feedback state.
 *
 * Uses `navigator.clipboard.writeText` when available; falls back to
 * `document.execCommand('copy')` only when the modern API is missing.
 * In SSR or restricted contexts where neither path is available, `copy`
 * resolves to `false` and `status` flips to `'error'` without throwing.
 *
 * @example
 * ```tsx
 * const { copy, copied } = useClipboard({ timeout: 1500 });
 *
 * return (
 *   <Button onClick={() => copy('Hello!')}>
 *     {copied ? 'Copied!' : 'Copy'}
 *   </Button>
 * );
 * ```
 */
export function useClipboard(
  options: UseClipboardOptions = {}
): UseClipboardReturn {
  const { timeout = DEFAULT_TIMEOUT } = options;

  const [status, setStatus] = useState<ClipboardStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef(timeout);

  useEffect(() => {
    timeoutRef.current = timeout;
  }, [timeout]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setStatus('idle');
    setError(null);
  }, [clearTimer]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      clearTimer();

      let succeeded = false;
      let copyError: Error | null = null;

      try {
        succeeded = await writeViaClipboardApi(text);
      } catch (err) {
        copyError = err instanceof Error ? err : new Error(String(err));
      }

      if (!succeeded && copyError === null) {
        try {
          succeeded = writeViaExecCommand(text);
          if (!succeeded) {
            copyError = new Error('Copy command was rejected by the browser.');
          }
        } catch (err) {
          copyError = err instanceof Error ? err : new Error(String(err));
        }
      }

      if (succeeded) {
        setError(null);
        setStatus('copied');
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          setStatus('idle');
        }, timeoutRef.current);
        return true;
      }

      setError(copyError ?? new Error('Clipboard API is not available.'));
      setStatus('error');
      return false;
    },
    [clearTimer]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    status,
    copied: status === 'copied',
    error,
    copy,
    reset,
  };
}
