# Button

> Versatile button component for editor interfaces with multiple variants, sizes, and states.

Versatile button component optimized for professional editor interfaces. Supports multiple variants, sizes, loading states, and icons.

**Live Preview**

## Import

```tsx
import { Button } from 'entangle-ui';
```

## Usage

```tsx
<Button variant="default" size="md">
  Save
</Button>
```

## Variants

The `variant` prop controls the button's visual style.

**default** — Transparent with border, fills on hover. Use for secondary actions.

```tsx
  <Button variant="default">Default</Button>
  ```

**ghost** — No border, subtle hover state. Use for inline or low-emphasis actions.

```tsx
  <Button variant="ghost">Ghost</Button>
  ```

**filled** — Solid background with accent color. Use for primary actions.

```tsx
  <Button variant="filled">Filled</Button>
  ```

## Sizes

Sizes are optimized for editor interface density.

```tsx
<Button size="sm">Small (20px)</Button>
<Button size="md">Medium (24px)</Button>
<Button size="lg">Large (32px)</Button>
```

| Size | Height | Use case          |
| ---- | ------ | ----------------- |
| `sm` | 20px   | Compact toolbars  |
| `md` | 24px   | Standard panels   |
| `lg` | 32px   | Prominent actions |

## With Icon

Pass an icon element via the `icon` prop. Icons should be 16x16px for optimal appearance.

```tsx
import { SaveIcon, PlayIcon } from 'entangle-ui';

<Button icon={<SaveIcon />}>Save</Button>
<Button icon={<PlayIcon />} variant="filled">Play</Button>
```

## Loading State

The `loading` prop shows a spinner and disables interaction. Use for async operations.

```tsx
<Button loading>Saving...</Button>
<Button loading variant="filled">Publishing</Button>
```

## Full Width

The `fullWidth` prop makes the button span the full width of its container. Useful for form actions and modal buttons.

```tsx
<Button variant="filled" fullWidth>
  Confirm Action
</Button>
```

## Disabled

```tsx
<Button disabled>Disabled</Button>
<Button disabled variant="filled">Disabled Filled</Button>
```

## Combining Props

```tsx
<Button
  icon={<SaveIcon />}
  variant="filled"
  size="lg"
  loading={isSaving}
  onClick={handleSave}
>
  Save Project
</Button>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Button content — text, icons, or other React elements. |
| `variant` | `'default' \| 'ghost' \| 'filled'` | `'default'` | Visual variant of the button. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant optimized for editor interfaces. |
| `disabled` | `boolean` | `false` | Whether the button is disabled. |
| `loading` | `boolean` | `false` | Loading state — shows spinner and disables interaction. |
| `icon` | `ReactNode` | — | Icon element to display before text. Should be 16x16px. |
| `fullWidth` | `boolean` | `false` | Whether the button should take the full width of the container. |
| `onClick` | `(event: MouseEvent) => void` | — | Click event handler. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying button element. |

The component also accepts all standard HTML `<button>` attributes.

## Accessibility

- Renders a native `<button>` element
- Supports keyboard navigation (Enter/Space to activate)
- `disabled` and `loading` states set `disabled` on the native element
- Use meaningful text content or `aria-label` for icon-only buttons
