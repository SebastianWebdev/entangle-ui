# useEventCallback

> Stable callback identity that always invokes the most recently rendered version.

`useEventCallback` wraps a callback so its **identity stays stable for the component lifetime** while it always invokes the **most recently rendered** version. It is the `useEffectEvent` pattern — pass the result to effects, memoized children, or external subscriptions without re-subscribing, yet it still closes over the latest props and state.

**Live preview**

## Import

```ts
import { useEventCallback } from 'entangle-ui';
```

## Signature

```ts
function useEventCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return;
```

## Usage

The classic problem: a subscription effect that lists a callback in its dependencies re-subscribes on every render, because consumers pass fresh inline functions. Wrapping the callback keeps the effect wired once.

```tsx
function PriceTicker({ onTick }: { onTick: (price: number) => void }) {
  const [symbol, setSymbol] = useState('ACME');

  // Stable identity — but always sees the latest `symbol` and `onTick`.
  const handleMessage = useEventCallback((price: number) => {
    onTick(price);
    log(symbol, price);
  });

  useEffect(() => {
    const socket = subscribe(handleMessage);
    return () => socket.close();
  }, [handleMessage]); // never re-runs on symbol / onTick change
}
```

## Returns

A function with a **stable reference** for the component's lifetime. Calling it always runs the latest `fn` you passed, with the same arguments and return value.

## How it works

The latest `fn` is stored in a ref that is refreshed inside `useInsertionEffect`, which commits **before** any layout effect. That is what separates this from a passive ref (such as `useLatest`): the freshness guarantee holds even for consumers that read the callback during the same commit — a child's `useLayoutEffect`, a synchronous external-store subscription, or an imperative handle. A `useEffect`-updated ref would still be one render stale in those cases.

## Common pitfalls

- **Do not call it during render.** Like an event handler it reads through a ref, so a render-phase call has no meaningful "latest" value. Use it in event handlers, effects, layout effects, timers, and subscriptions.
- **Not a memoization escape hatch for rendered values.** It stabilizes a _callback_; it does not memoize derived data. For values that feed the render, reach for `useMemo`.
- **You still list it in dependency arrays.** The identity is stable, so listing it satisfies the exhaustive-deps lint rule without ever causing the effect to re-run.
