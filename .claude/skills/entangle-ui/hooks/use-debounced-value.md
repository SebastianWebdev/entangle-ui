# useDebouncedValue

> Trailing-edge debounce for a reactive value — defer expensive work until input settles.

`useDebouncedValue` returns a copy of a value that only updates after `delay` ms have elapsed without further changes. It is the standard pattern for "wait until the user stops typing" — search inputs, autosave drafts, expensive selector derivations.

**Live preview**

## Import

```ts
import { useDebouncedValue } from 'entangle-ui';
```

## Signature

```ts
function useDebouncedValue<T>(value: T, delay: number): T;
```

## Usage

```tsx
function Search() {
  const [text, setText] = useState('');
  const debounced = useDebouncedValue(text, 250);

  useEffect(() => {
    if (debounced) runQuery(debounced);
  }, [debounced]);

  return (
    <Input
      value={text}
      onChange={event => setText(event.currentTarget.value)}
    />
  );
}
```

### Driving a query

**Search**

## Arguments

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` *(required)* | `T` | — | The value to debounce. The hook re-runs its timer every time this changes. |
| `delay` *(required)* | `number` | — | Debounce window in milliseconds. Values `<= 0` skip the timer and pass the value through synchronously. |

## Return value

The hook returns the latest stable value of the same type as `value`. The reference only changes when the debounce timer fires.

## Related

- `useDebouncedCallback` — debounce a function instead of a value, with `cancel` / `flush` controls.
- `useThrottledCallback` — for rate-limiting rather than waiting for quiescence.

## Common pitfalls

- **Effects keyed on `value`:** if you have `useEffect(() => …, [value])` and add `useDebouncedValue`, key the effect on the debounced value, not the raw one. Otherwise the effect still fires on every keystroke.
- **Initial render:** the first returned value equals the input — there is no `undefined` warmup phase. Code can treat the result as always present.
- **Delay of `0`:** values flow through synchronously. Useful for runtime-tunable delays where `0` should mean "no debounce".
