# Toolbar
> Configurable toolbar with buttons, toggles, groups, separators, and roving tabindex keyboard navigation.

Toolbar component for editor interfaces with support for action buttons, toggle buttons, logical groups, separators, and spacers. Works in both horizontal and vertical orientations. Implements roving tabindex for keyboard navigation.

**Live Preview**

## Import

```tsx
import { Toolbar } from 'entangle-ui';
```

## Usage

```tsx
import { SaveIcon, UndoIcon, RedoIcon } from 'entangle-ui';

<Toolbar aria-label="Main toolbar">
  <Toolbar.Group>
    <Toolbar.Button icon={<SaveIcon />} tooltip="Save" onClick={handleSave} />
    <Toolbar.Button icon={<UndoIcon />} tooltip="Undo" onClick={handleUndo} />
    <Toolbar.Button icon={<RedoIcon />} tooltip="Redo" onClick={handleRedo} />
  </Toolbar.Group>
  <Toolbar.Separator />
  <Toolbar.Toggle
    icon={<GridIcon />}
    tooltip="Toggle Grid"
    pressed={gridVisible}
    onPressedChange={setGridVisible}
  />
  <Toolbar.Spacer />
  <Toolbar.Button onClick={handleRender} variant="filled">
    Render
  </Toolbar.Button>
</Toolbar>;
```

## Compound Components

| Component           | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `Toolbar.Button`    | Standard action button with icon and/or text |
| `Toolbar.Toggle`    | Toggle button with pressed/unpressed state   |
| `Toolbar.Group`     | Logical grouping of related buttons          |
| `Toolbar.Separator` | Visual divider between groups                |
| `Toolbar.Spacer`    | Flexible spacer that pushes items apart      |

## Orientation

The toolbar supports both horizontal (default) and vertical orientations. The keyboard navigation arrow keys adapt automatically.

```tsx
{
  /* Horizontal (default) */
}
<Toolbar orientation="horizontal" aria-label="Top toolbar">
  <Toolbar.Button icon={<SelectIcon />} tooltip="Select" />
  <Toolbar.Button icon={<MoveIcon />} tooltip="Move" />
</Toolbar>;

{
  /* Vertical */
}
<Toolbar orientation="vertical" aria-label="Side toolbar">
  <Toolbar.Button icon={<SelectIcon />} tooltip="Select" />
  <Toolbar.Button icon={<MoveIcon />} tooltip="Move" />
  <Toolbar.Button icon={<RotateIcon />} tooltip="Rotate" />
</Toolbar>;
```

## Sizes

The `size` prop controls the density of toolbar buttons.

```tsx
<Toolbar size="sm" aria-label="Compact toolbar">
  <Toolbar.Button icon={<SaveIcon />} tooltip="Save" />
</Toolbar>

<Toolbar size="md" aria-label="Standard toolbar">
  <Toolbar.Button icon={<SaveIcon />} tooltip="Save" />
</Toolbar>
```

| Size | Use case                           |
| ---- | ---------------------------------- |
| `sm` | Compact toolbars, secondary panels |
| `md` | Standard toolbars (default)        |

## Button Variants

Toolbar buttons support three visual variants.

```tsx
<Toolbar>
  <Toolbar.Button variant="default" icon={<CopyIcon />} tooltip="Copy" />
  <Toolbar.Button variant="ghost" icon={<SettingsIcon />} tooltip="Settings" />
  <Toolbar.Button variant="filled" onClick={handlePlay}>
    Play
  </Toolbar.Button>
</Toolbar>
```

| Variant   | Description                                 |
| --------- | ------------------------------------------- |
| `default` | Standard button appearance (default)        |
| `ghost`   | Minimal button with no border               |
| `filled`  | Solid accent background for primary actions |

## Toggle Buttons

Use `Toolbar.Toggle` for buttons that switch between pressed and unpressed states. The parent manages the state.

