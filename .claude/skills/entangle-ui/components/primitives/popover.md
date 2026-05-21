# Popover

> Floating content container anchored to a trigger element with collision detection and focus management.

Floating content container for interactive content anchored to a trigger element. Built on `@floating-ui/react` for robust positioning with collision detection, flip/shift behavior, and scroll-aware auto-updating. Uses a compound component pattern with `Popover`, `PopoverTrigger`, `PopoverContent`, and `PopoverClose`.

**Live Preview**

## Import

```tsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from 'entangle-ui';
```

## Usage

```tsx
<Popover>
  <PopoverTrigger>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Popover content here</p>
  </PopoverContent>
</Popover>
```

## Placement

The `placement` prop controls where the popover appears relative to the trigger. Supports 12 positions with automatic collision detection.

```tsx
<Popover placement="bottom-start">
  <PopoverTrigger>
    <Button>Bottom Start</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Placed at bottom-start</p>
  </PopoverContent>
</Popover>

<Popover placement="right">
  <PopoverTrigger>
    <Button>Right</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Placed on the right</p>
  </PopoverContent>
</Popover>
```

| Placement                              | Description          |
| -------------------------------------- | -------------------- |
| `top`, `top-start`, `top-end`          | Above the trigger    |
| `bottom`, `bottom-start`, `bottom-end` | Below the trigger    |
| `left`, `left-start`, `left-end`       | Left of the trigger  |
| `right`, `right-start`, `right-end`    | Right of the trigger |

## Controlled

Use `open` and `onOpenChange` for controlled mode.

```tsx
const [isOpen, setIsOpen] = useState(false);

<Popover open={isOpen} onOpenChange={setIsOpen}>
  <PopoverTrigger>
    <Button>Toggle</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Controlled popover</p>
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </PopoverContent>
</Popover>;
```

## With Close Button

Use `PopoverClose` for a built-in close button inside the popover.

```tsx
<Popover>
  <PopoverTrigger>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverContent>
    <PopoverClose />
    <h3>Settings</h3>
    <p>Configure your preferences.</p>
  </PopoverContent>
</Popover>
```

## Content Sizing

`PopoverContent` accepts `width`, `maxHeight`, and `padding` for layout control.

```tsx
<Popover>
  <PopoverTrigger>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverContent width={300} maxHeight={400} padding="lg">
    <p>Fixed width, scrollable content with large padding.</p>
  </PopoverContent>
</Popover>
```

## Match Trigger Width

Set `matchTriggerWidth` to make the popover content width match the trigger element.

```tsx
<Popover matchTriggerWidth>
  <PopoverTrigger>
    <Button fullWidth>Select Option</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Same width as the button above</p>
  </PopoverContent>
</Popover>
```

## Offset

Control the distance between the trigger and popover with the `offset` prop (in pixels).

```tsx
<Popover offset={16}>
  <PopoverTrigger>
    <Button>More space</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>16px from the trigger</p>
  </PopoverContent>
</Popover>
```

## Dismiss Behavior

Control how the popover closes.

```tsx
{
  /* Disable close on outside click */
}
<Popover closeOnClickOutside={false}>
  <PopoverTrigger>
    <Button>Persistent</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Only closes via close button or Escape</p>
    <PopoverClose />
  </PopoverContent>
</Popover>;

{
  /* Disable close on Escape */
}
<Popover closeOnEscape={false}>
  <PopoverTrigger>
    <Button>No Escape</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Escape key does not close this</p>
  </PopoverContent>
</Popover>;
```

## Props

### Popover

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | PopoverTrigger and PopoverContent elements. |
| `open` | `boolean` | — | Whether the popover is open (controlled mode). |
| `defaultOpen` | `boolean` | `false` | Default open state (uncontrolled mode). |
| `placement` | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'left' \| 'left-start' \| 'left-end' \| 'right' \| 'right-start' \| 'right-end'` | `'bottom-start'` | Popover placement relative to the trigger. |
| `offset` | `number` | `8` | Distance in pixels from the trigger element. |
| `closeOnClickOutside` | `boolean` | `true` | Whether clicking outside closes the popover. |
| `closeOnEscape` | `boolean` | `true` | Whether pressing Escape closes the popover. |
| `returnFocus` | `boolean` | `true` | Whether to return focus to the trigger when popover closes. |
| `portal` | `boolean` | `true` | Whether to render the popover in a React Portal. |
| `matchTriggerWidth` | `boolean` | `false` | Whether the popover content width matches the trigger width. |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when the open state changes. |

### PopoverContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Popover content -- any React elements. |
| `width` | `number \| string` | — | Width of the popover content. Number = pixels, string = CSS value. |
| `maxHeight` | `number \| string` | — | Maximum height with scroll. |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding inside the popover using theme spacing tokens. |

### PopoverClose

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Close button content. Defaults to a built-in X icon. |

## Accessibility

- Built on `@floating-ui/react` with `useClick`, `useDismiss` interaction hooks
- Focus is returned to the trigger when the popover closes (configurable via `returnFocus`)
- Escape key dismisses the popover by default
- Popover content is rendered in a Portal to avoid clipping and z-index issues
- Uses proper ARIA attributes for trigger/content association
- Keyboard accessible: Enter/Space to toggle, Escape to close, Tab to navigate within content
