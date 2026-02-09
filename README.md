# Entangle UI

React + TypeScript component library for building editor-style interfaces.

`entangle-ui` is focused on dense, keyboard-friendly UI patterns used in tools like 3D editors, node editors, scene inspectors, and technical dashboards.

## Status

This package is in alpha (`0.1.0-alpha.x`) and still evolving.

- API can change between alpha releases.
- Use in production only if you are comfortable with rapid iteration.

## Installation

```bash
npm install entangle-ui@alpha
```

Peer dependencies:

- `react >= 19.1.0`
- `react-dom >= 19.1.0`
- `@emotion/react ^11`
- `@emotion/styled ^11`

## Quick Start

```tsx
import React from 'react';
import { ThemeProvider, AppShell, MenuBar, Toolbar, StatusBar } from 'entangle-ui';

export function App() {
  return (
    <ThemeProvider>
      <div style={{ width: '100vw', height: '100vh' }}>
        <AppShell>
          <AppShell.MenuBar>
            <MenuBar>
              <MenuBar.Menu label="File">
                <MenuBar.Item onClick={() => {}}>New</MenuBar.Item>
              </MenuBar.Menu>
            </MenuBar>
          </AppShell.MenuBar>

          <AppShell.Toolbar>
            <Toolbar aria-label="Main toolbar">
              <Toolbar.Button onClick={() => {}}>Run</Toolbar.Button>
            </Toolbar>
          </AppShell.Toolbar>

          <AppShell.Dock>
            <div style={{ padding: 16 }}>Editor content</div>
          </AppShell.Dock>

          <AppShell.StatusBar>
            <StatusBar>
              <StatusBar.Section>
                <StatusBar.Item>Ready</StatusBar.Item>
              </StatusBar.Section>
            </StatusBar>
          </AppShell.StatusBar>
        </AppShell>
      </div>
    </ThemeProvider>
  );
}
```

## Theming

Entangle UI ships with design tokens and an Emotion-based `ThemeProvider`.

```tsx
import { ThemeProvider, createTheme } from 'entangle-ui';

const theme = createTheme({
  colors: {
    accent: {
      primary: '#2aa1ff',
    },
  },
});

export function Root({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
```

## What Is Included

### Primitives

- `Button`, `IconButton`
- `Input`, `Text`, `Paper`, `Icon`
- `Checkbox`, `CheckboxGroup`, `Switch`
- `Tooltip`, `Popover`, `Collapsible`

### Layout

- `Stack`, `Flex`, `Grid`, `Spacer`
- `Accordion`
- `ScrollArea`
- `SplitPane`, `SplitPanePanel`

### Controls

- `NumberInput`, `Slider`, `Select`, `VectorInput`
- `ColorPicker`, `ColorPalette`, `ColorSwatch`, `EyeDropper`
- `TreeView`
- `CurveEditor` + helpers (`evaluateCurve`, `sampleCurve`, `createLinearCurve`, `domainToCanvas`)

### Navigation

- `Menu`, `useMenu`
- `Tabs`, `TabList`, `Tab`, `TabPanel`

### Shell

- `AppShell`, `useAppShell`
- `MenuBar`
- `Toolbar`
- `StatusBar`
- `FloatingPanel`, `FloatingManager`

### Editor

- `PropertyPanel`, `PropertySection`, `PropertyRow`, `PropertyGroup`
- `usePropertyUndo`

### Feedback and Form

- `Dialog` primitives (`Dialog`, `DialogHeader`, `DialogBody`, `DialogFooter`, `DialogClose`)
- `ToastProvider`, `useToast`
- `FormLabel`, `FormHelperText`, `InputWrapper`

## Development

```bash
npm install
npm run dev            # Storybook
npm run test           # Vitest
npm run lint
npm run type-check
npm run build
```

## Release Workflow

This repository uses Changesets.

```bash
npm run changeset
npm run version-packages
npm run release
```

## Repository

- Source: `https://github.com/SebastianWebdev/entangle-ui`
- Issues: `https://github.com/SebastianWebdev/entangle-ui/issues`

## License

MIT
