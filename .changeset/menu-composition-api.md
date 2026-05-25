---
'entangle-ui': minor
---

Migrate `Menu` and `ContextMenu` from a configuration object to a composition API.

**Breaking change.** The `config`, `selectedItems`, `onChange`, `checkboxIcon`, `radioIcon` props (and the `useMenu` / `useContextMenuTarget` hooks, plus the `MenuConfig` / `MenuItem` / `MenuSelection` / `ContextMenuConfig` / `ContextMenuTargetDetails` types) are removed. Menus are now built by composing child components.

- **Menu** — `Menu.Trigger`, `Menu.Content`, `Menu.Item`, `Menu.Group`, `Menu.Separator`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.CheckboxItem`, `Menu.Sub`, `Menu.SubTrigger`, `Menu.SubContent`.
- **Menu.Item** lays out as icon (left) · label (center) · `shortcut` / `endContent` (right), like MUI's `MenuItem`.
- **ContextMenu** — `ContextMenu`, `ContextMenu.Trigger`, `ContextMenu.Content`. The dynamic `config(context)` resolver and `payload` are gone: scope menus by giving each area its own `ContextMenu`, and pass any custom node (tabs, search, custom panels) into `ContextMenu.Content`. Items reuse the shared `Menu.*` primitives.

```tsx
<Menu>
  <Menu.Trigger>Options</Menu.Trigger>
  <Menu.Content>
    <Menu.Item icon={<CopyIcon />} shortcut="⌘C" onClick={copy}>
      Copy
    </Menu.Item>
  </Menu.Content>
</Menu>

<ContextMenu>
  <ContextMenu.Trigger>
    <Canvas />
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <Menu.Item onClick={addNode}>Add Node</Menu.Item>
  </ContextMenu.Content>
</ContextMenu>
```
