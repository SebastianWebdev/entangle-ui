# Dialog

> Accessible modal dialog with overlay, focus trap, keyboard support, and compound sub-components for headers, bodies, and footers.

Modal dialog component for overlays in editor interfaces. Renders an accessible dialog with overlay backdrop, focus trap, animated enter/exit, and keyboard support. Uses a compound component pattern with `Dialog`, `DialogHeader`, `DialogBody`, `DialogFooter`, and `DialogClose`.

**Live Preview**

## Import

```tsx
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogClose,
} from 'entangle-ui';
```

## Usage

```tsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open Dialog</Button>

<Dialog open={open} onClose={() => setOpen(false)}>
  <DialogHeader>Confirm Action</DialogHeader>
  <DialogBody>
    Are you sure you want to delete this object? This action cannot be undone.
  </DialogBody>
  <DialogFooter align="right">
    <Button onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="filled" onClick={handleDelete}>Delete</Button>
  </DialogFooter>
</Dialog>
```

## Sizes

The `size` prop controls the dialog width.

**Sizes**

```tsx
<Dialog open={open} onClose={close} size="sm">...</Dialog>
<Dialog open={open} onClose={close} size="md">...</Dialog>
<Dialog open={open} onClose={close} size="lg">...</Dialog>
<Dialog open={open} onClose={close} size="xl">...</Dialog>
<Dialog open={open} onClose={close} size="fullscreen">...</Dialog>
```

| Size         | Use case                       |
| ------------ | ------------------------------ |
| `sm`         | Simple confirmations, alerts   |
| `md`         | Standard forms and content     |
| `lg`         | Complex forms, settings panels |
| `xl`         | Wide content, data tables      |
| `fullscreen` | Full viewport coverage         |

## Dialog Header

The `DialogHeader` renders a title area with an optional close button and description.

**Dialog Header**

```tsx
<DialogHeader showClose description="This will affect all linked objects.">
  Delete Object
</DialogHeader>
```

## Dialog Body

The `DialogBody` contains the main content of the dialog.

**Dialog Body**

```tsx
<DialogBody>
  <p>Enter the new name for this material:</p>
  <Input value={name} onChange={setName} />
</DialogBody>
```

## Dialog Footer

The `DialogFooter` contains action buttons. Use `align` to control button positioning.

**Dialog Footer**

```tsx
// Right-aligned (default for actions)
<DialogFooter align="right">
  <Button onClick={close}>Cancel</Button>
  <Button variant="filled">Save</Button>
</DialogFooter>

// Space between
<DialogFooter align="space-between">
  <Button variant="ghost">Reset</Button>
  <div>
    <Button onClick={close}>Cancel</Button>
    <Button variant="filled">Apply</Button>
  </div>
</DialogFooter>
```

## Dialog Close

The `DialogClose` component renders a button that calls `onClose` when clicked. Useful for custom close triggers inside the dialog body.

**Dialog Close**

```tsx
<DialogBody>
  <p>Operation completed successfully.</p>
  <DialogClose>
    <Button variant="filled">Done</Button>
  </DialogClose>
</DialogBody>
```

## Overlay Behavior

By default, clicking the overlay backdrop closes the dialog. Disable this for mandatory confirmations.

**Overlay Behavior**

```tsx
// Clicking overlay does not close
<Dialog open={open} onClose={close} closeOnOverlayClick={false}>
  <DialogHeader>Unsaved Changes</DialogHeader>
  <DialogBody>You must save or discard changes before closing.</DialogBody>
  <DialogFooter>
    <Button onClick={discard}>Discard</Button>
    <Button variant="filled" onClick={save}>
      Save
    </Button>
  </DialogFooter>
</Dialog>
```

You can also hide the overlay entirely.

```tsx
<Dialog open={open} onClose={close} showOverlay={false}>
  ...
</Dialog>
```

## Escape Key

By default, pressing Escape closes the dialog. Disable this behavior with `closeOnEscape={false}`.

**Escape Key**

```tsx
<Dialog open={open} onClose={close} closeOnEscape={false}>
  ...
</Dialog>
```

## Focus Management

The dialog traps focus by default. You can specify which element receives initial focus with `initialFocusRef`.

**Focus Management**

```tsx
const inputRef = useRef(null);

<Dialog open={open} onClose={close} initialFocusRef={inputRef}>
  <DialogBody>
    <Input ref={inputRef} placeholder="Auto-focused input" />
  </DialogBody>
</Dialog>;
```

Disable focus trapping with `trapFocus={false}`.

## Portal

By default, the dialog is rendered in a portal (`document.body`). Disable this to render it in place.

**Portal**

```tsx
<Dialog open={open} onClose={close} portal={false}>
  ...
</Dialog>
```

## ARIA Labels

Use `title` and `description` props for screen-reader-friendly labels without visible header components.

**ARIA Labels**

```tsx
<Dialog
  open={open}
  onClose={close}
  title="Confirm deletion"
  description="This will permanently remove the selected item."
>
  <DialogBody>
    <p>Delete "Cube"?</p>
  </DialogBody>
  <DialogFooter>
    <Button onClick={close}>Cancel</Button>
    <Button variant="filled" onClick={handleDelete}>
      Delete
    </Button>
  </DialogFooter>
</Dialog>
```

## Props

### Dialog

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Whether the dialog is open. |
| `onClose` | `() => void` | — | Callback fired when the dialog should close. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'fullscreen'` | `'md'` | Dialog width preset. |
| `title` | `string` | — | Dialog title for aria-labelledby (hidden, use DialogHeader for visible title). |
| `description` | `string` | — | Dialog description for aria-describedby. |
| `closeOnOverlayClick` | `boolean` | `true` | Whether clicking the overlay closes the dialog. |
| `closeOnEscape` | `boolean` | `true` | Whether pressing Escape closes the dialog. |
| `showOverlay` | `boolean` | `true` | Whether to show the overlay backdrop. |
| `trapFocus` | `boolean` | `true` | Whether to trap focus within the dialog. |
| `initialFocusRef` | `RefObject` | — | Ref to the element that should receive initial focus. |
| `portal` | `boolean` | `true` | Whether to render the dialog in a portal (document.body). |
| `children` | `ReactNode` | — | Dialog content (DialogHeader, DialogBody, DialogFooter). |
| `className` | `string` | — | Additional CSS class names for the dialog panel. |
| `style` | `CSSProperties` | — | Inline styles for the dialog panel. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `id` | `string` | — | HTML id attribute. |
| `ref` | `Ref` | — | Ref to the dialog panel element. |

### DialogHeader

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Header content (typically a title string). |
| `showClose` | `boolean` | — | Whether to show the close button. |
| `description` | `string` | — | Optional description text below the title. |
| `className` | `string` | — | Additional CSS class names. |

### DialogBody

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Body content. |
| `className` | `string` | — | Additional CSS class names. |

### DialogFooter

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Footer content (typically action buttons). |
| `align` | `'left' \| 'center' \| 'right' \| 'space-between'` | — | Horizontal alignment of footer content. |
| `className` | `string` | — | Additional CSS class names. |

## Accessibility

- Renders with `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` links to the title (via `title` prop or `DialogHeader`)
- `aria-describedby` links to the description when provided
- Focus is trapped within the dialog by default
- Escape key closes the dialog (configurable)
- Clicking outside (overlay) closes the dialog (configurable)
- Focus returns to the trigger element when the dialog closes
- Animated enter/exit transitions with CSS
- Uses `createPortal` to render outside the DOM hierarchy for proper stacking
