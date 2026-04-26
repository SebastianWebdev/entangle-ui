'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { devWarn } from '@/utils/devWarn';

export interface UseControlledStateOptions<T> {
  /** Controlled value — when defined, drives the returned value. */
  value?: T;
  /** Default value used when the hook is uncontrolled. */
  defaultValue?: T;
  /** Called when the consumer requests a change in either mode. */
  onChange?: (value: T) => void;
  /** Fallback used when both `value` and `defaultValue` are undefined. */
  fallback: T;
}

/**
 * Manage a value that may be either controlled (via prop) or uncontrolled
 * (managed internally with a default).
 *
 * Returns a `[value, setValue]` tuple just like `useState`. When
 * `options.value` is defined the state is read from there and `setValue`
 * becomes a pure side-effect callback that calls `onChange` only — internal
 * state is never mutated. When `options.value` is undefined the hook owns the
 * state and `setValue` updates it as well as calls `onChange`.
 *
 * Switching between controlled and uncontrolled within a component's lifetime
 * is a known pitfall (matches React's own warning for `<input value/defaultValue>`).
 * The hook emits a development-only warning when this happens.
 *
 * @example
 * ```ts
 * const [value, setValue] = useControlledState({
 *   value: props.value,
 *   defaultValue: props.defaultValue,
 *   onChange: props.onChange,
 *   fallback: '',
 * });
 * ```
 */
export function useControlledState<T>(
  options: UseControlledStateOptions<T>
): [T, (next: T | ((prev: T) => T)) => void] {
  const { value, defaultValue, onChange, fallback } = options;

  const isControlled = value !== undefined;

  // Only `undefined` means "no defaultValue given" — `null` is a legal value
  // for generic T (e.g. `string | null`) and must not be replaced by fallback.
  const [internalValue, setInternalValue] = useState<T>(
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    defaultValue !== undefined ? defaultValue : fallback
  );

  // Stable refs to avoid stale closures and unnecessary identity changes.
  const onChangeRef = useRef(onChange);
  const internalValueRef = useRef(internalValue);
  const isControlledRef = useRef(isControlled);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    internalValueRef.current = internalValue;
  }, [internalValue]);

  // Dev-only warning when controlled <-> uncontrolled flips after mount.
  // Mirrors React's behavior for <input value/defaultValue>.
  useEffect(() => {
    const wasControlled = isControlledRef.current;
    if (wasControlled !== isControlled) {
      devWarn(
        `[useControlledState] Component is changing from ${
          wasControlled ? 'controlled' : 'uncontrolled'
        } to ${isControlled ? 'controlled' : 'uncontrolled'}. ` +
          'Components should not switch between controlled and uncontrolled ' +
          '(or vice versa) during their lifetime. Decide between using a ' +
          'controlled or uncontrolled mode for the lifetime of the component.'
      );
      isControlledRef.current = isControlled;
    }
  }, [isControlled]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = isControlledRef.current
        ? (value as T)
        : internalValueRef.current;
      const resolved =
        typeof next === 'function' ? (next as (p: T) => T)(prev) : next;

      if (!isControlledRef.current) {
        setInternalValue(resolved);
        internalValueRef.current = resolved;
      }
      onChangeRef.current?.(resolved);
    },
    [value]
  );

  const currentValue = isControlled ? (value as T) : internalValue;
  return [currentValue, setValue];
}
