# useControlledState
> Manage a value that may be either controlled by a prop or uncontrolled with an internal default.

`useControlledState` is the canonical pattern for components that accept either a `value` prop (controlled by the parent) or only a `defaultValue` (managed internally). It mirrors the controlled / uncontrolled split that React itself uses for native form elements like `<input>`.

**Live preview**

## Import

```ts
import { useControlledState } from 'entangle-ui';
```

## Signature

```ts
function useControlledState<T>(
  options: UseControlledStateOptions<T>
): [T, (next: T | ((prev: T) => T)) => void];

interface UseControlledStateOptions<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  fallback: T;
}
```

## Usage

Wire the hook through every "controllable" prop on your component:

```tsx
function Toggle({ value, defaultValue, onChange }) {
  const [on, setOn] = useControlledState({
    value,
    defaultValue,
    onChange,
    fallback: false,
  });

  return (
    <button onClick={() => setOn(prev => !prev)}>{on ? 'On' : 'Off'}</button>
  );
}
```

### Controlled

When the parent passes `value`, the hook returns that value verbatim and never mutates internal state. `setValue` becomes a pure side-effect that calls `onChange`.

**Controlled**

### Uncontrolled

When `value` is undefined, the hook owns the state. `defaultValue` is the initial value; `setValue` updates internal state and calls `onChange` (if provided).

**Uncontrolled**

## Returns

A `[value, setValue]` tuple, like `useState`. `setValue` accepts either a next value or a functional updater `(prev) => next`.

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T` | — | When defined, drives the returned value. Switching this from defined to undefined (or vice versa) at runtime triggers a development warning. |
| `defaultValue` | `T` | — | Initial value used in uncontrolled mode. |
| `onChange` | `(value: T) => void` | — | Called when the consumer requests a change. Fires in both controlled and uncontrolled modes. |
| `fallback` *(required)* | `T` | — | Value used when both value and defaultValue are undefined. Required so the hook never returns undefined. |

## Common pitfalls

- **Switching modes mid-life:** A component should be either controlled or uncontrolled for its entire lifetime. The hook emits a development-only warning if `value` flips between defined and undefined after mount, mirroring React's own warning for `<input>`.
- **Forgetting `fallback`:** `fallback` is required precisely so consumers do not get `undefined` from the hook when the parent forgets to supply both `value` and `defaultValue`. Always pass an explicit fallback that matches the type `T`.
- **Stale `onChange`:** The hook keeps an internal ref to `onChange`, so passing a fresh inline function on every render is safe — the observer is not re-subscribed.
