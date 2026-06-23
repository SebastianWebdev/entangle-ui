# useListboxNav
> Shared keyboard navigation for listbox-like surfaces — tracks an active index, skips disabled items, and exposes a single keydown handler.

`useListboxNav` is the keyboard-navigation primitive used by `Select`, `MultiSelect`, `Combobox`, and `CommandPalette`. It tracks an active index over a list of items, skips disabled entries, and covers the standard ArrowUp / ArrowDown / Home / End / Enter / Escape semantics through a single `handleKeyDown` callback. The hook is purely logical — consumers render the list and decide whether the keydown handler sits on an input, the listbox container, or somewhere else entirely.

**Live preview**

## Import

```ts
import { useListboxNav } from 'entangle-ui';
```

## Signature

```ts
function useListboxNav<T>(
  options: UseListboxNavOptions<T>
): UseListboxNavReturn;

interface UseListboxNavOptions<T> {
  items: T[];
  isItemDisabled?: (item: T, index: number) => boolean;
  defaultActiveIndex?: number;
  loop?: boolean;
  resetOnItemsChange?: boolean;
  onSelect?: (item: T, index: number) => void;
  onEscape?: () => void;
}

interface UseListboxNavReturn {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  first: () => void;
  last: () => void;
  selectActive: () => void;
  handleKeyDown: (event: KeyboardEvent | React.KeyboardEvent) => boolean;
  navigableIndices: number[];
}
```

## Usage

```tsx
function FruitListbox({ fruits }: { fruits: string[] }) {
  const { activeIndex, handleKeyDown } = useListboxNav({
    items: fruits,
    onSelect: item => console.log('selected', item),
    onEscape: () => console.log('closed'),
  });

  return (
    <ul role="listbox" tabIndex={0} onKeyDown={handleKeyDown}>
      {fruits.map((fruit, index) => (
        <li key={fruit} role="option" aria-selected={index === activeIndex}>
          {fruit}
        </li>
      ))}
    </ul>
  );
}
```

### Skipping disabled items

`isItemDisabled` is consulted for every navigation step and for `selectActive`. Disabled entries are silently skipped by `next`, `prev`, `first`, `last`, and rejected by Enter.

**With disabled items**

### Disabling wrap-around

By default arrow navigation loops between the first and last navigable index. Pass `loop: false` to clamp at the ends.

**No looping**

## Filtered lists

When the `items` array changes by reference — for example a Combobox filtered by a search query — the hook resets `activeIndex` to `defaultActiveIndex` so the previous index does not point at a stale item. Pass `resetOnItemsChange: false` to opt out and manage the index yourself.

## Options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` *(required)* | `T[]` | — | Items rendered in the listbox. The hook tracks navigation by index. |
| `isItemDisabled` | `(item: T, index: number) => boolean` | — | Predicate consulted for navigation and selection. Disabled items are skipped by `next`/`prev`/`first`/`last` and rejected by `selectActive`. |
| `defaultActiveIndex` | `number` | `-1` | Initial active index. `-1` means no item is active. |
| `loop` | `boolean` | `true` | Wrap from last → first (and vice versa) on `next`/`prev`. Set to `false` to clamp at the ends. |
| `resetOnItemsChange` | `boolean` | `true` | Reset the active index to `defaultActiveIndex` when the `items` reference changes. Useful for filtered listboxes. |
| `onSelect` | `(item: T, index: number) => void` | — | Called when the active item is committed — by `selectActive()` or by pressing Enter through `handleKeyDown`. |
| `onEscape` | `() => void` | — | Called on Escape. When omitted, `handleKeyDown` returns `false` for Escape so a parent can handle it. |

## Return value

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `activeIndex` | `number` | — | Currently active index, or `-1` when no item is active. |
| `setActiveIndex` | `(index: number) => void` | — | Direct setter. The value is not validated against `isItemDisabled` or the list length. |
| `next` | `() => void` | — | Move to the next non-disabled item. |
| `prev` | `() => void` | — | Move to the previous non-disabled item. |
| `first` | `() => void` | — | Activate the first non-disabled item. |
| `last` | `() => void` | — | Activate the last non-disabled item. |
| `selectActive` | `() => void` | — | Commit the active item via `onSelect`. No-op when no item is active or the active item is disabled. |
| `handleKeyDown` | `(event: KeyboardEvent \| React.KeyboardEvent) => boolean` | — | Single keyboard handler covering ArrowUp / ArrowDown / Home / End / Enter / Escape. Returns `true` when the event was handled and `preventDefault` was called. |
| `navigableIndices` | `number[]` | — | Snapshot of the non-disabled indices in order. Useful for rendering position indicators or computing roving tabindex. |

## Common pitfalls

- **The hook does not scroll the active item into view.** That is a layout concern — consumers typically observe `activeIndex` and call `scrollIntoView` on the active option's DOM node.
- **`navigableIndices` is recomputed on every render.** It iterates `items` synchronously. For very large lists, memoize the predicate identity so re-renders stay cheap.
- **Escape only fires when `onEscape` is provided.** Without it, the hook returns `false` so an ancestor (a Dialog, a Combobox popover) can take over.
