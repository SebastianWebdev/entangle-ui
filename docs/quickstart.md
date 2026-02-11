# Quickstart

Get up and running with Entangle UI in under five minutes.

## Installation

```bash
npm install entangle-ui@alpha
```

### Peer Dependencies

Entangle UI requires the following peer dependencies:

```bash
npm install react react-dom @emotion/react @emotion/styled @base-ui/react @floating-ui/react
```

| Package              | Version     |
| -------------------- | ----------- |
| `react`              | `>=19.1.0`  |
| `react-dom`          | `>=19.1.0`  |
| `@emotion/react`     | `^11.0.0`   |
| `@emotion/styled`    | `^11.0.0`   |
| `@base-ui/react`     | `^1.1.0`    |
| `@floating-ui/react` | `^0.27.17`  |

> Entangle UI is ESM-only (`"type": "module"`). Make sure your bundler supports ES modules.

## Basic Setup

Wrap your application root with the `ThemeProvider`. This provides the dark-first theme to all components:

```tsx
import { ThemeProvider } from 'entangle-ui';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

The default dark theme is applied automatically — no extra configuration required.

### With Custom Overrides

```tsx
import { ThemeProvider } from 'entangle-ui';

function App() {
  return (
    <ThemeProvider
      theme={{
        colors: {
          accent: { primary: '#2aa1ff' },
        },
      }}
    >
      <YourApp />
    </ThemeProvider>
  );
}
```

## Your First Component

```tsx
import { Button, Stack, Text } from 'entangle-ui';

function Welcome() {
  return (
    <Stack direction="column" spacing={3} align="center">
      <Text variant="heading">Welcome to Entangle UI</Text>
      <Stack direction="row" spacing={2}>
        <Button variant="default">Cancel</Button>
        <Button variant="filled">Get Started</Button>
      </Stack>
    </Stack>
  );
}
```

## Component Catalog

### Primitives

Basic building blocks for any interface.

| Component        | Description                                         |
| ---------------- | --------------------------------------------------- |
| `Button`         | Primary action trigger with `default`, `ghost`, `filled` variants |
| `IconButton`     | Square button optimized for icon-only actions       |
| `Input`          | Text input with label, icons, error states          |
| `Text`           | Typography component with semantic variants         |
| `Paper`          | Surface container with elevation and nesting        |
| `Icon`           | SVG icon wrapper with consistent sizing             |
| `Checkbox`       | Toggle control with indeterminate state             |
| `CheckboxGroup`  | Managed group of checkboxes                         |
| `Switch`         | Binary toggle switch                                |
| `Tooltip`        | Accessible hover/focus tooltip                      |
| `Popover`        | Floating content anchored to a trigger              |
| `Collapsible`    | Expandable/collapsible content section              |
| `Accordion`      | Multiple collapsible sections with single/multi mode |

### Layout

Composable layout primitives with responsive breakpoints.

| Component        | Description                                |
| ---------------- | ------------------------------------------ |
| `Stack`          | Flex-based stacking with spacing multiplier |
| `Flex`           | Full flexbox control with responsive direction |
| `Grid`           | CSS Grid layout                            |
| `Spacer`         | Empty spacing element                      |
| `ScrollArea`     | Custom-styled scrollbar container          |
| `SplitPane`      | Resizable split panel                      |
| `PanelSurface`   | Panel with header/body/footer slots        |

### Controls

Advanced interactive controls for editor workflows.

| Component        | Description                                     |
| ---------------- | ----------------------------------------------- |
| `Slider`         | Value slider with keyboard and modifier support |
| `NumberInput`    | Numeric input with increment/decrement          |
| `Select`         | Dropdown with groups and search                 |
| `VectorInput`    | Multi-axis numeric input (2D/3D vectors)        |
| `ColorPicker`    | Full color picker with modes and palettes       |
| `ColorSwatch`    | Small color preview                             |
| `ColorPalette`   | Color grid with predefined palette sets         |
| `TreeView`       | Hierarchical data with expand/collapse          |
| `CurveEditor`    | Bezier curve editor with keyframe manipulation  |

### Navigation

| Component        | Description                          |
| ---------------- | ------------------------------------ |
| `Menu`           | Config-driven dropdown menu          |
| `ContextMenu`    | Right-click context menu             |
| `Tabs`           | Tab navigation with `TabList`, `Tab`, `TabPanel` |

### Form

| Component        | Description                            |
| ---------------- | -------------------------------------- |
| `FormLabel`      | Styled form field label                |
| `FormHelperText` | Helper or error message below inputs   |
| `InputWrapper`   | Container for input styling states     |

### Feedback

| Component        | Description                          |
| ---------------- | ------------------------------------ |
| `Dialog`         | Modal dialog with header/body/footer |
| `ToastProvider`  | Toast notification system            |
| `useToast`       | Hook to show toasts programmatically |

### Shell (Application Layout)

Full-application layout components designed for professional editor interfaces.

| Component         | Description                                  |
| ----------------- | -------------------------------------------- |
| `AppShell`        | Root layout with `.MenuBar`, `.Toolbar`, `.Dock`, `.StatusBar` |
| `MenuBar`         | Top-level application menu bar               |
| `Toolbar`         | Action toolbar with buttons, toggles, groups |
| `StatusBar`       | Bottom information bar                       |
| `FloatingPanel`   | Draggable, resizable floating window         |
| `FloatingManager` | Coordinator for multiple floating panels     |

### Editor

| Component          | Description                            |
| ------------------ | -------------------------------------- |
| `PropertyPanel`    | Inspector panel for object properties  |
| `PropertySection`  | Collapsible section within the panel   |
| `PropertyRow`      | Single property key-value display      |
| `PropertyGroup`    | Grouped properties                     |
| `usePropertyUndo`  | Undo/redo hook for property changes    |

## Common Patterns

### Sizing

Most components support a consistent `size` prop:

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>   {/* default */}
<Button size="lg">Large</Button>

<Input size="sm" placeholder="Small input" />
<Slider size="md" min={0} max={100} value={50} />
```

