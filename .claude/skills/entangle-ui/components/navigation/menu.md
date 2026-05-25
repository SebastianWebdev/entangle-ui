# Menu

> Composable menu with icon/label/shortcut items, radio and checkbox selection, grouped items, nested submenus, and keyboard navigation.

Composable menu component for editor interfaces. Build menus by composing
`Menu.Trigger`, `Menu.Content`, and item primitives — no configuration object.
Each item lays out as **icon (left) · label (center) · shortcut/action
(right)**. Built on top of `@base-ui/react` Menu primitives with full keyboard
navigation support.

**Live Preview**

## Import

```tsx
import { Menu } from 'entangle-ui';
```

## Usage

```tsx
<Menu>
  <Menu.Trigger>Options</Menu.Trigger>
  <Menu.Content>
    <Menu.Item onClick={handleCopy}>Copy</Menu.Item>
    <Menu.Item onClick={handlePaste}>Paste</Menu.Item>
    <Menu.Item onClick={handleDelete}>Delete</Menu.Item>
  </Menu.Content>
</Menu>
```

`Menu.Trigger` renders the library `Button` by default. Pass `render` to use a
different element (for example an `IconButton`):

```tsx
<Menu.Trigger
  render={
    <IconButton aria-label="More actions">
      <DotsVerticalIcon size="sm" />
    </IconButton>
  }
/>
```

**Custom trigger**

## Positioning

The menu opens below the trigger and is **start-aligned** by default, so its
edge lines up with the trigger edge (rather than centering, which clips
triggers near the viewport edge). Override placement on `Menu.Content` with
`side`, `align`, `sideOffset`, and `alignOffset`.

The gap between every popup (the menu and its submenus) and its anchor is set
once on the `Menu` root via `gap` (default `8`), so you don't repeat it per
submenu:

```tsx
<Menu gap={12}>
  <Menu.Trigger>Options</Menu.Trigger>
  <Menu.Content side="bottom" align="end">
    …
  </Menu.Content>
</Menu>
```

## Item Anatomy

Every item exposes three slots. `icon` sits on the left, the children are the
label, and `shortcut` / `endContent` sit on the right.

```tsx
<Menu.Item
  icon={<SaveIcon />}
  shortcut="⌘S"
  endContent={<Badge>3</Badge>}
  onClick={handleSave}
>
  Save
</Menu.Item>
```

**Icons & shortcuts**

`endContent` accepts any node — a badge, a `Switch`, etc. — rendered on the
right of the row.

**Right-side actions (endContent)**

## Groups and Separators

Wrap related items in `Menu.Group` for an optional label, and split sections
with `Menu.Separator`.

```tsx
<Menu.Content>
  <Menu.Group label="File">
    <Menu.Item shortcut="⌘N">New File</Menu.Item>
    <Menu.Item shortcut="⌘S">Save</Menu.Item>
  </Menu.Group>
  <Menu.Separator />
  <Menu.Group label="Edit">
    <Menu.Item shortcut="⌘Z">Undo</Menu.Item>
    <Menu.Item shortcut="⇧⌘Z">Redo</Menu.Item>
  </Menu.Group>
</Menu.Content>
```

**Groups & separators**

## Radio Selection

Single selection within a group. `Menu.RadioGroup` owns the selected value and
each `Menu.RadioItem` shows an indicator when active.

```tsx
const [view, setView] = useState('perspective');

<Menu.Content>
  <Menu.RadioGroup value={view} onValueChange={setView}>
    <Menu.RadioItem value="perspective">Perspective</Menu.RadioItem>
    <Menu.RadioItem value="orthographic">Orthographic</Menu.RadioItem>
    <Menu.RadioItem value="front">Front</Menu.RadioItem>
  </Menu.RadioGroup>
</Menu.Content>;
```

**Radio selection**

## Checkbox Selection

Each `Menu.CheckboxItem` owns its own checked state.

```tsx
const [grid, setGrid] = useState(true);
const [wireframe, setWireframe] = useState(false);

<Menu.Content>
  <Menu.Group label="Overlays">
    <Menu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
      Grid
    </Menu.CheckboxItem>
    <Menu.CheckboxItem checked={wireframe} onCheckedChange={setWireframe}>
      Wireframe
    </Menu.CheckboxItem>
  </Menu.Group>
</Menu.Content>;
```

