# ListItem

> Reusable list row primitive with leading and trailing slots, selected/active/hover states, and built-in keyboard activation.

A reusable list row primitive. Encapsulates the common pattern of `leading | content | trailing` with hover, selected, active, and disabled states. When `onClick` is provided, the item becomes a keyboard-activatable button (Enter/Space). Backed by the `colors.surface.row` and `colors.surface.rowHover` tokens so list backgrounds stay subtle without competing with button hover state.

**Live Preview**

## Import

```tsx
import { ListItem } from 'entangle-ui';
```

## Usage

```tsx
<ListItem
  leading={<FileIcon />}
  trailing={<Badge color="success">done</Badge>}
  selected={id === activeId}
  onClick={() => select(id)}
>
  scene.blend
</ListItem>
```

## States

The component composes four orthogonal states. Multiple can be set at once.

**States**

```tsx
<ListItem onClick={fn}>Default</ListItem>
<ListItem onClick={fn} selected>Selected</ListItem>
<ListItem onClick={fn} active>Active</ListItem>
<ListItem disabled>Disabled</ListItem>
```

| Prop       | Effect                                                           |
| ---------- | ---------------------------------------------------------------- |
| `selected` | Persistent selection — accent-tinted background                  |
| `active`   | Pressed / open — stronger accent tint, typically transient       |
| `disabled` | Greyed out, pointer-events disabled, keyboard activation skipped |
| _(hover)_  | Automatic via the `surface.rowHover` token                       |

## Clickable Behavior

When `onClick` is set, the item renders as `role="button"` with `tabIndex={0}` and activates on Enter or Space. Try keyboard navigation in the demo below.

**Clickable** — Tab to the rows, then press Enter or Space.

```tsx
<ListItem onClick={handleSelect}>Keyboard-activatable</ListItem>
```

For navigation lists, wrap children in your own `<a>` element instead of using `onClick`, so middle-click / right-click open in new tabs work natively.

## Leading and Trailing Slots

`leading` and `trailing` are both inline-flex containers. They flank the main content area and don't shrink — long content is truncated with ellipsis.

**Slots**

```tsx
<ListItem leading={<FileIcon />}>Leading only</ListItem>
<ListItem trailing={<ChevronIcon />}>Trailing only</ListItem>
<ListItem leading={<FileIcon />} trailing={<Badge color="success">12</Badge>}>
  Both slots
</ListItem>
```

## Density

**Density**

```tsx
<ListItem density="comfortable">32px row, default</ListItem>
<ListItem density="compact">24px row, dense lists</ListItem>
```

## In a List

Pair with `Stack` (with `gap={1}`) for a clean selectable list.

**Selectable list** — Click a row to select it — the selection persists with data-selected styling.

```tsx
<Stack gap={1}>
  {files.map(file => (
    <ListItem
      key={file.id}
      leading={<FileIcon type={file.type} />}
      trailing={<Badge color={statusColor(file)}>{file.status}</Badge>}
      selected={file.id === activeId}
      onClick={() => setActive(file.id)}
    >
      {file.name}
    </ListItem>
  ))}
</Stack>
```

## Props

| Prop        | Type                          | Default         | Description                                                      |
| ----------- | ----------------------------- | --------------- | ---------------------------------------------------------------- |
| `children`  | `ReactNode`                   | —               | Primary content (typically a title + optional description).      |
| `leading`   | `ReactNode`                   | —               | Leading content (icon, checkbox, avatar).                        |
| `trailing`  | `ReactNode`                   | —               | Trailing content (actions, badge, chevron).                      |
| `onClick`   | `(event: MouseEvent) => void` | —               | Click handler — when set, the item becomes keyboard-activatable. |
| `selected`  | `boolean`                     | `false`         | Persistent selection state.                                      |
| `active`    | `boolean`                     | `false`         | Pressed / opened state — typically transient.                    |
| `disabled`  | `boolean`                     | `false`         | Disables hover and pointer events; skips keyboard activation.    |
| `density`   | `'compact' \| 'comfortable'`  | `'comfortable'` | Row density — compact (24px) or comfortable (32px).              |
| `className` | `string`                      | —               | Additional CSS class names.                                      |
| `style`     | `CSSProperties`               | —               | Inline styles.                                                   |
| `testId`    | `string`                      | —               | Test identifier for automated testing.                           |
| `ref`       | `Ref`                         | —               | Ref to the underlying div element.                               |

## Theme Tokens

| Token                     | Used for                             |
| ------------------------- | ------------------------------------ |
| `colors.surface.row`      | Default row background (transparent) |
| `colors.surface.rowHover` | Hover background (subtle)            |
| `colors.accent.primary`   | Selected and active tint             |
| `colors.text.primary`     | Foreground content                   |
| `colors.text.secondary`   | Leading content (icon)               |
| `colors.text.muted`       | Trailing content                     |

## Accessibility

- `role="button"` and `tabIndex={0}` are added when `onClick` is provided
- `aria-disabled` is set when `disabled` is true
- Selected/active state is exposed via `data-selected` / `data-active` attributes for styling, plus the visible color treatment
- Keyboard: Enter and Space activate the click handler when clickable
- Disabled rows are skipped during keyboard activation
