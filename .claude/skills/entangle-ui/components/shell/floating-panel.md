# FloatingPanel

> Draggable, resizable floating panel with collapse/expand, z-index stacking, and controlled/uncontrolled modes.

Draggable and resizable floating panel for editor tool windows, property inspectors, and other detachable UI. Supports drag-to-move via the header bar, corner resize, collapse/expand toggle, and optional close button. Works in both controlled and uncontrolled modes for position, size, and collapsed state. Use with `FloatingManager` for automatic z-index stacking of multiple panels.

**Live Preview**

## Import

```tsx
import { FloatingPanel, FloatingManager } from 'entangle-ui';
```

## Usage

```tsx
<FloatingPanel title="Properties" defaultPosition={{ x: 100, y: 100 }}>
  <p>Panel content goes here.</p>
</FloatingPanel>
```

## FloatingManager

When using multiple floating panels, wrap them in a `FloatingManager` to get automatic z-index stacking. Clicking a panel brings it to the front.

```tsx
<FloatingManager baseZIndex={100}>
  <FloatingPanel title="Inspector" defaultPosition={{ x: 50, y: 50 }}>
    <p>Inspector content</p>
  </FloatingPanel>
  <FloatingPanel title="Outliner" defaultPosition={{ x: 400, y: 50 }}>
    <p>Outliner content</p>
  </FloatingPanel>
  <FloatingPanel title="Console" defaultPosition={{ x: 50, y: 400 }}>
    <p>Console content</p>
  </FloatingPanel>
</FloatingManager>
```

## Drag and Resize

Panels are dragged by their header bar. Position is clamped to keep at least 50px visible horizontally and 30px vertically within the viewport.

Resize is handled via the bottom-right corner handle. The resize handle is only visible when `resizable` is `true` (the default) and the panel is not collapsed.

```tsx
<FloatingPanel
  title="Resizable Panel"
  defaultSize={{ width: 350, height: 250 }}
  minWidth={200}
  minHeight={150}
  maxWidth={600}
  maxHeight={500}
  resizable
>
  <p>Resize me from the bottom-right corner.</p>
</FloatingPanel>
```

## Controlled Mode

For full control over position, size, and collapsed state, use the controlled props.

```tsx
const [position, setPosition] = useState({ x: 100, y: 100 });
const [size, setSize] = useState({ width: 300, height: 200 });
const [collapsed, setCollapsed] = useState(false);

<FloatingPanel
  title="Controlled Panel"
  position={position}
  onPositionChange={setPosition}
  size={size}
  onSizeChange={setSize}
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
>
  <p>Fully controlled.</p>
</FloatingPanel>;
```

## Uncontrolled Mode

For simpler use cases, use the `default*` props and let the component manage its own state.

```tsx
<FloatingPanel
  title="Uncontrolled Panel"
  defaultPosition={{ x: 200, y: 150 }}
  defaultSize={{ width: 280, height: 200 }}
  defaultCollapsed={false}
>
  <p>Manages its own state.</p>
</FloatingPanel>
```

## Collapse and Close

The header always shows a collapse/expand toggle. The close button only appears when both `closable` is `true` (the default) and an `onClose` handler is provided.

```tsx
const [visible, setVisible] = useState(true);

{
  visible && (
    <FloatingPanel
      title="Closable Panel"
      closable
      onClose={() => setVisible(false)}
    >
      <p>Click the X to close.</p>
    </FloatingPanel>
  );
}
```

## Scrollable Content

Panel content is automatically wrapped in a `ScrollArea` that scrolls in both directions when content overflows.

## Props

### FloatingPanel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` *(required)* | `string` | — | Panel title displayed in the header bar. |
| `position` | `{ x: number; y: number }` | — | Controlled position in pixels. |
| `defaultPosition` | `{ x: number; y: number }` | `{ x: 100, y: 100 }` | Initial position for uncontrolled mode. |
| `onPositionChange` | `(position: { x: number; y: number }) => void` | — | Called when position changes during drag. |
| `size` | `{ width: number; height: number }` | — | Controlled size in pixels. |
| `defaultSize` | `{ width: number; height: number }` | `{ width: 280, height: 200 }` | Initial size for uncontrolled mode. |
| `onSizeChange` | `(size: { width: number; height: number }) => void` | — | Called when size changes during resize. |
| `minWidth` | `number` | `150` | Minimum panel width in pixels. |
| `minHeight` | `number` | `100` | Minimum panel height in pixels. |
| `maxWidth` | `number` | `Infinity` | Maximum panel width in pixels. |
| `maxHeight` | `number` | `Infinity` | Maximum panel height in pixels. |
| `collapsed` | `boolean` | — | Controlled collapsed state. |
| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state for uncontrolled mode. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | — | Called when collapsed state changes. |
| `onClose` | `() => void` | — | Called when the close button is clicked. |
| `closable` | `boolean` | `true` | Whether to show the close button (requires onClose handler to actually render). |
| `resizable` | `boolean` | `true` | Whether the panel can be resized via the bottom-right corner handle. |
| `panelId` | `string` | — | Unique panel ID for FloatingManager z-index tracking. Auto-generated if not provided. |
| `children` | `ReactNode` | — | Panel body content. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the panel root element. |

### FloatingManager

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `baseZIndex` | `number` | `100` | Base z-index value. Each panel stacks one level above the previous. |
| `children` | `ReactNode` | — | FloatingPanel components to manage. |

## Accessibility

- The panel root has `role="dialog"` with `aria-modal="false"` (non-modal dialog)
- `aria-label` is set to the panel title for screen reader identification
- The collapse toggle button has `aria-label` that updates to "Expand panel" or "Collapse panel"
- The close button has `aria-label="Close panel"`
- Both the collapse and close buttons are keyboard-focusable with `tabIndex={0}`