**Checkbox selection**

## Nested Submenus

Compose `Menu.Sub`, `Menu.SubTrigger`, and `Menu.SubContent`. The submenu
trigger renders a chevron automatically.

```tsx
<Menu.Content>
  <Menu.Sub>
    <Menu.SubTrigger icon={<TransformIcon />}>Transform</Menu.SubTrigger>
    <Menu.SubContent>
      <Menu.Item onClick={handleMove}>Move</Menu.Item>
      <Menu.Item onClick={handleRotate}>Rotate</Menu.Item>
      <Menu.Item onClick={handleScale}>Scale</Menu.Item>
    </Menu.SubContent>
  </Menu.Sub>
</Menu.Content>
```

**Nested submenus**

## Disabled Items

```tsx
<Menu.Item disabled>Paste</Menu.Item>
```

**Disabled item**

## Custom Selection Indicators

Override the default radio/checkbox indicator per item via `indicator`.

```tsx
<Menu.RadioItem value="solid" indicator={<DotIcon />}>
  Solid
</Menu.RadioItem>
<Menu.CheckboxItem checked indicator={<TickIcon />}>
  Snapping
</Menu.CheckboxItem>
```

## API

### Menu

The root. Owns open/close state.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Trigger and content of the menu. |
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | — | Uncontrolled initial open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the menu opens or closes. |
| `modal` | `boolean` | `true` | Whether the menu traps interaction while open. |
| `disabled` | `boolean` | `false` | Disables opening the menu. |
| `gap` | `number` | `8` | Gap in px between every popup (the menu and its submenus) and its anchor. Set once for the whole menu. |

### Menu.Trigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Trigger content. |
| `render` | `ReactElement` | `` | Replace the default Button with a custom element. |
| `openOnHover` | `boolean` | `false` | Also open the menu when the trigger is hovered. |
| `disabled` | `boolean` | `false` | Disables the trigger. |

### Menu.Content

The positioned popup surface. Place items or any custom node inside.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Items, groups, or custom panel content. |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | — | Preferred side relative to the trigger. |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Alignment along the chosen side. Defaults to start, so the menu edge lines up with the trigger edge instead of centering. |
| `sideOffset` | `number` | `Menu gap (8)` | Gap in px between this popup and its anchor. Defaults to the Menu `gap`; set this to override a single popup. |
| `alignOffset` | `number` | — | Offset in px along the alignment axis. |

### Menu.Item

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Label content (center slot). |
| `icon` | `ReactNode` | — | Icon rendered in the left slot. |
| `shortcut` | `ReactNode` | — | Keyboard shortcut hint rendered on the right. |
| `endContent` | `ReactNode` | — | Arbitrary node rendered on the right (badge, switch, etc.). |
| `onClick` | `(event: MouseEvent) => void` | — | Click handler. |
| `disabled` | `boolean` | `false` | Disables the item. |
| `closeOnClick` | `boolean` | `true` | Whether clicking the item closes the menu. |

### Menu.RadioGroup / Menu.RadioItem

`RadioGroup` accepts `value`, `defaultValue`, and `onValueChange(value)`.
`RadioItem` requires a `value` and accepts the same `icon`-less slot props as
`Menu.Item` plus `indicator`.

### Menu.CheckboxItem

Accepts `checked`, `defaultChecked`, `onCheckedChange(checked)`, `indicator`,
`shortcut`, `endContent`, and `disabled`.

### Menu.Group

Accepts an optional `label` plus children.

### Menu.Sub / Menu.SubTrigger / Menu.SubContent

`Sub` groups the submenu. `SubTrigger` accepts `icon`, `disabled`, and children
(a chevron is added automatically). `SubContent` is the submenu popup and takes
the same props as `Menu.Content`.

## Accessibility

- Built on `@base-ui/react` Menu primitives with the WAI-ARIA menu pattern
- Full keyboard navigation: Arrow Up/Down to move, Enter to activate, Escape to close
- Radio groups use proper radio role semantics
- Group labels are exposed to screen readers
- Disabled items are excluded from keyboard navigation
- Focus is returned to the trigger when the menu closes
