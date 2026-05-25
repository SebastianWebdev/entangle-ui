# Menu

> Composable menu with icon/label/shortcut items, radio and checkbox selection, grouped items, nested submenus, and keyboard navigation.

Composable menu component for editor interfaces. Build menus by composing the trigger, content, and item primitives — there is no configuration object. Each item lays out as **icon (left) · label (center) · shortcut/action (right)**. Built on top of `@base-ui/react` Menu primitives with full keyboard navigation.

## Import

```tsx
import { Menu } from 'entangle-ui';
```

## Compound parts

- `Menu` — root, owns open/close state.
- `Menu.Trigger` — opens the menu; renders the library `Button` by default (`render` to override).
- `Menu.Content` — positioned popup surface; holds items or any custom node.
- `Menu.Item` — actionable row with `icon`, `shortcut`, `endContent` slots.
- `Menu.Group` — visually grouped items with an optional `label`.
- `Menu.Separator` — divider.
- `Menu.RadioGroup` / `Menu.RadioItem` — single selection.
- `Menu.CheckboxItem` — toggle.
- `Menu.Sub` / `Menu.SubTrigger` / `Menu.SubContent` — nested submenu (SubTrigger renders a chevron automatically).

## Usage

```tsx
<Menu>
  <Menu.Trigger>Options</Menu.Trigger>
  <Menu.Content>
    <Menu.Item icon={<CopyIcon />} shortcut="⌘C" onClick={handleCopy}>
      Copy
    </Menu.Item>
    <Menu.Item icon={<PasteIcon />} shortcut="⌘V" onClick={handlePaste}>
      Paste
    </Menu.Item>
  </Menu.Content>
</Menu>
```

Custom trigger element:

```tsx
<Menu.Trigger render={<IconButton label="More" icon={<MoreIcon />} />} />
```

## Item slots

`icon` is the left slot, children are the label, `shortcut` and `endContent` are the right slots.

```tsx
<Menu.Item icon={<SaveIcon />} shortcut="⌘S" endContent={<Badge>3</Badge>}>
  Save
</Menu.Item>
```

## Groups and separators

```tsx
<Menu.Content>
  <Menu.Group label="File">
    <Menu.Item shortcut="⌘N">New File</Menu.Item>
    <Menu.Item shortcut="⌘S">Save</Menu.Item>
  </Menu.Group>
  <Menu.Separator />
  <Menu.Group label="Edit">
    <Menu.Item shortcut="⌘Z">Undo</Menu.Item>
  </Menu.Group>
</Menu.Content>
```

## Radio selection

```tsx
const [view, setView] = useState('perspective');

<Menu.RadioGroup value={view} onValueChange={setView}>
  <Menu.RadioItem value="perspective">Perspective</Menu.RadioItem>
  <Menu.RadioItem value="orthographic">Orthographic</Menu.RadioItem>
</Menu.RadioGroup>;
```

## Checkbox selection

```tsx
const [grid, setGrid] = useState(true);

<Menu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
  Grid
</Menu.CheckboxItem>;
```

## Nested submenus

```tsx
<Menu.Sub>
  <Menu.SubTrigger icon={<TransformIcon />}>Transform</Menu.SubTrigger>
  <Menu.SubContent>
    <Menu.Item onClick={handleMove}>Move</Menu.Item>
    <Menu.Item onClick={handleRotate}>Rotate</Menu.Item>
  </Menu.SubContent>
</Menu.Sub>
```

## Props

### Menu (root)

| Prop           | Type                      | Default | Description                          |
| -------------- | ------------------------- | ------- | ------------------------------------ |
| `children`     | `ReactNode`               | —       | Trigger and content.                 |
| `open`         | `boolean`                 | —       | Controlled open state.               |
| `defaultOpen`  | `boolean`                 | —       | Uncontrolled initial open state.     |
| `onOpenChange` | `(open: boolean) => void` | —       | Called when the menu opens/closes.   |
| `modal`        | `boolean`                 | `true`  | Trap interaction while open.         |
| `disabled`     | `boolean`                 | `false` | Disables opening the menu.           |
| `gap`          | `number`                  | `8`     | Gap (px) between every popup (menu + submenus) and its anchor. Set once for the whole menu. |

### Menu.Trigger

| Prop          | Type           | Default      | Description                             |
| ------------- | -------------- | ------------ | --------------------------------------- |
| `children`    | `ReactNode`    | —            | Trigger content.                        |
| `render`      | `ReactElement` | `<Button />` | Replace the default trigger element.    |
| `openOnHover` | `boolean`      | `false`      | Also open on hover.                     |
| `disabled`    | `boolean`      | `false`      | Disables the trigger.                   |

### Menu.Content

| Prop          | Type                                     | Default | Description                       |
| ------------- | ---------------------------------------- | ------- | --------------------------------- |
| `children`    | `ReactNode`                              | —       | Items, groups, or custom content. |
| `side`        | `'top' \| 'right' \| 'bottom' \| 'left'` | —       | Preferred side.                   |
| `align`       | `'start' \| 'center' \| 'end'`           | `'start'` | Alignment along the side. Start-aligned so the menu edge lines up with the trigger edge (avoids clipping near the viewport edge). |
| `sideOffset`  | `number`                                 | Menu `gap` (8) | Gap between anchor and popup; overrides the menu-wide `gap` for one popup. |
| `alignOffset` | `number`                                 | —       | Offset along the alignment axis.  |

### Menu.Item

| Prop           | Type                          | Default | Description                          |
| -------------- | ----------------------------- | ------- | ------------------------------------ |
| `children`     | `ReactNode`                   | —       | Label (center slot).                 |
| `icon`         | `ReactNode`                   | —       | Left slot.                           |
| `shortcut`     | `ReactNode`                   | —       | Right slot, shortcut hint.           |
| `endContent`   | `ReactNode`                   | —       | Right slot, arbitrary node.          |
| `onClick`      | `(event: MouseEvent) => void` | —       | Click handler.                       |
| `disabled`     | `boolean`                     | `false` | Disables the item.                   |
| `closeOnClick` | `boolean`                     | `true`  | Close the menu when clicked.         |

### Menu.RadioGroup / Menu.RadioItem

`RadioGroup`: `value`, `defaultValue`, `onValueChange(value: string)`. `RadioItem`: requires `value`; supports `indicator`, `shortcut`, `endContent`, `disabled`, `closeOnClick` (default `false`).

### Menu.CheckboxItem

`checked`, `defaultChecked`, `onCheckedChange(checked: boolean)`, `indicator`, `shortcut`, `endContent`, `disabled`, `closeOnClick` (default `false`).

### Menu.Group

`label?: ReactNode` plus children.

### Menu.Sub / Menu.SubTrigger / Menu.SubContent

`Sub`: `defaultOpen?`. `SubTrigger`: `icon`, `disabled`, children (chevron added automatically). `SubContent`: same props as `Menu.Content`.

## Accessibility

- Built on `@base-ui/react` Menu primitives with the WAI-ARIA menu pattern
- Arrow Up/Down to move, Enter to activate, Escape to close
- Radio groups use proper radio role semantics
- Group labels are exposed to screen readers
- Disabled items are excluded from keyboard navigation
- Focus returns to the trigger when the menu closes
