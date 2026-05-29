'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a copy of `value` that updates only after `delay` ms have elapsed
 * without further changes (trailing-edge debounce).
 *
 * Typical use: feeding a search input value into an expensive query.
 *
 * @example
 * ```tsx
 * const [text, setText] = useState('');
 * const debounced = useDebouncedValue(text, 200);
 * useEffect(() => { search(debounced); }, [debounced]);
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    if (delay <= 0) {
      // Synchronous passthrough when debouncing is disabled; this hook's whole
      // purpose is to mirror an external value into state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDebounced(value);
      return;
    }
    const id = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => {
      clearTimeout(id);
    };
  }, [value, delay]);

  return debounced;
}
