# MenuBar
> Application menu bar with dropdown menus, sub-menus, keyboard shortcuts, and full keyboard navigation.

Application menu bar component for editor interfaces. Provides dropdown menus with items, sub-menus, separators, and keyboard shortcut labels. Supports full keyboard navigation with arrow keys and automatic menu switching on hover when a menu is open.

**Live Preview**

## Import

```tsx
import { MenuBar } from 'entangle-ui';
```

## Usage

```tsx
<MenuBar>
  <MenuBar.Menu label="File">
    <MenuBar.Item onClick={handleNew} shortcut="Ctrl+N">
      New
    </MenuBar.Item>
    <MenuBar.Item onClick={handleOpen} shortcut="Ctrl+O">
      Open
    </MenuBar.Item>
    <MenuBar.Separator />
    <MenuBar.Item onClick={handleSave} shortcut="Ctrl+S">
      Save
    </MenuBar.Item>
    <MenuBar.Item onClick={handleSaveAs} shortcut="Ctrl+Shift+S">
      Save As...
    </MenuBar.Item>
  </MenuBar.Menu>
  <MenuBar.Menu label="Edit">
    <MenuBar.Item onClick={handleUndo} shortcut="Ctrl+Z">
      Undo
    </MenuBar.Item>
    <MenuBar.Item onClick={handleRedo} shortcut="Ctrl+Shift+Z">
      Redo
    </MenuBar.Item>
    <MenuBar.Separator />
    <MenuBar.Item onClick={handleCut} shortcut="Ctrl+X">
      Cut
    </MenuBar.Item>
    <MenuBar.Item onClick={handleCopy} shortcut="Ctrl+C">
      Copy
    </MenuBar.Item>
    <MenuBar.Item onClick={handlePaste} shortcut="Ctrl+V">
      Paste
    </MenuBar.Item>
  </MenuBar.Menu>
</MenuBar>
```

## Compound Components

MenuBar uses a compound component pattern with the following sub-components:

| Component           | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `MenuBar.Menu`      | Top-level dropdown trigger and container            |
| `MenuBar.Item`      | Clickable menu item with optional icon and shortcut |
| `MenuBar.Sub`       | Nested sub-menu with hover-to-open behavior         |
| `MenuBar.Separator` | Visual divider between menu items                   |

## Sizes

The `size` prop controls the overall density of the menu bar.

**Sizes**

```tsx
<MenuBar size="sm">
  <MenuBar.Menu label="File">{/* ... */}</MenuBar.Menu>
</MenuBar>

<MenuBar size="md">
  <MenuBar.Menu label="File">{/* ... */}</MenuBar.Menu>
</MenuBar>
```

| Size | Use case                                |
| ---- | --------------------------------------- |
| `sm` | Compact layouts, secondary menus        |
| `md` | Standard application menu bar (default) |

## Sub-menus

Use `MenuBar.Sub` to create nested menus. Sub-menus open on hover with a short delay to prevent accidental closing.

**Sub-menus**

```tsx
<MenuBar.Menu label="View">
  <MenuBar.Item onClick={handleZoomIn}>Zoom In</MenuBar.Item>
  <MenuBar.Item onClick={handleZoomOut}>Zoom Out</MenuBar.Item>
  <MenuBar.Separator />
  <MenuBar.Sub label="Layout">
    <MenuBar.Item onClick={() => setLayout('single')}>Single</MenuBar.Item>
    <MenuBar.Item onClick={() => setLayout('split')}>Split View</MenuBar.Item>
    <MenuBar.Item onClick={() => setLayout('quad')}>Quad View</MenuBar.Item>
  </MenuBar.Sub>
</MenuBar.Menu>
```

## Menu Items with Icons

Items can display an icon before the label text.

**Menu Items with Icons**

```tsx
import { SaveIcon, CopyIcon } from 'entangle-ui';

<MenuBar.Item onClick={handleSave} icon={<SaveIcon />} shortcut="Ctrl+S">
  Save
</MenuBar.Item>
<MenuBar.Item onClick={handleCopy} icon={<CopyIcon />} shortcut="Ctrl+C">
  Copy
</MenuBar.Item>
```

## Disabled Items

Both menus and individual items can be disabled.

**Disabled Items**

```tsx
<MenuBar.Menu label="File">
  <MenuBar.Item onClick={handleSave} shortcut="Ctrl+S">Save</MenuBar.Item>
  <MenuBar.Item disabled>Export (unavailable)</MenuBar.Item>
</MenuBar.Menu>
<MenuBar.Menu label="Debug" disabled>
  {/* Entire menu is disabled */}
</MenuBar.Menu>
```

## Menu Offset

The `menuOffset` prop controls the vertical gap between the top-level trigger and the dropdown panel.

**Menu Offset**

```tsx
<MenuBar menuOffset={4}>
  <MenuBar.Menu label="File">{/* ... */}</MenuBar.Menu>
</MenuBar>
```

## Props

### MenuBar

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md'` | `'md'` | Size of the menu bar, controlling overall density. |
| `menuOffset` | `number` | `2` | Vertical gap in pixels between the trigger button and the dropdown panel. |
| `children` | `ReactNode` | — | MenuBar.Menu components. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the root element. |

### MenuBar.Menu

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` *(required)* | `string` | — | Text displayed on the trigger button. |
| `disabled` | `boolean` | `false` | Whether the entire menu is disabled. |
| `children` | `ReactNode` | — | Menu items (MenuBar.Item, MenuBar.Sub, MenuBar.Separator). |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the menu container element. |

### MenuBar.Item

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Item label text. |
| `onClick` | `() => void` | — | Click handler. The menu closes automatically after the handler fires. |
| `shortcut` | `string` | — | Keyboard shortcut display text (e.g., "Ctrl+S"). This is a visual label only and does not bind the shortcut. |
| `icon` | `ReactNode` | — | Icon element displayed before the label. |
| `disabled` | `boolean` | `false` | Whether the item is disabled. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the button element. |

### MenuBar.Sub

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` *(required)* | `string` | — | Sub-menu trigger label text. |
| `disabled` | `boolean` | `false` | Whether the sub-menu is disabled. |
| `children` | `ReactNode` | — | Sub-menu items. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the sub-menu container element. |

### MenuBar.Separator

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the separator element. |

## Accessibility

- The root element has `role="menubar"` and is focusable with `tabIndex={0}`
- Menu triggers use `role="menuitem"` with `aria-haspopup="true"` and `aria-expanded`
- Dropdown panels use `role="menu"` with `aria-label` set to the trigger label
- Full keyboard navigation:
  - **ArrowLeft / ArrowRight** to move between top-level menus
  - **ArrowDown / ArrowUp** to navigate items within a dropdown
  - **Enter / Space** to open a menu or activate an item
  - **Escape** to close the current dropdown and return focus to the trigger
- When a menu is open, hovering over another trigger automatically switches to that menu
- Separators use `role="separator"`
- Sub-menus use `aria-haspopup="true"` and `aria-expanded` on their trigger
