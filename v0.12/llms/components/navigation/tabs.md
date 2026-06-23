# Tabs
> Compound tab component for switching between views with underline, pills, and enclosed variants.

Tab component for switching between views within a panel. Uses a compound component pattern with `Tabs`, `TabList`, `Tab`, and `TabPanel`. Supports multiple visual variants, horizontal and vertical orientations, closable tabs, and full keyboard navigation.

**Live Preview**

## Import

```tsx
import { Tabs, TabList, Tab, TabPanel } from 'entangle-ui';
```

## Usage

```tsx
<Tabs defaultValue="properties">
  <TabList>
    <Tab value="properties">Properties</Tab>
    <Tab value="materials">Materials</Tab>
    <Tab value="modifiers">Modifiers</Tab>
  </TabList>
  <TabPanel value="properties">Properties panel content</TabPanel>
  <TabPanel value="materials">Materials panel content</TabPanel>
  <TabPanel value="modifiers">Modifiers panel content</TabPanel>
</Tabs>
```

## Controlled vs Uncontrolled

**Controlled**

```tsx
// Controlled
const [activeTab, setActiveTab] = useState('properties');

<Tabs value={activeTab} onChange={setActiveTab}>
  <TabList>
    <Tab value="properties">Properties</Tab>
    <Tab value="materials">Materials</Tab>
  </TabList>
  <TabPanel value="properties">...</TabPanel>
  <TabPanel value="materials">...</TabPanel>
</Tabs>

// Uncontrolled
<Tabs defaultValue="properties">
  ...
</Tabs>
```

## Variants

### Underline

Bottom border indicator, the default style similar to VS Code tabs.

**Underline**

```tsx
<Tabs variant="underline" defaultValue="scene">
  <TabList>
    <Tab value="scene">Scene</Tab>
    <Tab value="world">World</Tab>
  </TabList>
  <TabPanel value="scene">Scene settings</TabPanel>
  <TabPanel value="world">World settings</TabPanel>
</Tabs>
```

### Pills

Filled background on the active tab.

**Pills**

```tsx
<Tabs variant="pills" defaultValue="edit">
  <TabList>
    <Tab value="edit">Edit</Tab>
    <Tab value="object">Object</Tab>
    <Tab value="sculpt">Sculpt</Tab>
  </TabList>
  <TabPanel value="edit">Edit mode</TabPanel>
  <TabPanel value="object">Object mode</TabPanel>
  <TabPanel value="sculpt">Sculpt mode</TabPanel>
</Tabs>
```

Use `pillsFrame={false}` to remove the surrounding border/background from the pills tab list.

```tsx
<Tabs variant="pills" pillsFrame={false} defaultValue="a">
  ...
</Tabs>
```

### Enclosed

Bordered active tab with a connected panel appearance.

**Enclosed**

```tsx
<Tabs variant="enclosed" defaultValue="output">
  <TabList>
    <Tab value="output">Output</Tab>
    <Tab value="console">Console</Tab>
  </TabList>
  <TabPanel value="output">Output content</TabPanel>
  <TabPanel value="console">Console content</TabPanel>
</Tabs>
```

## Sizes

**Sizes**

```tsx
<Tabs size="sm" defaultValue="a">...</Tabs>
<Tabs size="md" defaultValue="a">...</Tabs>
<Tabs size="lg" defaultValue="a">...</Tabs>
```

| Size | Tab Height | Use case               |
| ---- | ---------- | ---------------------- |
| `sm` | 24px       | Ultra-compact panels   |
| `md` | 28px       | Compact default        |
| `lg` | 32px       | Comfortable navigation |

## Full Width

Make tabs fill the available width equally.

**Full Width**

```tsx
<Tabs fullWidth defaultValue="a">
  <TabList>
    <Tab value="a">Tab A</Tab>
    <Tab value="b">Tab B</Tab>
    <Tab value="c">Tab C</Tab>
  </TabList>
  ...
</Tabs>
```

## Vertical Orientation

**Vertical Orientation**

```tsx
<Tabs orientation="vertical" defaultValue="general">
  <TabList>
    <Tab value="general">General</Tab>
    <Tab value="render">Render</Tab>
    <Tab value="output">Output</Tab>
  </TabList>
  <TabPanel value="general">General settings</TabPanel>
  <TabPanel value="render">Render settings</TabPanel>
  <TabPanel value="output">Output settings</TabPanel>
</Tabs>
```

## Tabs with Icons

**Tabs with Icons**

```tsx
<Tabs defaultValue="scene">
  <TabList>
    <Tab value="scene" icon={<SceneIcon />}>
      Scene
    </Tab>
    <Tab value="render" icon={<RenderIcon />}>
      Render
    </Tab>
  </TabList>
  ...
</Tabs>
```

## Closable Tabs