| Size | Typical Height |
| ---- | -------------- |
| `sm` | 20px           |
| `md` | 24px           |
| `lg` | 32px           |

### Responsive Layout

`Stack` and `Flex` support responsive direction changes at four breakpoints:

```tsx
<Stack direction="column" md="row" spacing={2}>
  <Sidebar />
  <Content />
</Stack>
```

| Breakpoint | Width    |
| ---------- | -------- |
| `sm`       | 576px    |
| `md`       | 768px    |
| `lg`       | 992px    |
| `xl`       | 1200px   |

### Form Inputs

Combine `Input` with form components for labeled fields with validation:

```tsx
<Input
  label="Project Name"
  placeholder="My Project"
  helperText="Choose a unique name"
  error={!!nameError}
  errorMessage={nameError}
  required
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

### Application Shell

Build a complete editor layout:

```tsx
import { AppShell, MenuBar, Toolbar, StatusBar, useAppShell } from 'entangle-ui';

function Editor() {
  const appShell = useAppShell();

  return (
    <AppShell>
      <AppShell.MenuBar>
        <MenuBar>{/* menu items */}</MenuBar>
      </AppShell.MenuBar>
      <AppShell.Toolbar>
        <Toolbar>
          <Toolbar.Button icon={<SaveIcon />}>Save</Toolbar.Button>
          <Toolbar.Separator />
          <Toolbar.Toggle icon={<GridIcon />}>Grid</Toolbar.Toggle>
        </Toolbar>
      </AppShell.Toolbar>
      <AppShell.Dock>{/* panels */}</AppShell.Dock>
      <AppShell.StatusBar>
        <StatusBar>
          <StatusBar.Section>Ready</StatusBar.Section>
        </StatusBar>
      </AppShell.StatusBar>
    </AppShell>
  );
}
```

## Deep Imports

Color palettes are available via a dedicated export for better tree-shaking:

```tsx
import { MATERIAL_PALETTE, TAILWIND_PALETTE } from 'entangle-ui/palettes';
```

Available palettes: `MATERIAL_PALETTE`, `TAILWIND_PALETTE`, `PASTEL_PALETTE`, `EARTH_PALETTE`, `NEON_PALETTE`, `MONOCHROME_PALETTE`, `SKIN_TONES_PALETTE`, `VINTAGE_PALETTE`, `PROFESSIONAL_PALETTES`.

## Utilities

```tsx
import { cx, cn } from 'entangle-ui';

// cx — join class names, filtering out falsy values
<div className={cx('base', isActive && 'active', className)} />
```

## TypeScript

All components export their prop types. Utility types are also available:

```tsx
import type {
  Theme,
  Tokens,
  Prettify,
  DeepPartial,
  LiteralUnion,
} from 'entangle-ui';
```

## Next Steps

- [Theming](./theming.md) — customize colors, tokens, and create branded themes
- [Styling](./styling.md) — learn the Vanilla Extract + Emotion styling system
