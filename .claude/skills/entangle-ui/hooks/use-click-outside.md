# useClickOutside

> Fire a callback when a click occurs outside a referenced element.

`useClickOutside` attaches a document-level listener that fires only when the click lands outside the referenced element(s). It is the building block behind dismissable popovers, menus, and detail panels — anything that should close when the user clicks "somewhere else".

**Live preview**

## Import

```ts
import { useClickOutside } from 'entangle-ui';
```

## Signature

```ts
function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null> | Array<RefObject<HTMLElement | null>>,
  handler: (event: MouseEvent) => void,
  options?: UseClickOutsideOptions
): void;

interface UseClickOutsideOptions {
  enabled?: boolean;
  event?: 'mousedown' | 'click' | 'pointerdown';
}
```

## Usage

```tsx
function Popover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);

  return <div ref={ref}>...</div>;
}
```

### Basic

**Basic**

### Trigger + popover pair

Pass an array of refs when the "inside" group spans multiple elements — for example a trigger button outside the popover whose click should not close it.

**Multiple refs**

```tsx
const triggerRef = useRef<HTMLButtonElement>(null);
const popoverRef = useRef<HTMLDivElement>(null);

useClickOutside([triggerRef, popoverRef], () => setOpen(false));
```

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ref` *(required)* | `RefObject \| RefObject[]` | — | Single ref or an array of refs. When an array, the handler fires only when the click is outside ALL refs. |
| `handler` *(required)* | `(event: MouseEvent) => void` | — | Called when an outside click is detected. The latest handler is always invoked — no need to memoize. |
| `options.enabled` | `boolean` | `true` | When false, the listener is detached. Toggle this to disable behavior without unmounting. |
| `options.event` | `'mousedown' \| 'click' \| 'pointerdown'` | `'mousedown'` | Which event to listen for. `mousedown` fires before `click`, which prevents a click that closes a popover from also activating something underneath. |

## Common pitfalls

- **Triggers outside the ref:** A button that opens a popover is not inside the popover. Pass both refs as an array, otherwise clicking the trigger will immediately close the popover that just opened.
- **Event timing:** Listening on `click` instead of `mousedown` means the dismiss happens after the click event has already activated other handlers (selecting text, focusing inputs, navigating links). Stick to `mousedown` unless you have a specific reason.
- **Portals:** Elements rendered into a portal are not descendants of the ref's DOM subtree. Pass a ref to the portal content as well, or close on outside click is going to fire when the user interacts with the popover body.
- **SSR:** The hook is a no-op on the server. The listener attaches in `useEffect`, which only runs in the browser.