**Closable Tabs**

```tsx
<Tabs defaultValue="file1">
  <TabList>
    <Tab value="file1" closable onClose={v => closeFile(v)}>
      main.ts
    </Tab>
    <Tab value="file2" closable onClose={v => closeFile(v)}>
      styles.css
    </Tab>
  </TabList>
  ...
</Tabs>
```

## Disabled Tabs

**Disabled Tabs**

```tsx
<Tabs defaultValue="a">
  <TabList>
    <Tab value="a">Active</Tab>
    <Tab value="b" disabled>
      Disabled
    </Tab>
    <Tab value="c">Another</Tab>
  </TabList>
  ...
</Tabs>
```

## Keep Mounted

By default, inactive panels are unmounted. Use `keepMounted` to preserve their state.

**Keep Mounted**

### Per-panel

```tsx
<TabPanel value="editor" keepMounted>
  <CodeEditor /> {/* State preserved when switching tabs */}
</TabPanel>
```

### Cascade from the root

Set `keepMounted` on the `Tabs` root to keep **every** panel mounted at once. Use this when most or all panels host stateful UIs (terminals, code editors, media previews) that would lose session state on remount.

```tsx
<Tabs defaultValue="terminal" keepMounted>
  <TabList>
    <Tab value="terminal">Terminal</Tab>
    <Tab value="editor">Editor</Tab>
    <Tab value="preview">Preview</Tab>
  </TabList>
  <TabPanel value="terminal">
    <Terminal /> {/* xterm.js instance survives tab switches */}
  </TabPanel>
  <TabPanel value="editor">
    <CodeEditor />
  </TabPanel>
  <TabPanel value="preview">
    <PreviewIframe />
  </TabPanel>
</Tabs>
```

Individual panels can opt **out** of the cascade by setting `keepMounted={false}` explicitly:

```tsx
<Tabs defaultValue="a" keepMounted>
  <TabList>
    <Tab value="a">Always alive</Tab>
    <Tab value="b">Heavy — rebuild on switch</Tab>
  </TabList>
  <TabPanel value="a">
    <PersistentUi />
  </TabPanel>
  <TabPanel value="b" keepMounted={false}>
    <ExpensiveTree />
  </TabPanel>
</Tabs>
```

When a panel is mounted but inactive, it is hidden via `display: none` and its `tabIndex` is set to `-1`.

## Props

### Tabs (Root)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Currently active tab value (controlled). |
| `defaultValue` | `string` | — | Default active tab (uncontrolled). |
| `variant` | `'underline' \| 'pills' \| 'enclosed'` | `'underline'` | Visual variant of the tab list. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tab size. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Orientation of the tab list. |
| `fullWidth` | `boolean` | `false` | Whether tabs fill the available width equally. |
| `pillsFrame` | `boolean` | `true` | Whether pills variant renders a framed container. |
| `keepMounted` | `boolean` | `false` | When true, every TabPanel stays mounted even when its tab is not active. Individual panels can opt out by passing keepMounted={false}. |
| `children` | `ReactNode` | — | TabList and TabPanel components. |
| `onChange` | `(value: string) => void` | — | Callback when the active tab changes. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the root element. |

### Tab

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Unique value identifying this tab. Must match a TabPanel value. |
| `children` | `ReactNode` | — | Tab label content. |
| `icon` | `ReactNode` | — | Icon displayed before the label. |
| `disabled` | `boolean` | `false` | Whether this tab is disabled. |
| `closable` | `boolean` | `false` | Whether this tab shows a close button. |
| `onClose` | `(value: string) => void` | — | Callback when the close button is clicked. |
| `className` | `string` | — | Additional CSS class names. |
| `testId` | `string` | — | Test identifier for automated testing. |

### TabPanel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Value matching a Tab value. |
| `children` | `ReactNode` | — | Panel content, only rendered when active. |
| `keepMounted` | `boolean` | — | Whether to keep the panel mounted when inactive (preserves state). When undefined, inherits from the parent Tabs root (default false). |
| `className` | `string` | — | Additional CSS class names. |
| `testId` | `string` | — | Test identifier for automated testing. |

## Accessibility

- Tabs use `role="tablist"`, `role="tab"`, and `role="tabpanel"` with proper ARIA relationships
- `aria-selected` marks the active tab
- `aria-controls` and `aria-labelledby` link tabs to their panels
- `aria-orientation` reflects horizontal or vertical layout
- Keyboard navigation:
  - **Arrow Left/Right** (horizontal) or **Arrow Up/Down** (vertical): Move between tabs
  - **Home/End**: Move to first/last tab
  - **Enter/Space**: Activate the focused tab
- Disabled tabs are skipped during keyboard navigation
- Tab panels are hidden with `display: none` when keepMounted is true and the tab is inactive
