# ContextMenu

> Right-click context menu with dynamic configuration, payload-aware items, selection states, and nested submenus.

Right-click context menu component that wraps any element and provides a native-feeling context menu on right-click. Supports static and dynamic configuration, payload-aware item resolution, radio/checkbox selection, nested submenus, and full keyboard navigation. Built on `@base-ui/react` ContextMenu primitives and shares the same configuration format as Menu.

**Live Preview**

## Import

```tsx
import { ContextMenu } from 'entangle-ui';
```

## Usage

```tsx
const config = {
  groups: [
    {
      id: 'actions',
      items: [
        { id: 'copy', label: 'Copy', onClick: handleCopy },
        { id: 'paste', label: 'Paste', onClick: handlePaste },
        { id: 'delete', label: 'Delete', onClick: handleDelete },
      ],
      itemSelectionType: 'none',
    },
  ],
};

<ContextMenu config={config}>
  <div className="editor-viewport">Right-click anywhere in this area</div>
</ContextMenu>;
```

## Dynamic Configuration

Pass a function instead of a static config object. The function receives context about the right-click event, including the target element and optional payload.

```tsx
<ContextMenu
  config={context => ({
    groups: [
      {
        id: 'actions',
        items: [
          {
            id: 'inspect',
            label: `Inspect ${context.payload?.name ?? 'item'}`,
            onClick: () => inspectItem(context.payload),
          },
          {
            id: 'delete',
            label: 'Delete',
            onClick: () => deleteItem(context.payload?.id),
            disabled: context.payload?.locked,
          },
        ],
        itemSelectionType: 'none',
      },
    ],
  })}
  payload={{ id: '123', name: 'Cube', locked: false }}
>
  <div>Right-click me</div>
</ContextMenu>
```

The `context` object contains:

| Property  | Type                  | Description                              |
| --------- | --------------------- | ---------------------------------------- |
| `event`   | `MouseEvent \| null`  | The native contextmenu event.            |
| `target`  | `HTMLElement \| null` | The element that was right-clicked.      |
| `payload` | `TPayload`            | The payload prop value from the trigger. |

## Payload

The `payload` prop lets you attach data to the trigger area. This data is passed to the config resolver function, allowing different context menus for different items in a list.

```tsx
{
  items.map(item => (
    <ContextMenu
      key={item.id}
      config={ctx => buildMenuForItem(ctx.payload)}
      payload={item}
    >
      <div>{item.name}</div>
    </ContextMenu>
  ));
}
```

## Selection States

ContextMenu supports the same selection types as Menu: radio, checkbox, and none.

```tsx
const [selected, setSelected] = useState({ mode: ['edit'] });

const config = {
  groups: [
    {
      id: 'mode',
      label: 'Mode',
      items: [
        { id: 'edit', label: 'Edit Mode', onClick: () => {} },
        { id: 'object', label: 'Object Mode', onClick: () => {} },
        { id: 'sculpt', label: 'Sculpt Mode', onClick: () => {} },
      ],
      itemSelectionType: 'radio',
    },
  ],
};

<ContextMenu config={config} selectedItems={selected} onChange={setSelected}>
  <div>Right-click for mode selection</div>
</ContextMenu>;
```

## Nested Submenus

Items with a `subMenu` property create nested context menus, just like the Menu component.

```tsx
const config = {
  groups: [
    {
      id: 'actions',
      items: [
        {
          id: 'add',
          label: 'Add Object',
          onClick: () => {},
          subMenu: {
            groups: [
              {
                id: 'objects',
                items: [
                  { id: 'cube', label: 'Cube', onClick: addCube },
                  { id: 'sphere', label: 'Sphere', onClick: addSphere },
                  { id: 'plane', label: 'Plane', onClick: addPlane },
                ],
                itemSelectionType: 'none',
              },
            ],
          },
        },
      ],
      itemSelectionType: 'none',
    },
  ],
};
```

## Disabled

```tsx
<ContextMenu config={config} disabled>
  <div>Context menu is disabled here</div>
</ContextMenu>
```

## Props

| Prop            | Type                                                              | Default | Description                                                                 |
| --------------- | ----------------------------------------------------------------- | ------- | --------------------------------------------------------------------------- |
| `config`        | `MenuConfig \| (context: ContextMenuTargetDetails) => MenuConfig` | —       | Static menu config or resolver function called with trigger context.        |
| `selectedItems` | `Record<string, string[]>`                                        | —       | Currently selected items grouped by group ID.                               |
| `onChange`      | `(selection: MenuSelection) => void`                              | —       | Callback when selection state changes.                                      |
| `children`      | `ReactNode`                                                       | —       | Content that acts as the right-click trigger area.                          |
| `payload`       | `TPayload`                                                        | —       | Optional data attached to this trigger area, passed to the config resolver. |
| `checkboxIcon`  | `ReactNode`                                                       | ``      | Custom icon for checkbox selected state.                                    |
| `radioIcon`     | `ReactNode`                                                       | ``      | Custom icon for radio selected state.                                       |
| `disabled`      | `boolean`                                                         | `false` | Disables opening the context menu.                                          |
| `className`     | `string`                                                          | —       | Additional CSS class names for the menu popup.                              |
| `style`         | `CSSProperties`                                                   | —       | Inline styles for the menu popup.                                           |
| `testId`        | `string`                                                          | —       | Test identifier for automated testing.                                      |
| `ref`           | `Ref`                                                             | —       | Ref to the menu popup element.                                              |

The ContextMenu shares the same `MenuConfig`, `MenuGroup`, and `MenuItem` types as the [Menu](/components/navigation/menu) component.

## Accessibility

- Built on `@base-ui/react` ContextMenu primitives with proper ARIA roles
- The trigger uses `display: contents` so it does not add extra DOM nodes
- Full keyboard navigation inside the menu: Arrow Up/Down, Enter, Escape
- Radio groups use proper radio semantics
- Group labels are exposed to screen readers
- Focus is managed automatically when the context menu opens and closes