```tsx
const [wireframe, setWireframe] = useState(false);
const [snap, setSnap] = useState(true);

<Toolbar>
  <Toolbar.Toggle
    icon={<WireframeIcon />}
    tooltip="Wireframe Mode"
    pressed={wireframe}
    onPressedChange={setWireframe}
  />
  <Toolbar.Toggle
    icon={<MagnetIcon />}
    tooltip="Snap to Grid"
    pressed={snap}
    onPressedChange={setSnap}
  />
</Toolbar>;
```

## Groups and Separators

Use `Toolbar.Group` to logically group related buttons and `Toolbar.Separator` to add visual dividers. The separator orientation is automatically the opposite of the toolbar orientation (vertical separator in a horizontal toolbar).

```tsx
<Toolbar>
  <Toolbar.Group aria-label="Transform tools">
    <Toolbar.Button icon={<MoveIcon />} tooltip="Move" />
    <Toolbar.Button icon={<RotateIcon />} tooltip="Rotate" />
    <Toolbar.Button icon={<ScaleIcon />} tooltip="Scale" />
  </Toolbar.Group>
  <Toolbar.Separator />
  <Toolbar.Group aria-label="View options">
    <Toolbar.Toggle
      pressed={ortho}
      onPressedChange={setOrtho}
      tooltip="Orthographic"
      icon={<OrthoIcon />}
    />
  </Toolbar.Group>
</Toolbar>
```

## Spacer

`Toolbar.Spacer` is a flexible element that fills available space, allowing you to push items to opposite ends of the toolbar.

```tsx
<Toolbar>
  <Toolbar.Button icon={<MenuIcon />} tooltip="Menu" />
  <Toolbar.Spacer />
  <Toolbar.Button icon={<SettingsIcon />} tooltip="Settings" />
</Toolbar>
```

## Props

### Toolbar

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout orientation. Arrow key navigation adapts to match. |
| `size` | `'sm' \| 'md'` | `'md'` | Size of toolbar items. |
| `children` | `ReactNode` | — | Toolbar sub-components (Button, Toggle, Group, Separator, Spacer). |
| `aria-label` | `string` | — | Accessible label for the toolbar. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the root element. |

### Toolbar.Button

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `ReactNode` | — | Icon element to display. When provided, children text is visually hidden. |
| `children` | `ReactNode` | — | Label text. Hidden when an icon is provided. |
| `variant` | `'default' \| 'ghost' \| 'filled'` | `'default'` | Visual variant of the button. |
| `tooltip` | `string` | — | Tooltip text shown on hover (rendered as the native title attribute). |
| `onClick` | `() => void` | — | Click handler. |
| `disabled` | `boolean` | `false` | Whether the button is disabled. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the button element. |

### Toolbar.Toggle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `pressed` *(required)* | `boolean` | — | Whether the toggle is in the pressed state. |
| `onPressedChange` *(required)* | `(pressed: boolean) => void` | — | Called when the pressed state should change. |
| `icon` | `ReactNode` | — | Icon element to display. |
| `children` | `ReactNode` | — | Label text. |
| `tooltip` | `string` | — | Tooltip text shown on hover. |
| `disabled` | `boolean` | `false` | Whether the toggle is disabled. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the button element. |

### Toolbar.Group

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Grouped toolbar items. |
| `aria-label` | `string` | — | Accessible label for the group. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the group element. |

### Toolbar.Separator

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the separator element. |

### Toolbar.Spacer

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the spacer element. |

## Accessibility

- The root element has `role="toolbar"` with `aria-orientation` set to match the `orientation` prop
- Implements roving tabindex: only the toolbar container is in the tab order (`tabIndex={0}`), and arrow keys move focus between items
- **ArrowRight / ArrowDown** moves focus to the next button (depending on orientation)
- **ArrowLeft / ArrowUp** moves focus to the previous button
- **Home** moves focus to the first button
- **End** moves focus to the last button
- When the toolbar receives focus, the first button is automatically focused
- Toggle buttons use `aria-pressed` to communicate state
- Groups use `role="group"` and support an `aria-label`
- Separators use `role="separator"` with the appropriate `aria-orientation`
