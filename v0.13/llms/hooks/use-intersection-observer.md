# useIntersectionObserver
> Observe element visibility via IntersectionObserver with SSR-safe setup and a togglable `enabled` flag.

`useIntersectionObserver` wraps the browser `IntersectionObserver` API with the same conventions used by `useResizeObserver`: SSR-safe (silent no-op when the API is missing), automatic cleanup, and an `enabled` flag for toggling observation without unmounting. The hook returns a ref callback to attach plus the latest `IntersectionObserverEntry` and a convenience `isIntersecting` boolean.

**Live preview**

## Import

```ts
import { useIntersectionObserver } from 'entangle-ui';
```

## Signature

```ts
function useIntersectionObserver<T extends Element = Element>(
  options?: UseIntersectionObserverOptions
): UseIntersectionObserverReturn<T>;

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: boolean;
}

interface UseIntersectionObserverReturn<T extends Element> {
  ref: React.RefCallback<T>;
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
}
```

## Usage

```tsx
function LoadMoreSentinel({ onVisible }: { onVisible: () => void }) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '200px',
  });

  useEffect(() => {
    if (isIntersecting) onVisible();
  }, [isIntersecting, onVisible]);

  return <div ref={ref} />;
}
```

### Lazy loading with `rootMargin`

A positive bottom `rootMargin` makes the target report as intersecting slightly before it enters the viewport — useful for preloading images or fetching the next page.

**Lazy load**

## Options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `root` | `Element \| null` | `null` | Root element. `null` (default) targets the viewport. Pass a scrollable container for nested scroll regions. |
| `rootMargin` | `string` | — | Margin around the root, written as a CSS shorthand (`"0px 0px 200px 0px"`). Positive values expand the intersection box. |
| `threshold` | `number \| number[]` | — | How much of the target must be visible before an intersection callback fires. `0.5` means 50%; an array fires at multiple steps. |
| `enabled` | `boolean` | `true` | When false, the observer is disconnected and `entry` is reset to `null`. Toggling avoids the cost of unmounting the host component. |

## Return value

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ref` | `RefCallback` | — | Ref callback to attach to the element you want to observe. Re-attaching to a different node disconnects the previous observer. |
| `entry` | `IntersectionObserverEntry \| null` | — | Latest entry produced by the observer. `null` until the first callback fires or after `enabled` is set to `false`. |
| `isIntersecting` | `boolean` | — | Convenience accessor for `entry?.isIntersecting ?? false`. |

## Common pitfalls

- **SSR safety:** the hook checks `typeof IntersectionObserver === 'undefined'` and silently no-ops on the server, in tests without a polyfill, or in older browsers.
- **Stale `entry`:** when `enabled` flips to `false`, `entry` resets to `null`. Code that reads `entry` should handle the `null` case rather than relying on the last known value.
- **Multiple targets:** each call observes exactly one element. To observe several, call the hook multiple times with different refs.
- **Re-subscription:** the hook re-creates the observer when `root`, `rootMargin`, `threshold`, or `enabled` change. Stabilize array literals (e.g. `[0, 0.5, 1]`) with `useMemo` if you pass them inline and want to avoid churn.
