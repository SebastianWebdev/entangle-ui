# useDebouncedCallback

> Debounce a function with optional leading edge, maxWait, and cancel/flush controls.

`useDebouncedCallback` wraps a function so rapid calls collapse into one. The default is a trailing-edge debounce — the call fires `delay` ms after the most recent invocation. The returned wrapper has stable identity across renders and exposes `cancel` and `flush` helpers, and you can pass fresh inline functions without resetting pending timers.

**Live preview**

## Import

```ts
import { useDebouncedCallback } from 'entangle-ui';
```

## Signature

```ts
function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
  options?: UseDebouncedCallbackOptions
): DebouncedCallback<Args>;

interface UseDebouncedCallbackOptions {
  leading?: boolean;
  maxWait?: number;
}

interface DebouncedCallback<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
  flush: () => void;
}
```

## Usage

```tsx
function Resizer() {
  const onResize = useDebouncedCallback(() => measure(), 150);

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onResize]);

  return null;
}
```

### Leading edge

With `leading: true` the wrapper fires immediately on the first call, then suppresses further trailing calls inside the window unless additional invocations land.

**Leading**

## Options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `fn` *(required)* | `(...args: Args) => void` | — | Function to debounce. The latest identity is always used — no need to memoize. |
| `delay` *(required)* | `number` | — | Debounce window in milliseconds. |
| `options.leading` | `boolean` | `false` | Fire on the leading edge in addition to the trailing edge. |
| `options.maxWait` | `number` | — | Upper bound on how long the call may be deferred. When set, the wrapper forces a call once `maxWait` ms have elapsed even if invocations keep arriving. |

## Return value

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `wrapper` | `(...args: Args) => void` | — | Debounced wrapper around `fn`. Identity is stable across renders. |
| `wrapper.cancel` | `() => void` | — | Cancel any pending call without invoking `fn`. |
| `wrapper.flush` | `() => void` | — | Invoke any pending call immediately. No-op when nothing is pending. |

## Related

- `useDebouncedValue` — debounce a value rather than a function.
- `useThrottledCallback` — bound the call rate instead of waiting for quiescence.

## Common pitfalls

- **Unmount during a pending call:** the hook cleans up its timers on unmount automatically, so pending calls are dropped. If you need an in-flight call to land (e.g. a save on close), invoke `flush()` from your cleanup.
- **`maxWait` < `delay`:** the smaller of the two effectively wins. Pick a `maxWait` that is comfortably larger than `delay`.
- **Effects keyed on the wrapper:** because the wrapper identity is stable, listing it in an effect's dependency array is safe and does not cause re-subscription on every render.
