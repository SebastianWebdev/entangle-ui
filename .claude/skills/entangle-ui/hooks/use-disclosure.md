# useDisclosure

> Manage an open/closed state with stable open, close, and toggle callbacks.

`useDisclosure` is the canonical pattern for any overlay or revealed surface — dialogs, popovers, drawers, accordions you control by hand, expandable rows. It returns the boolean state alongside named callbacks (`open`, `close`, `toggle`) that are stable across renders, so you can pass them to event handlers without memoization gymnastics.

**Live preview**

## Import

```ts
import { useDisclosure } from 'entangle-ui';
```

## Signature

```ts
function useDisclosure(options?: UseDisclosureOptions): UseDisclosureReturn;

interface UseDisclosureOptions {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (next: boolean) => void;
}
```

## Usage

```tsx
function Sidebar() {
  const { isOpen, open, close, toggle } = useDisclosure();

  return (
    <>
      <Button onClick={toggle}>{isOpen ? 'Hide' : 'Show'} sidebar</Button>
      {isOpen && <Panel onDismiss={close}>...</Panel>}
    </>
  );
}
```

### Basic

**Basic**

### Driving a Dialog

`useDisclosure` pairs naturally with components that take `open` / `onClose` props:

**With Dialog**

```tsx
const dialog = useDisclosure();

<Button onClick={dialog.open}>Open</Button>
<Dialog open={dialog.isOpen} onClose={dialog.close}>...</Dialog>
```

## Controlled vs uncontrolled

The hook is uncontrolled by default — pass `defaultOpen` to seed the initial value. Pass `open` (and optionally `onOpenChange`) to drive it from a parent component. The two modes follow the same rules as `useControlledState`: switching between them mid-life triggers a development warning.

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultOpen` | `boolean` | `false` | Initial open state used in uncontrolled mode. Ignored when `open` is provided. |
| `open` | `boolean` | — | Controlled open state. When defined, drives the returned `isOpen`. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when state changes — fires for both controlled and uncontrolled paths. |

## Returns

| Field     | Type                      | Notes                                                      |
| --------- | ------------------------- | ---------------------------------------------------------- |
| `isOpen`  | `boolean`                 | Current state.                                             |
| `open`    | `() => void`              | Sets state to `true`. Stable identity across renders.      |
| `close`   | `() => void`              | Sets state to `false`. Stable identity across renders.     |
| `toggle`  | `() => void`              | Flips current state. Stable identity across renders.       |
| `setOpen` | `(next: boolean) => void` | Sets to an explicit value. Stable identity across renders. |

## Common pitfalls

- **Switching modes mid-life:** The hook re-uses `useControlledState` under the hood. Once a component has gone with `open`-driven control, do not start passing `undefined` later — the dev warning fires for the same reason React's `<input>` warning does.
- **Avoid local mirror state:** A pattern of `const [isOpen, setIsOpen] = useState(false)` plus three handwritten callbacks is exactly what this hook replaces. Reach for `useDisclosure` instead.
