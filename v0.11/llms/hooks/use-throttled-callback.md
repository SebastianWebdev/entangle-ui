# useThrottledCallback
> Rate-limit a function so it fires at most once per delay window, with optional leading/trailing edges.

`useThrottledCallback` wraps a function so it fires at most once per `delay` ms. With both edges enabled (the default), the first call fires immediately and the most recent call inside the window fires at its end. Use it where the input rate exceeds the work rate — drag handlers, scroll listeners, pointer move callbacks. Use `useDebouncedCallback` instead when you want to wait for the input to settle entirely.

**Live preview**

## Import

```ts
import { useThrottledCallback } from 'entangle-ui';
```

## Signature

```ts
function useThrottledCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
  options?: UseThrottledCallbackOptions
): ThrottledCallback<Args>;

interface UseThrottledCallbackOptions {
  leading?: boolean;
  trailing?: boolean;
}

interface ThrottledCallback<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
}
```

## Usage

```tsx
function PointerGuide() {
  const onPointerMove = useThrottledCallback((x: number, y: number) => {
    updateGuide(x, y);
  }, 16); // ~60fps cap

  return (
    <Canvas
      onPointerMove={event => onPointerMove(event.clientX, event.clientY)}
    />
  );
}
```

### Leading-only

Disable the trailing edge to drop calls inside the window entirely — only the first call in each window counts.

**Leading only**

## Options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `fn` *(required)* | `(...args: Args) => void` | — | Function to throttle. The latest identity is always used — no need to memoize. |
| `delay` *(required)* | `number` | — | Length of the throttle window in milliseconds. |
| `options.leading` | `boolean` | `true` | Fire on the leading edge (first call). Set to `false` to defer the first call by `delay` ms. |
| `options.trailing` | `boolean` | `true` | Fire on the trailing edge (after the last call in the window). Set to `false` to discard calls that arrive while the window is active. |

## Return value

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `wrapper` | `(...args: Args) => void` | — | Throttled wrapper around `fn`. Identity is stable across renders. |
| `wrapper.cancel` | `() => void` | — | Cancel any pending trailing call and reset the throttle window to a fresh state. |

## Related

- `useDebouncedCallback` — collapse calls until activity stops instead of bounding their rate.

## Common pitfalls

- **`leading: false, trailing: false`:** the wrapper never fires. Pick at least one edge.
- **High-frequency event handlers:** a `delay` of `16` caps at roughly 60fps, which is usually the right ceiling for visual updates. Pick a larger window for network calls.
- **Unmount during a pending trailing call:** the hook clears its timer on unmount, so pending trailing calls are dropped silently. If you need the final call to land, invoke it eagerly from your cleanup.
- **Argument freshness:** the wrapper always uses the most recent arguments — earlier calls inside the window are discarded. Plan around that when the work is not idempotent.
