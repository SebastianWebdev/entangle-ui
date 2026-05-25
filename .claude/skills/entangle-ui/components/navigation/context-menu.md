# ContextMenu

> Composable right-click context menu. Scope menus per area, reuse the shared Menu item primitives, or drop in a fully custom panel.

Right-click context menu that wraps any element and opens on right-click or long-press. Compose the trigger area and content as children, reuse the shared `Menu.*` item primitives, or pass a fully custom panel (tabs, search, etc.) into the content. There is **no config resolver and no payload** — scope menus by giving each area its own `ContextMenu`. Built on `@base-ui/react` ContextMenu primitives.

## Import

```tsx
import { ContextMenu, Menu } from 'entangle-ui';
```

## Compound parts

- `ContextMenu` — root, owns open/close state for one trigger area.
- `ContextMenu.Trigger` — the right-click area (`display: contents` by default).
- `ContextMenu.Content` — positioned popup placed at the pointer; holds items or any custom node.

Items reuse the shared `Menu.*` primitives (`Menu.Item`, `Menu.Group`, `Menu.Separator`, `Menu.RadioGroup`, `Menu.CheckboxItem`, `Menu.Sub` …). See the Menu reference.

## Usage

```tsx
<ContextMenu>
  <ContextMenu.Trigger>
    <div className="editor-viewport">Right-click here</div>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <Menu.Item shortcut="⌘X" onClick={handleCut}>
      Cut
    </Menu.Item>
    <Menu.Item shortcut="⌘C" onClick={handleCopy}>
      Copy
    </Menu.Item>
    <Menu.Item shortcut="⌘V" onClick={handlePaste}>
      Paste
    </Menu.Item>
  </ContextMenu.Content>
</ContextMenu>
```

## Per-area menus

Give different areas different menus by giving each its own `ContextMenu`. The menu is defined where the area lives — no branching inside a resolver function.

```tsx
<ContextMenu>
  <ContextMenu.Trigger>
    <Canvas />
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <Menu.Item onClick={addNode}>Add Node</Menu.Item>
  </ContextMenu.Content>
</ContextMenu>

<ContextMenu>
  <ContextMenu.Trigger>
    <NodeCard node={node} />
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <Menu.Item onClick={() => rename(node)}>Rename</Menu.Item>
    <Menu.Item disabled={node.locked} onClick={() => remove(node)}>
      Delete
    </Menu.Item>
  </ContextMenu.Content>
</ContextMenu>
```

For lists, map each item to its own `ContextMenu`.

## Custom panels

`ContextMenu.Content` accepts any node. The component handles open/close and positioning; you render the panel (tabs, search, color grid, …).

```tsx
<ContextMenu>
  <ContextMenu.Trigger>
    <NodeCanvas />
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <Tabs defaultValue="add">
      <TabList>
        <Tab value="add">Add</Tab>
        <Tab value="recent">Recent</Tab>
      </TabList>
      <TabPanel value="add">
        <Input placeholder="Search nodes…" />
      </TabPanel>
      <TabPanel value="recent">{/* recent nodes */}</TabPanel>
    </Tabs>
  </ContextMenu.Content>
</ContextMenu>
```

## Selection / submenus

Reuse the Menu selection and submenu primitives inside `ContextMenu.Content`:

```tsx
<ContextMenu.Content>
  <Menu.RadioGroup value={mode} onValueChange={setMode}>
    <Menu.RadioItem value="edit">Edit Mode</Menu.RadioItem>
    <Menu.RadioItem value="object">Object Mode</Menu.RadioItem>
  </Menu.RadioGroup>
  <Menu.Separator />
  <Menu.Sub>
    <Menu.SubTrigger>Add Object</Menu.SubTrigger>
    <Menu.SubContent>
      <Menu.Item onClick={addCube}>Cube</Menu.Item>
      <Menu.Item onClick={addSphere}>Sphere</Menu.Item>
    </Menu.SubContent>
  </Menu.Sub>
</ContextMenu.Content>
```

## Props

### ContextMenu (root)

| Prop           | Type                      | Default | Description                        |
| -------------- | ------------------------- | ------- | ---------------------------------- |
| `children`     | `ReactNode`               | —       | Trigger and content.               |
| `open`         | `boolean`                 | —       | Controlled open state.             |
| `defaultOpen`  | `boolean`                 | —       | Uncontrolled initial open state.   |
| `onOpenChange` | `(open: boolean) => void` | —       | Called when the menu opens/closes. |
| `disabled`     | `boolean`                 | `false` | Disables opening the menu.         |

### ContextMenu.Trigger

| Prop        | Type            | Default | Description                                       |
| ----------- | --------------- | ------- | ------------------------------------------------- |
| `children`  | `ReactNode`     | —       | The right-click target area.                      |
| `className` | `string`        | —       | Additional CSS class names.                       |
| `style`     | `CSSProperties` | —       | Inline styles (merged over `display: contents`).  |

### ContextMenu.Content

| Prop        | Type            | Default | Description                       |
| ----------- | --------------- | ------- | --------------------------------- |
| `children`  | `ReactNode`     | —       | Items, groups, or custom content. |
| `className` | `string`        | —       | Additional CSS class names.       |
| `style`     | `CSSProperties` | —       | Inline styles for the popup.      |
| `testId`    | `string`        | —       | Test identifier.                  |

## Accessibility

- Built on `@base-ui/react` ContextMenu primitives with proper ARIA roles
- The trigger uses `display: contents` so it adds no extra DOM node
- Full keyboard navigation inside the menu: Arrow Up/Down, Enter, Escape
- Focus is managed automatically when the menu opens and closes
